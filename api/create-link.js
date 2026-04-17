const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = crypto.randomBytes(4).toString('hex'); // 8자리
  const json = JSON.stringify(req.body);

  const { error } = await supabase.storage
    .from('order-links')
    .upload(`${code}.json`, Buffer.from(json), {
      contentType: 'application/json',
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ code });
};
