const axios = require('axios');

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const { to, templateName, data } = JSON.parse(event.body);

    // 1. Template Builder
    let subject = "";
    let html = "";

    switch (templateName) {
      case 'order-confirmed-buyer':
        subject = `Order Confirmed: #${data.order_ref}`;
        html = `<h1>Order Confirmed!</h1><p>Hi ${data.name}, your payment for order #${data.order_ref} has been secured in escrow.</p>`;
        break;
      case 'order-confirmed-seller':
        subject = `New Order: #${data.order_ref}`;
        html = `<h1>New Sale!</h1><p>You have a new order (#${data.order_ref}). Please begin fulfillment.</p>`;
        break;
      case 'kyb-approved':
        subject = "KYB Verification Approved";
        html = `<h1>Welcome!</h1><p>Your business profile has been verified. You can now list products on Kavex.</p>`;
        break;
      case 'kyb-rejected':
        subject = "KYB Verification Update";
        html = `<h1>Verification Update</h1><p>Unfortunately, your profile wasn't approved. Reason: ${data.reason}</p>`;
        break;
      case 'payout-processed':
        subject = "Payout Processed";
        html = `<h1>Funds Disbursed</h1><p>Your payout of ${data.amount} ${data.currency} has been processed.</p>`;
        break;
      default:
        return { statusCode: 400, headers, body: "Invalid template" };
    }

    // 2. Send via Resend
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'Kavex <noreply@kavex.com>',
      to: [to],
      subject: subject,
      html: html
    }, {
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sent: true, id: response.data.id })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
