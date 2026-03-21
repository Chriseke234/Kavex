/**
 * kyb-review.js
 * High-privileged admin actions for KYB
 */

const { createClient } = require('@supabase/supabase-js');
const resend = require('resend');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mailer = new resend.Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
    const headers = { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

    try {
        const { sellerId, action, reason } = JSON.parse(event.body);

        // 1. Admin Role Verification (Server-side)
        const authHeader = event.headers.authorization?.split(' ')[1];
        if (!authHeader) throw new Error("Missing auth token");

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
        if (authError || !user) throw new Error("Invalid session");

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { statusCode: 403, headers, body: JSON.stringify({ message: "Forbidden: Admins only" }) };
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        // 2. Perform Atomic Updates
        // Update Profile Status
        const { data: seller, error: uError } = await supabase
            .from('profiles')
            .update({ kyb_status: newStatus, is_verified: action === 'approve' })
            .eq('id', sellerId)
            .select('email, full_name')
            .single();

        if (uError) throw uError;

        // 3. Log Activity & Notify Seller
        await supabase.from('notifications').insert([{
            user_id: sellerId,
            type: 'kyb_update',
            title: `KYB Update: ${newStatus.toUpperCase()}`,
            message: action === 'approve' 
                ? "Your seller account has been verified. You can now publish unlimited products."
                : `Your verification was rejected. Reason: ${reason || 'Incomplete documentation'}`
        }]);

        // 4. Send Email via Resend
        if (seller.email) {
            await mailer.emails.send({
                from: 'Kavex Compliance <compliance@kavex.ng>',
                to: seller.email,
                subject: `KYB Status Update — ${newStatus.toUpperCase()}`,
                html: `<h1>Status: ${newStatus.toUpperCase()}</h1>
                       <p>Hello ${seller.full_name},</p>
                       <p>${action === 'approve' 
                         ? 'Welcome to the verified inner circle of Kavex producers! You are now authorized to export global goods.' 
                         : `We were unable to verify your documents at this time. Reason: ${reason || 'Documentation mismatch'}. Please log in to your dashboard to re-upload.`}</p>
                       <p><a href="https://kavex.ng/pages/seller/dashboard.html">Go to Seller Dashboard</a></p>`
            });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: `Seller ${newStatus} successfully` })
        };

    } catch (err) {
        console.error("KYB error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: err.message })
        };
    }
};
