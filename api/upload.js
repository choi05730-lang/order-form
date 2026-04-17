const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64, filename, contentType } = req.body;
  if (!base64 || !filename) return res.status(400).json({ error: '파일 정보 필요' });

  const buffer = Buffer.from(base64, 'base64');
  const ext = filename.split('.').pop().replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
  const path = `${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('order-images')
    .upload(path, buffer, { contentType: contentType || 'image/jpeg', upsert: false });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from('order-images').getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
};
