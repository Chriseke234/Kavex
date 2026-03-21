/**
 * Kavex Buyer Registration Logic
 */

const COUNTRIES = [
    { name: "Nigeria", code: "+234" },
    { name: "United States", code: "+1" },
    { name: "United Kingdom", code: "+44" },
    { name: "Ghana", code: "+233" },
    { name: "Kenya", code: "+254" },
    { name: "South Africa", code: "+27" },
    { name: "China", code: "+86" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Canada", code: "+1" },
    { name: "India", code: "+91" },
    { name: "United Arab Emirates", code: "+971" }
    // More to be added or fetched from API
];

const B2B_INDUSTRIES = ["Agriculture & Food", "Textiles & Apparel", "Industrial Hardware", "Electronics & ICT", "Construction & Real Estate", "Chemicals & Plastics", "Automotive & Parts", "Beauty & Personal Care", "Home & Furniture", "Healthcare & Medical", "Logistics & Transport", "Energy & Mining", "Office & School Supplies", "Packaging & Printing", "Security & Protection", "Gifts & Crafts", "Sports & Entertainment", "Machinery", "Tools & Hardware", "Other"];

const SOURCING_CATEGORIES = ["Raw Ginger", "Cocoa Beans", "Cashew Nuts", "Sesame Seeds", "Hibiscus Flowers", "Textiles", "Leather Goods", "Fashion Accessories", "Skin Care", "Hair Care", "Food & Beverages", "Solid Minerals", "Scrap Metal", "Wood & Timber", "Handicrafts"];

let currentStep = 1;
const totalSteps = 3;
let buyerData = JSON.parse(localStorage.getItem('kavex_buyer_draft')) || {
    industries: [],
    sourcing_categories: [],
    payment_methods: [],
    shipping_methods: [],
    currencies: []
};

document.addEventListener('DOMContentLoaded', () => {
    initBuyerWizard();
    loadBuyerDraft();
});

function initBuyerWizard() {
    // Populate Countries
    const countrySelect = document.querySelector('#country-select');
    const dialCodeSelect = document.querySelector('#dial-code-select');
    
    if (countrySelect) {
        COUNTRIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            countrySelect.appendChild(opt);
            
            const dialOpt = document.createElement('option');
            dialOpt.value = c.code;
            dialOpt.textContent = `${c.name} (${c.code})`;
            dialCodeSelect.appendChild(dialOpt);
        });
    }

    // Populate Categories (Step 2)
    const catContainer = document.querySelector('#sourcing-categories-grid');
    if (catContainer) {
        SOURCING_CATEGORIES.forEach(cat => {
            const label = document.createElement('label');
            label.className = 'checkbox-pill';
            label.innerHTML = `<input type="checkbox" name="sourcing_categories" value="${cat}"> <span>${cat}</span>`;
            catContainer.appendChild(label);
        });
    }

    // Event Listeners
    document.querySelectorAll('.wizard-step input, .wizard-step select, .wizard-step textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const { name, value, type, checked } = e.target;
            
            if (type === 'checkbox') {
                if (!Array.isArray(buyerData[name])) buyerData[name] = [];
                if (checked) buyerData[name].push(value);
                else buyerData[name] = buyerData[name].filter(v => v !== value);
            } else if (type === 'radio') {
                if (checked) buyerData[name] = value;
            } else {
                buyerData[name] = value;
            }
            saveBuyerDraft();
        });
    });

    showStep(currentStep);
}

function showStep(n) {
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.querySelector(`#step-${n}`).classList.add('active');
    
    // Update labels and progress
    document.querySelectorAll('.step-marker').forEach((marker, idx) => {
        marker.classList.remove('active', 'completed');
        if (idx + 1 < n) marker.classList.add('completed');
        if (idx + 1 === n) marker.classList.add('active');
    });

    const progress = ((n - 1) / (totalSteps - 1)) * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;

    currentStep = n;
    window.scrollTo(0, 0);
}

function nextStep() {
    if (validateBuyerStep(currentStep)) {
        if (currentStep < totalSteps) showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
}

function validateBuyerStep(n) {
    const currentStepEl = document.querySelector(`#step-${n}`);
    const requiredInputs = currentStepEl.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (!input.value) {
            input.parentElement.classList.add('has-error');
            isValid = false;
        } else {
            input.parentElement.classList.remove('has-error');
        }
    });

    if (n === 1) {
        const pass = document.querySelector('#password').value;
        const confirm = document.querySelector('#confirm-password').value;
        if (pass !== confirm) {
            alert("Passwords do not match");
            return false;
        }
    }

    return isValid;
}

function saveBuyerDraft() {
    localStorage.setItem('kavex_buyer_draft', JSON.stringify(buyerData));
}

function loadBuyerDraft() {
    for (const [key, value] of Object.entries(buyerData)) {
        const inputs = document.querySelectorAll(`[name="${key}"]`);
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = value.includes(input.value);
            } else if (input.type === 'radio') {
                input.checked = (input.value === value);
            } else {
                input.value = value;
            }
        });
    }
}

async function submitBuyerWizard() {
    const btn = document.querySelector('#submit-btn');
    btn.disabled = true;
    btn.textContent = 'Joining Kavex...';

    try {
        const fullName = buyerData.full_name;
        const email = buyerData.email;
        const password = buyerData.password;
        const businessName = buyerData.business_name;
        const phone = (buyerData.dial_code || '+234') + buyerData.phone;
        const country = buyerData.country;

        // Metadata for profile
        const metadata = {
            industry: buyerData.industry,
            purchasing_budget: buyerData.budget,
            sourcing_categories: buyerData.sourcing_categories,
            preferred_payment: buyerData.payment_methods,
            preferred_shipping: buyerData.shipping_methods,
            preferred_currencies: buyerData.currencies
        };

        const res = await window.kavexAuth.signUpBuyer(email, password, fullName, businessName, phone, country, metadata);

        if (!res.success) throw new Error(res.error);

        localStorage.removeItem('kavex_buyer_draft');
        document.querySelector('#wizard-form').style.display = 'none';
        document.querySelector('#success-screen').style.display = 'block';

    } catch (err) {
        alert("Registration Failed: " + err.message);
        btn.disabled = false;
        btn.textContent = 'Submit Application';
    }
}
