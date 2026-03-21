/**
 * submit-public-rfq.js
 * Atomic Guest Registration + RFQ Creation
 */

const { createClient } = require('@supabase/supabase-js');
const resend = require('resend');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mailer = new resend.Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body);
    const { email, company_name, phone, title, category, quantity, unit, budget_max, currency, deadline, description, attachmentUrl } = body;

    try {
        // 1. Handle User (Check or Create)
        let userId;
        let isGuest = false;

        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === email);

        if (user) {
            userId = user.id;
        } else {
            // Create Ghost User
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                user_metadata: { full_name: company_name },
                email_confirm: false
            });
            if (createError) throw createError;
            userId = newUser.user.id;
            isGuest = true;

            // Create Profile
            await supabase.from('profiles').insert([{
                id: userId,
                email,
                company_name,
                phone,
                role: 'buyer'
            }]);
        }

        // 2. Insert RFQ
        const { data: rfq, error: rfqError } = await supabase.from('rfqs').insert([{
            buyer_id: userId,
            title,
            category,
            quantity: parseInt(quantity),
            unit,
            budget_max: budget_max ? parseFloat(budget_max) : null,
            currency,
            deadline: new Date(deadline).toISOString(),
            description,
            status: 'open'
        }]).select().single();

        if (rfqError) throw rfqError;

        // 3. Notify Sellers in Category
        const { data: sellers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'seller'); // In production, filter by category expertise if available

        if (sellers && sellers.length > 0) {
            const notifications = sellers.map(s => ({
                user_id: s.id,
                type: 'new_rfq',
                title: `New RFQ: ${title}`,
                message: `A buyer is looking for ${quantity} ${unit} of ${title}. Submit your quote now!`,
                metadata: { rfq_id: rfq.id }
            }));
            await supabase.from('notifications').insert(notifications);
        }

        // 4. Send Confirmation Email
        await mailer.emails.send({
            from: 'Kavex Trade <trade@kavex.ng>',
            to: email,
            subject: `RFQ Received: ${title}`,
            html: `<h1>Your RFQ is Live on Kavex</h1>
                   <p>Hello ${company_name},</p>
                   <p>Your request for <strong>${quantity} ${unit} of ${title}</strong> has been sent to our verified sellers.</p>
                   <p>We'll notify you as soon as you receive a quote.</p>
                   ${isGuest ? `<p><a href="https://kavex.ng/pages/marketplace/rfq">Click here if you want to set a password and track this online.</a></p>` : ''}`
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Success",
                rfqId: rfq.id,
                isGuest,
                email
            })
        };

    } catch (err) {
        console.error("RFQ Submit Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: err.message })
        };
    }
};
