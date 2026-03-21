const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const { transaction_id, tx_ref, order_id } = JSON.parse(event.body);

    // 1. Verify with Flutterwave
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
    });

    const flwData = response.data.data;

    if (flwData.status === "successful" && flwData.tx_ref === tx_ref) {
      // 2. Fetch Order and Seller Info
      const { data: order } = await supabase.from('orders').select('*, items').eq('id', order_id).single();
      const sellerId = order.items[0]?.seller_id; // Assume all items in order are from same seller for now

      // 3. Update Order to 'confirmed' / Escrow 'held'
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          escrow_status: 'held',
          flw_ref: transaction_id
        })
        .eq('id', order_id);

      if (orderError) throw orderError;

      // 4. Create Notifications
      await supabase.from('notifications').insert([
        { user_id: order.buyer_id, title: "Payment Secured", message: `Your payment for order #${order.order_ref} is now held in escrow.`, type: 'order' },
        { user_id: sellerId, title: "New Order Confirmed", message: `Order #${order.order_ref} has been paid and is ready for fulfillment.`, type: 'order' }
      ]);

      // 5. Trigger Emails (Internal call to send-email function or direct axios)
      // For now, assume a follow-up process or background worker
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ verified: true, order_id })
      };
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ verified: false, message: "Validation failed" }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
