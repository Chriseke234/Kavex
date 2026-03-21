/**
 * Kavex Seller Registration Wizard Logic
 */

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

const BANKS = ["Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank", "Fidelity Bank", "Sterling Bank", "Polaris Bank", "Kuda Bank", "OPay", "PalmPay", "Moniepoint", "Carbon", "VFD Microfinance"];

let currentStep = 1;
const totalSteps = 6;
let wizardData = JSON.parse(localStorage.getItem('kavex_seller_draft')) || {};

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
    loadDraft();
});

function initWizard() {
    // Populate States
    const stateSelect = document.querySelector('#business-state');
    if (stateSelect) {
        NIGERIAN_STATES.forEach(state => {
            const opt = document.createElement('option');
            opt.value = state;
            opt.textContent = state;
            stateSelect.appendChild(opt);
        });
    }

    // Populate Banks
    const bankSelect = document.querySelector('#bank-name');
    if (bankSelect) {
        BANKS.forEach(bank => {
            const opt = document.createElement('option');
            opt.value = bank;
            opt.textContent = bank;
            bankSelect.appendChild(opt);
        });
    }

    // Event Listeners for inputs
    document.querySelectorAll('.wizard-step input, .wizard-step select, .wizard-step textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const { name, value, type, checked } = e.target;
            if (!name) return; // Skip inputs without names (e.g. confirm password)

            if (type === 'checkbox') {
                if (!wizardData[name]) wizardData[name] = [];
                if (checked) wizardData[name].push(value);
                else wizardData[name] = wizardData[name].filter(v => v !== value);
            } else {
                wizardData[name] = value;
            }
            saveDraft();
            
            // Real-time validations
            if (name === 'password') updatePasswordStrength(value);
            if (name === 'store_name') updateStoreSlug(value);
            if (name === 'description') updateCharCounter(value);
        });
    });

    showStep(currentStep);
}

function showStep(n) {
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.querySelector(`#step-${n}`).classList.add('active');
    
    // Update markers
    document.querySelectorAll('.step-marker').forEach((marker, idx) => {
        marker.classList.remove('active', 'completed');
        if (idx + 1 < n) marker.classList.add('completed');
        if (idx + 1 === n) marker.classList.add('active');
    });

    // Update Progress Bar
    const progress = ((n - 1) / (totalSteps - 1)) * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;

    currentStep = n;
    window.scrollTo(0, 0);

    if (n === 6) renderSummary();
}

function nextStep() {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
}

function validateStep(n) {
    const currentStepEl = document.querySelector(`#step-${n}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value || (field.type === 'checkbox' && !field.checked)) {
            field.closest('.form-group')?.classList.add('error-state');
            isValid = false;
        } else {
            field.closest('.form-group')?.classList.remove('error-state');
        }
    });

    if (!isValid) {
        alert("Please fill in all required fields.");
        return false;
    }

    // Specific Validations
    if (n === 1) {
        const email = document.querySelector('[name="email"]').value;
        const pass = document.querySelector('#password').value;
        const confirm = document.querySelector('#confirm-password').value;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid business email.");
            return false;
        }

        if (pass.length < 8) {
            alert("Password must be at least 8 characters.");
            return false;
        }

        if (pass !== confirm) {
            alert("Passwords do not match.");
            return false;
        }
    }

    if (n === 3) {
        const bvn = document.querySelector('#bvn').value;
        if (bvn && bvn.length !== 11) {
            alert("BVN must be exactly 11 digits.");
            return false;
        }
    }

    return isValid;
}

function saveDraft() {
    localStorage.setItem('kavex_seller_draft', JSON.stringify(wizardData));
}

function loadDraft() {
    Object.entries(wizardData).forEach(([key, value]) => {
        const input = document.querySelector(`[name="${key}"], #[id="${key}"]`);
        if (!input) return;

        if (input.type === 'checkbox') {
            input.checked = value === true || (Array.isArray(wizardData[key]) && wizardData[key].includes(input.value));
        } else if (input.tagName === 'SELECT') {
            // For selects, we might need a delay if they are populated via JS
            setTimeout(() => {
                input.value = value;
            }, 100);
        } else {
            input.value = value;
        }
    });
    
    // Sync UI elements
    if (wizardData.password) updatePasswordStrength(wizardData.password);
    if (wizardData.description) updateCharCounter(wizardData.description);
}

// Helpers
function updatePasswordStrength(val) {
    const bar = document.querySelector('.strength-bar');
    if (!bar) return;
    let strength = 0;
    if (val.length > 5) strength += 25;
    if (val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^A-Za-z0-9]/)) strength += 25;
    
    bar.style.width = strength + '%';
    if (strength < 50) bar.style.background = '#DC2626';
    else if (strength < 100) bar.style.background = '#F59E0B';
    else bar.style.background = '#10B981';
}

function updateStoreSlug(name) {
    const slugInput = document.querySelector('[name="store_slug"]');
    if (slugInput) {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        slugInput.value = slug;
        wizardData.store_slug = slug;
    }
}

function updateCharCounter(val) {
    const counter = document.querySelector('#char-counter');
    if (counter) counter.textContent = `${val.length} / 500`;
}

function renderSummary() {
    const container = document.querySelector('#summary-content');
    if (!container) return;

    const sections = [
        {
            title: "Account & Identity",
            items: [
                { label: "Full Name", value: wizardData.full_name },
                { label: "Business Email", value: wizardData.email },
                { label: "Phone", value: wizardData.phone }
            ]
        },
        {
            title: "Business Details",
            items: [
                { label: "Company", value: wizardData.business_name },
                { label: "Type", value: wizardData.business_type },
                { label: "Industry", value: wizardData.industry },
                { label: "Location", value: `${wizardData.business_city || ''}, ${wizardData.business_state || ''}` },
                { label: "CAC Reg", value: wizardData.cac_number }
            ]
        },
        {
            title: "Storefront Info",
            items: [
                { label: "Store Name", value: wizardData.store_name },
                { label: "Slug", value: wizardData.store_slug }
            ]
        }
    ];

    container.innerHTML = sections.map(section => `
        <div class="summary-section">
            <h4>${section.title}</h4>
            <div class="summary-grid">
                ${section.items.map(item => `
                    <div class="summary-item">
                        <label>${item.label}</label>
                        <span>${item.value || '<span class="text-error">Missing</span>'}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function handleFileUpload(input, bucket) {
    const file = input.files[0];
    if (!file) return;

    // Show preview logic...
    const preview = input.parentElement.querySelector('.file-preview-name');
    if (preview) preview.textContent = file.name;

    // In a real app, you'd upload here if you want it prior to final submit
    // For now, we'll collect files and upload in submitWizard()
}

async function submitWizard() {
    const btn = document.querySelector('#submit-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        // 1. Sign Up
        const res = await window.kavexAuth.signUpSeller(
            wizardData.email, 
            wizardData.password, 
            wizardData.full_name, 
            wizardData.business_name, 
            wizardData.phone
        );

        if (!res.success) throw new Error(res.error);

        // 2. Upload Files (MOCKED for now as we need real files)
        // const { data, error } = await supabase.storage.from('kyb-documents').upload(path, file);

        // 3. Update Detailed Seller Profiles (Year Est, Employees, Address, Bank, etc.)
        // This would be another Supabase call update to finish the wizard data
        
        localStorage.removeItem('kavex_seller_draft');
        document.querySelector('#wizard-form').style.display = 'none';
        document.querySelector('#success-screen').style.display = 'block';

    } catch (err) {
        alert("Submission Failed: " + err.message);
        btn.disabled = false;
        btn.textContent = 'Submit Application';
    }
}
