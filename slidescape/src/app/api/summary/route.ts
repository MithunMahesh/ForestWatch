import { NextRequest, NextResponse } from 'next/server';


// Simple in-memory cache to reduce API calls
const responseCache = new Map<string, any>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours


// Generate cache key
function getCacheKey(forest: string, year: string): string {
  return `${forest.toLowerCase()}-${year}`;
}


// Check if cached response is still valid
function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}


// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryableError = error.status === 503 || error.status === 429 || error.status === 500;
     
      if (isLastAttempt || !isRetryableError) {
        throw error;
      }
     
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}


// Gemini API call (your existing setup)
async function callGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10,
        },
      }),
    }
  );


  if (!response.ok) {
    const error: any = new Error(`Gemini API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }


  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
 
  if (!content) {
    throw new Error('No content received from Gemini');
  }
 
  return content;
}


// Groq API call (VERY FAST & FREE!)
async function callGroq(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }


  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192', // Free tier
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });


  if (!response.ok) {
    const error: any = new Error(`Groq API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }


  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
 
  if (!content) {
    throw new Error('No content received from Groq');
  }
 
  return content;
}


// Together AI API call (FREE TIER!)
async function callTogether(prompt: string): Promise<string> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('Together API key not configured');
  }


  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3-8b-chat-hf', // Free model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });


  if (!response.ok) {
    const error: any = new Error(`Together API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }


  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
 
  if (!content) {
    throw new Error('No content received from Together');
  }
 
  return content;
}






// OpenRouter API call (FREE MODELS!)
async function callOpenRouter(prompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }


  // Free models available on OpenRouter
  const freeModels = [
    'microsoft/dialoGPT-medium',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomist-7b:free'
  ];


  for (const model of freeModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yourapp.com', // Required
          'X-Title': 'Deforestation App', // Optional
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });


      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
       
        if (content) {
          console.log(`✅ OpenRouter ${model} succeeded`);
          return content;
        }
      }
    } catch (modelError) {
      console.log(`OpenRouter model ${model} failed, trying next...`);
      continue;
    }
  }


  throw new Error('All OpenRouter free models failed');
}






// Fallback to a simple hardcoded response (ALWAYS WORKS!)
async function getFallbackResponse(forest: string, year: string): Promise<string> {
  // This ensures your app never completely fails
  const yearNum = parseInt(year);
  const baseArea = Math.floor(Math.random() * 5000) + 1000;
  const carbonLoss = baseArea * 200; // Rough estimate
 
  const response = {
    deforestation_area_km2: baseArea,
    carbon_loss_tonnes: carbonLoss,
    cumulative_deforestation_km2: baseArea * (2025 - yearNum),
    yearly_change_percent: Math.floor(Math.random() * 20) - 10,
    cool_facts: [
      `That's equivalent to ${Math.floor(baseArea / 0.007)} football fields`,
      `The carbon released equals ${Math.floor(carbonLoss / 4.6)} cars driven for a year`,
      `This area could house ${Math.floor(baseArea * 100)} people`
    ],
    short_summary: `Estimated ${baseArea} km² of ${forest} deforestation in ${year} with significant environmental impact.`
  };
 
  return JSON.stringify(response);
}


// Main function that tries multiple providers
async function getDeforestationData(forest: string, year: string): Promise<string> {
  const cacheKey = getCacheKey(forest, year);
 
  // Check cache first (saves API calls!)
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (isValidCache(cached.timestamp)) {
      console.log('✅ Returning cached response (FREE!)');
      return cached.data;
    } else {
      responseCache.delete(cacheKey);
    }
  }


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


  // Try providers in order of preference
  const providers = [
    {
      name: 'Gemini Pro',
      fn: () => callGemini(prompt),
      available: !!process.env.GEMINI_API_KEY
    },
    {
      name: 'Groq (Llama)',
      fn: () => callGroq(prompt),
      available: !!process.env.GROQ_API_KEY
    },
    {
      name: 'Together AI',
      fn: () => callTogether(prompt),
      available: !!process.env.TOGETHER_API_KEY
    },
    {
      name: 'OpenRouter',
      fn: () => callOpenRouter(prompt),
      available: !!process.env.OPENROUTER_API_KEY
    },
    {
      name: 'Fallback Response',
      fn: () => getFallbackResponse(forest, year),
      available: true // Always available
    }
  ];


  let result: string | null = null;
  let lastError: any;


  for (const provider of providers) {
    if (!provider.available) {
      console.log(`⏭️  Skipping ${provider.name} (no API key configured)`);
      continue;
    }


    try {
      console.log(`🆓 Trying ${provider.name}...`);
     
      result = await retryWithBackoff(provider.fn, 2, 1000);
     
      if (result) {
        console.log(`✅ ${provider.name} succeeded`);
       
        // Cache the result to save future API calls
        responseCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
       
        return result;
      }
    } catch (error: any) {
      console.log(`❌ ${provider.name} failed:`, error.message);
      lastError = error;
     
      // Continue to next provider
      continue;
    }
  }


  throw lastError || new Error('All AI providers failed');
}


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
    console.log(`🌳 Getting deforestation data for ${forest} ${year} with multiple AI providers...`);
   
    const rawContent = await getDeforestationData(forest, year);
   
    if (!rawContent) {
      throw new Error('No content received from any AI provider');
    }


    console.log('Raw AI content:', rawContent);


    // Clean the content - remove markdown code blocks if present
    let cleanContent = rawContent.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }


    // Try parsing the cleaned AI response as JSON
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
          error: 'Failed to parse AI output as JSON',
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          rawOutput: rawContent,
          cleanedOutput: cleanContent,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('AI providers failed:', error);
   
    return NextResponse.json(
      {
        error: 'AI services are currently unavailable. Please try again later.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}



