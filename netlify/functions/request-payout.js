const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const { sellerId, amount } = JSON.parse(event.body);

    // 1. Calculate Balance
    // Sum of released orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered')
      .eq('escrow_status', 'released')
      .filter('items', 'cs', `[{"seller_id": "${sellerId}"}]`); // Advanced JSON filter needed in real SQL

    // Sum of previous payouts
    const { data: payouts } = await supabase
      .from('payouts')
      .select('amount')
      .eq('seller_id', sellerId)
      .not('status', 'eq', 'rejected');

    const totalReleased = orders?.reduce((s, o) => s + o.total_amount, 0) || 0;
    const totalPaid = payouts?.reduce((s, p) => s + p.amount, 0) || 0;
    const available = totalReleased - totalPaid;

    if (amount > available) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Insufficient balance" }) };
    }

    // 2. Create Payout Request
    const { data, error } = await supabase
      .from('payouts')
      .insert([{
        seller_id: sellerId,
        amount: amount,
        currency: 'NGN',
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ payout_id: data.id, status: 'pending' })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
