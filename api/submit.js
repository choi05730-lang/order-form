const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    product, types, quantity, price, note,
    desired_date, delivery, address,
    customer_name, customer_phone,
  } = req.body;

  if (!customer_name || !customer_phone) {
    return res.status(400).json({ error: '고객명과 핸드폰 번호는 필수입니다.' });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      product, types, quantity, price, note,
      desired_date: desired_date || null,
      delivery, address,
      customer_name, customer_phone,
      status: '입금대기',
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, id: data.id });
};
