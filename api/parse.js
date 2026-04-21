const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `아래 상담/예약 내용에서 주문 정보를 추출해서 JSON으로만 답해줘. 다른 설명 없이 JSON만 출력해.

추출할 필드:
- product: 제품명 (예: "구움과자")
- types: 구움과자 종류 (예: "플레인, 무화과, 솔티드, 호두츄러스, 두바이")
- quantity: 박스 갯수 (예: "3구 박스 1개")
- price: 가격 (예: "274,000원")
- note: 비고/요청사항. 예약 시간(예: "14:00", "오후 2시")이 있으면 반드시 포함. 기타 요청사항도 함께 기재. (예: "14:00 픽업", "오전 11시 / 스티커 포함")

정보가 없으면 해당 필드는 빈 문자열("")로.

상담 내용:
${text}

JSON:`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // JSON 블록 추출 (```json ... ``` 형태일 수 있음)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(422).json({ error: 'Failed to parse response', raw });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: err.message });
  }
};
