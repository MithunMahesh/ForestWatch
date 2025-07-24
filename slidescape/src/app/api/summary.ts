

import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  const { forest, year } = req.query;

  if (!forest || !year) {
    return res.status(400).json({ error: 'Missing forest or year parameter' });
  }

  try {
    const prompt = `
You are an expert environmental analyst.

Estimate and summarize the deforestation activity in the ${forest} for the year ${year}. Include:

- Estimated area deforested (in km²)
- Estimated carbon loss in metric tonnes
- Cumulative deforestation up to that year
- Comparison with previous year
- 2–3 visual analogies (e.g. "X football fields", "equal to Y million cars’ emissions")

Respond in strict JSON format:
{
  "deforestation_area_km2": number,
  "carbon_loss_tonnes": number,
  "cumulative_deforestation_km2": number,
  "yearly_change_percent": number,
  "cool_facts": [string],
  "short_summary": string
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return res.status(500).json({ error: 'Gemini did not return a valid response' });
    }

    // Try parsing the Gemini response as JSON
    try {
      const parsed = JSON.parse(content);
      return res.status(200).json(parsed);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to parse Gemini output as JSON',
        rawOutput: content,
      });
    }
  } catch (error) {
    console.error('Gemini error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export default handler;
