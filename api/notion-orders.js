const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID  = process.env.NOTION_DATABASE_ID;
const NOTION_VER   = '2022-06-28';

function text(prop) {
  if (!prop) return '';
  if (prop.type === 'title')     return prop.title?.[0]?.plain_text ?? '';
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? '';
  return '';
}
function num(prop) {
  return (prop?.type === 'number' ? prop.number : 0) ?? 0;
}
function sel(prop) {
  return prop?.type === 'select' ? (prop.select?.name ?? '') : '';
}
function date(prop) {
  return prop?.type === 'date' ? (prop.date?.start ?? '') : '';
}

function normalize(page) {
  const p = page.properties;
  const bojagi     = num(p['보자기선물세트']);
  const small      = num(p['작은세트']);
  const pickupTime = text(p['픽업시간']);
  const notes      = text(p['요청사항']);
  const delivery   = sel(p['수령방법']);

  const parts = [];
  if (bojagi > 0) parts.push(`보자기×${bojagi}`);
  if (small  > 0) parts.push(`작은세트×${small}`);

  return {
    id:             page.id,
    customer_name:  text(p['이름']),
    customer_phone: text(p['연락처']),
    product:        parts.join(' ') || '미정',
    types:          '',
    quantity:       String(bojagi + small),
    price:          String(bojagi * 45000 + small * 12000),
    desired_date:   date(p['출고일']),
    note:           notes && notes !== '-' ? notes : '',
    source:         '가정의달',
    status:         sel(p['상태']) || '접수',
    created_at:     date(p['주문일시']),
    delivery:       delivery === '매장픽업' ? 'pickup' : 'delivery',
    address:        text(p['배송지']) !== '-' ? text(p['배송지']) : '',
    _source:        'notion',
    _pickupTime:    pickupTime,
  };
}

async function queryAll() {
  const pages = [];
  let cursor;
  do {
    const body = { sorts: [{ property: '출고일', direction: 'ascending' }], page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion query ${res.status}`);
    const data = await res.json();
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return pages;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const pages  = await queryAll();
      const orders = pages.map(normalize);
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'id, status 필요' });
    try {
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VER,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: { 상태: { select: { name: status } } } }),
      });
      if (!r.ok) throw new Error(`Notion PATCH ${r.status}`);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
