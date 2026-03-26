/**
 * Kavex Seller Registration Wizard Logic
 * Handles 6-step navigation, real-time validation, and summary rendering.
 */

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

const BANKS = ["Access Bank", "Access Bank (Diamond)", "Ecobank Nigeria", "Fidelity Bank", "First Bank of Nigeria", "First City Monument Bank", "Globus Bank", "Guaranty Trust Bank", "Heritage Bank", "Keystone Bank", "Kuda Bank", "Moniepoint MFB", "OPay", "PalmPay", "Parallex Bank", "Polaris Bank", "Providus Bank", "Stanic IBTC Bank", "Standard Chartered", "Sterling Bank", "SunTrust Bank", "Titan Trust Bank", "Union Bank of Nigeria", "United Bank for Africa", "Unity Bank", "Wema Bank", "Zenith Bank"];

let currentStep = 1;
const totalSteps = 6;
let formData = JSON.parse(localStorage.getItem('kavex_seller_draft')) || {};

// Step UI Metadata
const stepInfo = {
    1: { title: "Create Your Account", subtitle: "Start with your basic account details" },
    2: { title: "Business Information", subtitle: "Tell us about your company" },
    3: { title: "Verification Documents", subtitle: "Upload your KYB documents — all stored securely" },
    4: { title: "Settlement Account", subtitle: "Where we send your earnings" },
    5: { title: "Set Up Your Store", subtitle: "How buyers will find you on Kavex" },
    6: { title: "Review & Submit", subtitle: "Almost done — review your details" }
};

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
    loadDraft();
});

function initWizard() {
    // Populate Selects
    populateSelect('business_state', NIGERIAN_STATES, 'Select State');
    populateSelect('bank_name', BANKS, 'Select Bank');

    // Input Listeners
    setupInputListeners();

    // Specific Feature Handlers
    setupRealtimeFeatures();

    showStep(currentStep);
}

function populateSelect(id, items, placeholder) {
    const select = document.getElementById(id);
    if (!select) return;
    
    select.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });
}

function setupInputListeners() {
    const inputs = document.querySelectorAll('#wizard-form input, #wizard-form select, #wizard-form textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const { name, value, type, checked } = e.target;
            if (!name) return;

            if (type === 'checkbox') {
                formData[name] = checked;
            } else {
                formData[name] = value;
            }
            saveDraft();
            
            // Check review checkboxes to enable submit
            if (name === 'agree_terms' || name === 'confirm_authentic') {
                updateSubmitState();
            }
        });
    });
}

function setupRealtimeFeatures() {
    // Password Strength
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.addEventListener('input', (e) => updatePasswordStrength(e.target.value));
    }

    // Store Slug
    const storeNameInput = document.getElementById('store_name');
    if (storeNameInput) {
        storeNameInput.addEventListener('input', (e) => generateSlug(e.target.value));
    }

    // Char Counter
    const descInput = document.getElementById('description');
    if (descInput) {
        descInput.addEventListener('input', (e) => {
            document.getElementById('char-counter').textContent = `${e.target.value.length} / 500`;
        });
    }

    // Masked BVN
    const bvnInput = document.getElementById('bvn');
    if (bvnInput) {
        bvnInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            formData.bvn = val;
        });
    }

    // Account Verification Mock
    const accNumInput = document.getElementById('account_number');
    const bankSelect = document.getElementById('bank_name');
    if (accNumInput && bankSelect) {
        const triggerVerif = () => {
            if (accNumInput.value.length === 10 && bankSelect.value) {
                verifyAccount();
            }
        };
        accNumInput.addEventListener('input', triggerVerif);
        bankSelect.addEventListener('change', triggerVerif);
    }
}

/** Navigation Functions **/

function showStep(n) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    
    // Show target step
    const targetStep = document.getElementById(`step-${n}`);
    if (targetStep) targetStep.classList.add('active');

    // Update Header
    document.getElementById('step-counter').textContent = `Step ${n} of 6`;
    document.getElementById('step-title').textContent = stepInfo[n].title;
    document.getElementById('step-subtitle').textContent = stepInfo[n].subtitle;

    // Update Progress Bar
    const progress = (n / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    // Update Dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        dot.classList.remove('active', 'completed');
        if (idx + 1 < n) dot.classList.add('completed');
        if (idx + 1 === n) dot.classList.add('active');
    });

    // Update Buttons
    const backBtn = document.getElementById('btn-back');
    const contBtn = document.getElementById('btn-continue');
    
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    
    if (n === totalSteps) {
        contBtn.style.display = 'none';
        renderSummary();
    } else {
        contBtn.style.display = 'block';
        contBtn.textContent = 'Continue →';
    }

    currentStep = n;
    document.getElementById('wizard-right-panel').scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function validateStep(n) {
    const stepEl = document.getElementById(`step-${n}`);
    const requiredFields = stepEl.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value || (field.type === 'checkbox' && !field.checked)) {
            field.style.borderColor = '#DC2626';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });

    if (!isValid) return false;

    // Custom validations
    if (n === 1) {
        const pass = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;
        if (pass.length < 8) return alert("Password must be at least 8 characters"), false;
        if (pass !== confirm) return alert("Passwords do not match"), false;
    }

    if (n === 3) {
        const bvn = document.getElementById('bvn').value;
        if (bvn && bvn.length !== 11) return alert("BVN must be 11 digits"), false;
    }

    return true;
}

/** Feature Implementations **/

function updatePasswordStrength(val) {
    const segments = document.querySelectorAll('.strength-segment');
    const label = document.getElementById('strength-label');
    let strength = 0;

    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    segments.forEach((seg, i) => {
        if (i < strength) {
            seg.style.background = strength === 1 ? '#DC2626' : (strength === 2 ? '#F59E0B' : (strength === 3 ? '#EAB308' : '#10B981'));
        } else {
            seg.style.background = '';
        }
    });

    const labels = ["Weak", "Fair", "Strong", "Very Strong"];
    label.textContent = val.length > 0 ? labels[strength - 1] || "Weak" : "Password strength";
}

function generateSlug(name) {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    document.getElementById('store_slug').value = slug;
    formData.store_slug = slug;
}

async function verifyAccount() {
    const input = document.getElementById('account_name');
    input.value = "Verifying account...";
    input.classList.add('text-muted');

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    input.value = (formData.full_name || "BUSINESS ACCOUNT") + " - VERIFIED";
    input.classList.remove('text-muted');
    input.style.color = '#1D9E75';
    input.style.fontWeight = '600';
}

function renderSummary() {
    const container = document.getElementById('summary-card');
    const sections = [
        {
            id: 1,
            title: "Account Details",
            fields: [
                { label: "Full Name", value: formData.full_name },
                { label: "Email", value: formData.email },
                { label: "Phone", value: formData.phone }
            ]
        },
        {
            id: 2,
            title: "Business Info",
            fields: [
                { label: "Company", value: formData.business_name },
                { label: "Industry", value: formData.industry },
                { label: "Location", value: `${formData.business_city}, ${formData.business_state}` }
            ]
        },
        {
            id: 4,
            title: "Settlement",
            fields: [
                { label: "Bank", value: formData.bank_name },
                { label: "Account", value: formData.account_number }
            ]
        },
        {
            id: 5,
            title: "Storefront",
            fields: [
                { label: "Store Name", value: formData.store_name },
                { label: "URL Slug", value: formData.store_slug }
            ]
        }
    ];

    container.innerHTML = sections.map(s => `
        <div class="summary-section">
            <div class="summary-header">
                <h4>${s.title}</h4>
                <a href="#" class="edit-link" onclick="showStep(${s.id}); return false;">Edit</a>
            </div>
            ${s.fields.map(f => `
                <div class="summary-row">
                    <div class="summary-label">${f.label}</div>
                    <div class="summary-value">${f.value || 'None'}</div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function updateSubmitState() {
    const agree = document.getElementById('agree_terms').checked;
    const confirm = document.getElementById('confirm_authentic').checked;
    document.getElementById('final-submit-btn').disabled = !(agree && confirm);
}

async function handleFinalSubmit() {
    const btn = document.getElementById('final-submit-btn');
    btn.disabled = true;
    btn.textContent = "Processing Application...";

    // Mock total submit
    await new Promise(r => setTimeout(r, 2000));

    // Clear draft
    localStorage.removeItem('kavex_seller_draft');

    // Show Success
    document.getElementById('wizard-form').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('step-header').style.display = 'none';
    
    // Generate random reference
    const ref = 'KVX-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('ref-number').textContent = ref;
    
    document.getElementById('success-screen').style.display = 'block';
}

/** Draft Persistence **/
function saveDraft() {
    localStorage.setItem('kavex_seller_draft', JSON.stringify(formData));
}

function loadDraft() {
    Object.entries(formData).forEach(([key, value]) => {
        const el = document.getElementsByName(key)[0] || document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = value;
            else el.value = value;
        }
    });

    // Run specific updates
    if (formData.password) updatePasswordStrength(formData.password);
    if (formData.description) document.getElementById('char-counter').textContent = `${formData.description.length} / 500`;
}
