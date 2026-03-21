/**
 * Kavex AI Listing Generator Logic
 */

const WIZARD_QUESTIONS = [
    {
        id: 'basic',
        q: "What is your product and where is it from?",
        chips: ["Smoked Ginger (Kaduna)", "Dried Hibiscus (Kano)", "Cocoa Beans (Ondo)", "Cashew Nuts (Ogbomosho)", "Shea Butter (Kwara)"]
    },
    {
        id: 'category',
        q: "Which category does it belong to?",
        chips: ["Agriculture", "Textiles", "Machinery", "Industrial", "Beauty", "Fashion", "Raw Materials", "Electronics"],
        subQ: "Is this for Export, Domestic, or Both?"
    },
    {
        id: 'specs',
        q: "Tell me about the quality and specifications — grade, certifications, moisture content, etc."
    },
    {
        id: 'packaging',
        q: "Packaging details? (Type and size)",
        chips: ["50kg Jute Bags", "25kg Cartons", "Bulk (Loose)", "Plastic Drums", "Bales"]
    },
    {
        id: 'pricing',
        q: "What is your target price per unit? (Mention if you have bulk discounts)",
        chips: ["NGN (Naira)", "USD (Dollars)"]
    },
    {
        id: 'extra',
        q: "Any extra details? Lead time, sample availability, export experience?",
        chips: ["Can provide samples", "Export ready", "Shipping arranged"]
    }
];

let currentStep = 0;
let answers = {};
let generatedData = null;

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
});

function initWizard() {
    const nextBtn = document.getElementById('wizard-next-btn');
    const input = document.getElementById('wizard-input');

    if (nextBtn) nextBtn.onclick = handleAnswer;
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') handleAnswer();
        };
    }

    // Check for existing draft
    const draft = localStorage.getItem('kavex_listing_draft');
    if (draft) {
        // Option to resume (simplified)
        console.log("Found draft:", JSON.parse(draft));
    }

    renderQuestion();
}

function renderQuestion() {
    const wizardMessages = document.getElementById('wizard-messages');
    const stepText = document.getElementById('wizard-step-text');
    const progress = document.getElementById('wizard-progress');
    const chipContainer = document.getElementById('wizard-chips');

    const step = WIZARD_QUESTIONS[currentStep];
    stepText.textContent = `Step ${currentStep + 1} of 6`;
    progress.style.width = `${((currentStep + 1) / 6) * 100}%`;

    addBubble(step.q, 'ai');
    
    // Render Chips
    chipContainer.innerHTML = '';
    if (step.chips) {
        step.chips.forEach(c => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = c;
            chip.onclick = () => {
                document.getElementById('wizard-input').value = c;
                handleAnswer();
            };
            chipContainer.appendChild(chip);
        });
    }
}

function addBubble(text, role) {
    const container = document.getElementById('wizard-messages');
    const bubble = document.createElement('div');
    bubble.className = `wizard-msg ${role}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function handleAnswer() {
    const input = document.getElementById('wizard-input');
    const val = input.value.trim();
    if (!val) return;

    addBubble(val, 'user');
    answers[WIZARD_QUESTIONS[currentStep].id] = val;
    input.value = '';

    currentStep++;
    if (currentStep < WIZARD_QUESTIONS.length) {
        setTimeout(renderQuestion, 500);
    } else {
        generateListing();
    }
    
    // Auto-update simple preview bits
    updatePreviewPartial();
}

function updatePreviewPartial() {
    if (answers.basic) document.getElementById('preview-title').textContent = answers.basic;
    if (answers.specs) document.getElementById('preview-desc').textContent = answers.specs;
}

async function generateListing() {
    addBubble("Great! Analyzing your product details now...", 'ai');
    
    const loadingTexts = [
        "Writing your description...",
        "Generating SEO title...",
        "Setting up pricing tiers...",
        "Almost ready..."
    ];

    let lIndex = 0;
    const interval = setInterval(() => {
        if (lIndex < loadingTexts.length) {
            addBubble(loadingTexts[lIndex], 'ai');
            lIndex++;
        } else {
            clearInterval(interval);
        }
    }, 1500);

    // Call Claude
    const sysPrompt = `You are an expert B2B Listing Generator for Kavex. Return ONLY valid JSON for a product listing.
    Required format: {
        "seoTitle": "max 80 chars",
        "shortDescription": "2-3 sentences",
        "fullDescription": "4 paragraphs",
        "category": "matching Kavex cat",
        "tags": ["item1", "item2"...],
        "pricingTiers": [{"minQty": 1, "maxQty": 10, "unitPrice": 500, "currency": "NGN"}],
        "moq": 10,
        "leadTime": "7-14 days",
        "exportReady": true,
        "sampleAvailable": true,
        "keyBuyerBenefits": ["benefit 1"...],
        "suggestedCertifications": ["ISO"...]
    }`;

    try {
        const response = await fetch('/.netlify/functions/claude-proxy', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', content: `Generate B2B listing from these answers: ${JSON.stringify(answers)}` }],
                systemPrompt: sysPrompt
            })
        });

        const raw = await response.text();
        // Extract JSON if Claude added text
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid AI response");
        
        generatedData = JSON.parse(jsonMatch[0]);
        displayResults();
    } catch (err) {
        addBubble("Sorry, AI generation failed. Let me load the manual form for you.", 'ai');
        setTimeout(openManualProductForm, 2000);
    }
}

function displayResults() {
    // 50ms delayed filling animation
    document.getElementById('preview-title').textContent = generatedData.seoTitle;
    document.getElementById('preview-desc').textContent = generatedData.shortDescription;
    document.getElementById('preview-amount').textContent = generatedData.pricingTiers[0]?.unitPrice || '0.00';
    document.getElementById('preview-currency').textContent = generatedData.pricingTiers[0]?.currency === 'USD' ? '$' : '₦';

    // Calculate Quality Score (fake logic for demo)
    let score = 65;
    if (generatedData.fullDescription.length > 200) score += 15;
    if (generatedData.exportReady) score += 10;
    if (generatedData.sampleAvailable) score += 10;

    const qualityTag = document.getElementById('preview-quality');
    qualityTag.textContent = `Quality: ${score}%`;
    
    // Dynamic Color Shift
    const color = score >= 80 ? '#2ecc71' : (score > 60 ? '#f1c40f' : '#e74c3c');
    qualityTag.style.background = color;
    qualityTag.style.color = 'white';

    // Quality Suggestions based on missing data
    const sugList = document.getElementById('quality-suggestions');
    sugList.innerHTML = '';
    const tips = [];
    if (!generatedData.exportReady) tips.push("Declare export readiness to attract international buyers");
    if (!generatedData.sampleAvailable) tips.push("Offering samples increases trust by 40%");
    if (generatedData.fullDescription.length < 300) tips.push("Add more technical specs (moisture, grade)");
    if (generatedData.keyBuyerBenefits.length < 3) tips.push("Highlight more unique selling points");

    tips.forEach(t => {
        const li = document.createElement('li');
        li.textContent = `• ${t}`;
        sugList.appendChild(li);
    });

    document.getElementById('post-gen-actions').classList.remove('hidden');
    
    localStorage.setItem('kavex_listing_draft', JSON.stringify({ answers, generatedData }));
    
    // Use addEventListener to prevent double binding
    const publishBtn = document.getElementById('publish-ai-product');
    publishBtn.replaceWith(publishBtn.cloneNode(true)); // Clear existing
    document.getElementById('publish-ai-product').addEventListener('click', publishProduct);
}

async function publishProduct() {
    const btn = document.getElementById('publish-ai-product');
    btn.disabled = true;
    btn.textContent = "Publishing...";

    try {
        const user = (await supabase.auth.getUser()).data.user;
        const sellerId = user.id;

        // 1. Insert Product
        const { data: product, error: pError } = await supabase
            .from('products')
            .insert([{
                seller_id: sellerId,
                title: generatedData.seoTitle,
                description: generatedData.fullDescription,
                short_description: generatedData.shortDescription,
                category: generatedData.category,
                moq: generatedData.moq,
                status: 'pending',
                export_ready: generatedData.exportReady,
                sample_available: generatedData.sampleAvailable
            }])
            .select()
            .single();

        if (pError) throw pError;

        // 2. Insert Pricing Tiers
        const tiers = generatedData.pricingTiers.map(t => ({
            product_id: product.id,
            min_qty: t.minQty,
            max_qty: t.maxQty,
            unit_price: t.unitPrice,
            currency: t.currency
        }));

        const { error: tError } = await supabase.from('pricing_tiers').insert(tiers);
        if (tError) throw tError;

        localStorage.removeItem('kavex_listing_draft');
        alert("Product published successfully! Awaiting admin review.");
        window.location.reload();

    } catch (err) {
        alert("Publish failed: " + err.message);
        btn.disabled = false;
        btn.textContent = "Publish to Marketplace";
    }
}

function openManualProductForm() {
    // Switch back to standard form flow or show the hidden full form
    showSection('products');
    openProductPanel();
}
