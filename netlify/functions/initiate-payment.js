const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const { amount, currency, buyerEmail, buyerName, buyerPhone, orderItems, deliveryAddress, buyer_id } = JSON.parse(event.body);

    // 1. Robust Validation
    if (!amount || !currency || !buyerEmail || !orderItems) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // 2. Generate Unique Ref
    const tx_ref = `KVX_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const order_ref = "KVX-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 3. Create Order Record
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        buyer_id,
        order_ref,
        items: orderItems,
        total_amount: amount,
        currency,
        shipping_address: deliveryAddress,
        status: 'pending',
        escrow_status: 'pending',
        tx_ref: tx_ref
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        order_id: data.id,
        tx_ref: tx_ref,
        public_key: process.env.FLW_PUBLIC_KEY // Optional if using window.__env
      })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
