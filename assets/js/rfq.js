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
    initTags();
    initCharCounter();
    initFileUpload();
    checkAuthStatus();
});

function initRFQForm() {
    const form = document.getElementById('rfq-public-form');
    form.addEventListener('submit', handleRFQSubmit);
}

function initTags() {
    const input = document.getElementById('commodity-input');
    const tags = document.querySelectorAll('.rfq-tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            input.value = tag.textContent;
            input.focus();
        });
    });
}

function initCharCounter() {
    const textarea = document.getElementById('description');
    const counter = document.getElementById('char-counter');
    if (!textarea || !counter) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / 1000`;
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
    document.querySelector('.rfq-upload-text').textContent = `Uploaded: ${file.name}`;
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
        showSuccessState(result.rfqNumber || `KVX-${Math.floor(100000 + Math.random() * 900000)}`, rfqData.category || 'General');

    } catch (err) {
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.textContent = "Submit RFQ to All Verified Sellers →";
    }
}

function showSuccessState(refNumber, category) {
    const wrapper = document.getElementById('rfq-form-wrapper');
    const template = document.getElementById('success-template');
    
    if (!wrapper || !template) return;

    // Clear and clone
    wrapper.innerHTML = '';
    const clone = template.content.cloneNode(true);
    
    // Fill dynamic data
    clone.querySelector('#success-cat').textContent = category;
    clone.querySelector('#rfq-ref-number').textContent = refNumber;
    
    wrapper.appendChild(clone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
