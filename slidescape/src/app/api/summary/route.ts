import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
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

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
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

Respond ONLY with valid JSON in this exact format (no markdown, no explanations):
{
  "deforestation_area_km2": 1234,
  "carbon_loss_tonnes": 5678,
  "cumulative_deforestation_km2": 9012,
  "yearly_change_percent": -5.2,
  "cool_facts": ["fact1", "fact2", "fact3"],
  "short_summary": "summary text"
}
`;

    console.log('Making request to Gemini API...');
    
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
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));

    // Check if the response has the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('No candidates in Gemini response');
      return NextResponse.json(
        { error: 'No candidates returned from Gemini', rawResponse: data },
        { status: 500 }
      );
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
      console.error('Invalid candidate structure');
      return NextResponse.json(
        { error: 'Invalid response structure from Gemini', candidate },
        { status: 500 }
      );
    }

    const content = candidate.content.parts[0]?.text;
    if (!content) {
      console.error('No text content in response');
      return NextResponse.json(
        { error: 'No text content in Gemini response', parts: candidate.content.parts },
        { status: 500 }
      );
    }

    console.log('Raw Gemini content:', content);

    // Clean the content - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try parsing the cleaned Gemini response as JSON
    try {
      const parsed = JSON.parse(cleanContent);
      
      // Validate the required fields
      const requiredFields = [
        'deforestation_area_km2',
        'carbon_loss_tonnes',
        'cumulative_deforestation_km2',
        'yearly_change_percent',
        'cool_facts',
        'short_summary'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in parsed));
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        return NextResponse.json(
          { 
            error: 'Response missing required fields', 
            missingFields,
            receivedData: parsed 
          },
          { status: 500 }
        );
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', cleanContent);
      return NextResponse.json(
        {
          error: 'Failed to parse Gemini output as JSON',
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          rawOutput: content,
          cleanedOutput: cleanContent,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Gemini request error:', error);
    return NextResponse.json(
      { 
        error: 'Network or request error', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}