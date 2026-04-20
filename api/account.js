module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.status(200).json({
    bankName:    process.env.BANK_NAME    || '',
    accountNo:   process.env.ACCOUNT_NO   || '',
    accountName: process.env.ACCOUNT_NAME || '',
  });
};
