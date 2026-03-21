/**
 * Kavex Public RFQ Logic
 */

const COMMODITIES = [
    "Smoked Ginger", "Dried Ginger", "Sliced Ginger",
    "Dried Hibiscus Flower", "Hibiscus Siftings",
    "Cocoa Beans (Grade 1)", "Cocoa Powder", "Cocoa Butter",
    "Raw Cashew Nuts", "Roasted Cashew Nuts",
    "Shea Butter (Unrefined)", "Shea Nuts",
    "Soybeans (Non-GMO)", "Soya Bean Meal",
    "Charcoal (Hardwood)", "Sesame Seeds (White)", "Sesame Seeds (Brown)",
    "Chilli Pepper (Birds Eye)", "Dried Turmeric",
    "Gallstones", "Gum Arabic"
];

let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initRFQForm();
    initAutocomplete();
    initFileUpload();
    checkAuthStatus();
});

function initRFQForm() {
    const form = document.getElementById('rfq-public-form');
    form.addEventListener('submit', handleRFQSubmit);
}

function initAutocomplete() {
    const input = document.getElementById('commodity-input');
    const results = document.getElementById('autocomplete-results');

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        results.innerHTML = '';
        if (!val) {
            results.classList.add('hidden');
            return;
        }

        const matches = COMMODITIES.filter(c => c.toLowerCase().includes(val));
        if (matches.length > 0) {
            matches.forEach(m => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = m;
                item.onclick = () => {
                    input.value = m;
                    results.classList.add('hidden');
                };
                results.appendChild(item);
            });
            results.classList.remove('hidden');
        } else {
            results.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target)) results.classList.add('hidden');
    });
}

function initFileUpload() {
    const zone = document.getElementById('file-drop-zone');
    const input = document.getElementById('rfq-file');

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-active');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-active'));

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-active');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', () => {
        if (input.files.length) handleFile(input.files[0]);
    });
}

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert("Only PDF files are allowed.");
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
    }
    selectedFile = file;
    document.querySelector('.file-upload-zone label span').textContent = `Uploaded: ${file.name}`;
}

async function checkAuthStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        document.getElementById('guest-fields').classList.add('hidden');
        // Pre-fill hidden fields or adjust form required status
        const fields = document.querySelectorAll('#guest-fields input');
        fields.forEach(f => f.removeAttribute('required'));
    }
}

async function handleRFQSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-rfq-btn');
    btn.disabled = true;
    btn.textContent = "Submitting RFQ...";

    const formData = new FormData(e.target);
    const rfqData = Object.fromEntries(formData.entries());

    try {
        let attachmentUrl = null;
        if (selectedFile) {
            const fileName = `specs_${Date.now()}_${selectedFile.name}`;
            const { data, error } = await supabase.storage
                .from('rfq-attachments')
                .upload(fileName, selectedFile);
            
            if (error) throw error;
            attachmentUrl = data.path;
        }

        // Call Netlify Function for Atomic Ghost Registration + RFQ Insert
        const response = await fetch('/.netlify/functions/submit-public-rfq', {
            method: 'POST',
            body: JSON.stringify({
                ...rfqData,
                attachmentUrl
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Submission failed");

        // Success
        showSuccessModal(result.isGuest, result.email);

    } catch (err) {
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.textContent = "Submit RFQ to All Verified Sellers";
    }
}

function showSuccessModal(isGuest, email) {
    const modal = document.getElementById('rfq-success-modal');
    modal.classList.remove('hidden');
    
    const bridge = document.getElementById('reg-bridge');
    if (!isGuest) {
        bridge.innerHTML = `
            <div class="p-2 bg-teal-light rounded">
                <p>Welcome back! You can track this RFQ in your buyer dashboard.</p>
                <a href="/pages/buyer/dashboard.html" class="btn btn-primary w-full mt-1">Go to Dashboard</a>
            </div>
        `;
    } else {
        // Guest: Complete bridge
        document.getElementById('complete-reg-btn').onclick = () => completeBridge(email);
    }
}

async function completeBridge(email) {
    const password = document.getElementById('bridge-password').value;
    if (!password) {
        alert("Please create a password.");
        return;
    }

    const btn = document.getElementById('complete-reg-btn');
    btn.disabled = true;
    btn.textContent = "Setting up account...";

    try {
        // Since account was created as 'ghost' (confirmation pending), 
        // this would trigger a password update / confirmation flow
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) throw error;

        alert("Account setup! Please check your email to confirm.");
        location.href = '/pages/auth/login.html';
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
        btn.textContent = "Complete Account Setup";
    }
}
