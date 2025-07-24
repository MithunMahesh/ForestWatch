import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forest = searchParams.get('forest');
  const year = searchParams.get('year');

  if (!forest || !year) {
    return NextResponse.json(
      { error: 'Missing forest or year parameter' },
      { status: 400 }
    );
  }

  try {
    const prompt = `
You are an expert environmental analyst.

Estimate and summarize the deforestation activity in the ${forest} for the year ${year}. Include:

- Estimated area deforested (in km²)
- Estimated carbon loss in metric tonnes
- Cumulative deforestation up to that year
- Comparison with previous year
- 2–3 visual analogies (e.g. "X football fields", "equal to Y million cars' emissions")

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
      return NextResponse.json(
        { error: 'Gemini did not return a valid response' },
        { status: 500 }
      );
    }

    // Try parsing the Gemini response as JSON
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (err) {
      return NextResponse.json(
        {
          error: 'Failed to parse Gemini output as JSON',
          rawOutput: content,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}