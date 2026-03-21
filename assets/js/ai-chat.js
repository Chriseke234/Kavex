/**
 * Kavex AI Trade Assistant
 */

let chatHistory = JSON.parse(localStorage.getItem('kavex_chat_history') || '[]');
let rateLimit = JSON.parse(localStorage.getItem('kavex_chat_limit') || '{"count": 0, "resetAt": 0}');

const QUICK_REPLIES = [
    "Find a supplier", "Get a price quote", "Track my order", "Speak to human"
];

const SELLER_TOOLS = [
    "AI Listing Writer", "RFQ Responder", "Pricing Advisor", "Performance Coach"
];

document.addEventListener('DOMContentLoaded', () => {
    initChatUI();
    loadHistory();
    checkRateLimit();
});

function initChatUI() {
    const container = document.createElement('div');
    container.id = 'ai-chat-container';
    container.innerHTML = `
        <div class="ai-chat-launcher" id="chat-launcher">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <div class="notif-dot"></div>
        </div>

        <div class="ai-chat-panel" id="chat-panel">
            <div class="ai-chat-header" id="chat-header">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="fw-bold">Trade Assistant</div>
                        <div class="header-status">
                            <span class="status-dot"></span>
                            Powered by Claude · Online 24/7
                        </div>
                    </div>
                    <button class="btn btn-ghost btn-xs text-white" id="close-chat">✕</button>
                </div>
            </div>

            <div class="ai-chat-messages" id="chat-messages">
                <div class="msg ai">
                    Hello! I'm your Kavex Trade Assistant. I can help you find verified suppliers, track orders, or explain our escrow protection. How can I help you today?
                </div>
            </div>

            <div class="quick-replies" id="quick-replies"></div>

            <div class="ai-chat-input-area">
                <div class="char-counter"><span id="char-count">0</span> / 500</div>
                <div class="input-container">
                    <textarea id="chat-input" placeholder="Type your message..." rows="1" maxlength="500"></textarea>
                    <button class="btn btn-primary btn-xs" id="send-btn">Send</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Event Listeners
    const launcher = document.getElementById('chat-launcher');
    const panel = document.getElementById('chat-panel');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    launcher.onclick = () => {
        panel.classList.toggle('open');
        input.focus();
    };

    document.getElementById('close-chat').onclick = () => panel.classList.remove('open');

    input.oninput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        document.getElementById('char-count').textContent = e.target.value.length;
    };

    input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    sendBtn.onclick = sendMessage;

    renderQuickReplies();
    setupSellerMode();
}

function renderQuickReplies() {
    const container = document.getElementById('quick-replies');
    container.innerHTML = QUICK_REPLIES.map(q => `<div class="chip" onclick="handleChipClick('${q}')">${q}</div>`).join('');
}

function setupSellerMode() {
    const isDashboard = window.location.pathname.includes('seller/dashboard');
    // Mock check for seller role from kavexAuth
    if (isDashboard) {
        document.getElementById('chat-header').classList.add('seller-mode');
        const container = document.getElementById('quick-replies');
        container.innerHTML = SELLER_TOOLS.map(t => `<div class="chip" onclick="handleChipClick('${t}')">${t}</div>`).join('');
    }
}

function handleChipClick(text) {
    document.getElementById('chat-input').value = text;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    if (rateLimit.count >= 20 && Date.now() < rateLimit.resetAt) {
        addMessage(`Rate limit reached. Try again after ${new Date(rateLimit.resetAt).toLocaleTimeString()}`, 'ai');
        return;
    }

    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    
    // Add typing indicator
    const typing = document.createElement('div');
    typing.className = 'msg ai typing-container';
    typing.innerHTML = `<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
    document.getElementById('chat-messages').appendChild(typing);
    scrollToBottom();

    // Context Building
    const profile = window.kavexAuth?.currentUser;
    const sysPrompt = `You are the AI Trade Assistant for Kavex, Africa's B2B marketplace. 
        User: ${profile?.user_metadata?.full_name || 'Guest'} (${profile?.user_metadata?.role || 'visitor'}). 
        Page: ${window.location.pathname}. 
        Prices: Sesame ₦750k/T, Cashew ₦400k/T, Ginger ₦800k/T, Palm Oil ₦350k/T, Cocoa ₦1.1M/T. 
        Direct urgent issues to support@kavex.com. Keep under 150 words.`;

    try {
        const response = await fetch('/.netlify/functions/claude-proxy', {
            method: 'POST',
            body: JSON.stringify({
                messages: [...chatHistory.slice(-7), { role: 'user', content: text }],
                systemPrompt: sysPrompt
            })
        });

        document.querySelector('.typing-container').remove();
        
        const aiMsg = document.createElement('div');
        aiMsg.className = 'msg ai';
        document.getElementById('chat-messages').appendChild(aiMsg);
        
        // Streaming handler
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            // In SSE, chunks come as "data: { ... }"
            // For simplicity in this proxy setup, let's treat chunks as raw text
            fullText += chunk;
            aiMsg.textContent = fullText;
            scrollToBottom();
        }
        
        // Update history
        chatHistory.push({ role: 'user', content: text });
        chatHistory.push({ role: 'assistant', content: fullText });
        if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);
        localStorage.setItem('kavex_chat_history', JSON.stringify(chatHistory));

        // Update rate limit
        rateLimit.count++;
        if (rateLimit.resetAt === 0) rateLimit.resetAt = Date.now() + 3600000;
        localStorage.setItem('kavex_chat_limit', JSON.stringify(rateLimit));

    } catch (err) {
        document.querySelector('.typing-container')?.remove();
        addMessage("Sorry, I encountered an error. Please try again later.", 'ai');
    }
}

function addMessage(text, role) {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;
    msg.textContent = text;
    container.appendChild(msg);
    scrollToBottom();
}

function loadHistory() {
    chatHistory.forEach(m => addMessage(m.content, m.role === 'assistant' ? 'ai' : 'user'));
}

function checkRateLimit() {
    if (Date.now() > rateLimit.resetAt) {
        rateLimit = { count: 0, resetAt: 0 };
        localStorage.setItem('kavex_chat_limit', JSON.stringify(rateLimit));
    }
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}
