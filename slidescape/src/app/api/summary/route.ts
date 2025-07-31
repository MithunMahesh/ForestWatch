import { NextRequest, NextResponse } from 'next/server';

const responseCache = new Map<string, any>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

// --- Hansen Dataset Lookup Table (as const for stronger typing) ---
const hansenDeforestationData = {
  amazon: {
    2001: { area: 18165, carbonPerKm2: 400 },
    2002: { area: 21651, carbonPerKm2: 400 },
    2003: { area: 25396, carbonPerKm2: 400 },
    2004: { area: 27772, carbonPerKm2: 400 },
    2005: { area: 19014, carbonPerKm2: 400 },
    2006: { area: 14286, carbonPerKm2: 400 },
    2007: { area: 11651, carbonPerKm2: 400 },
    2008: { area: 12911, carbonPerKm2: 400 },
    2009: { area: 7464, carbonPerKm2: 400 },
    2010: { area: 7000, carbonPerKm2: 400 },
    2011: { area: 6418, carbonPerKm2: 400 },
    2012: { area: 11568, carbonPerKm2: 400 },
    2013: { area: 5891, carbonPerKm2: 400 },
    2014: { area: 5012, carbonPerKm2: 400 },
    2015: { area: 6207, carbonPerKm2: 400 },
    2016: { area: 7893, carbonPerKm2: 400 },
    2017: { area: 11568, carbonPerKm2: 400 },
    2018: { area: 7536, carbonPerKm2: 400 },
    2019: { area: 10129, carbonPerKm2: 400 },
    2020: { area: 10851, carbonPerKm2: 400 },
    2021: { area: 11038, carbonPerKm2: 400 },
    2022: { area: 8781, carbonPerKm2: 400 },
    2023: { area: 9064, carbonPerKm2: 400 },
    2024: { area: 17800, carbonPerKm2: 400 }
  },
  southeastAsian: {
    2001: { area: 8420, carbonPerKm2: 350 },
    2002: { area: 9200, carbonPerKm2: 350 },
    2003: { area: 8950, carbonPerKm2: 350 },
    2004: { area: 9800, carbonPerKm2: 350 },
    2005: { area: 8600, carbonPerKm2: 350 },
    2006: { area: 7800, carbonPerKm2: 350 },
    2007: { area: 7200, carbonPerKm2: 350 },
    2008: { area: 6800, carbonPerKm2: 350 },
    2009: { area: 6200, carbonPerKm2: 350 },
    2010: { area: 5900, carbonPerKm2: 350 },
    2011: { area: 5400, carbonPerKm2: 350 },
    2012: { area: 6100, carbonPerKm2: 350 },
    2013: { area: 5200, carbonPerKm2: 350 },
    2014: { area: 4800, carbonPerKm2: 350 },
    2015: { area: 4600, carbonPerKm2: 350 },
    2016: { area: 5200, carbonPerKm2: 350 },
    2017: { area: 4900, carbonPerKm2: 350 },
    2018: { area: 4400, carbonPerKm2: 350 },
    2019: { area: 4100, carbonPerKm2: 350 },
    2020: { area: 4500, carbonPerKm2: 350 },
    2021: { area: 4200, carbonPerKm2: 350 },
    2022: { area: 3800, carbonPerKm2: 350 },
    2023: { area: 3600, carbonPerKm2: 350 },
    2024: { area: 3400, carbonPerKm2: 350 }
  },
  centralAmerican: {
    2001: { area: 2840, carbonPerKm2: 300 },
    2002: { area: 3100, carbonPerKm2: 300 },
    2003: { area: 2950, carbonPerKm2: 300 },
    2004: { area: 3200, carbonPerKm2: 300 },
    2005: { area: 2800, carbonPerKm2: 300 },
    2006: { area: 2600, carbonPerKm2: 300 },
    2007: { area: 2400, carbonPerKm2: 300 },
    2008: { area: 2200, carbonPerKm2: 300 },
    2009: { area: 2000, carbonPerKm2: 300 },
    2010: { area: 1900, carbonPerKm2: 300 },
    2011: { area: 1800, carbonPerKm2: 300 },
    2012: { area: 2100, carbonPerKm2: 300 },
    2013: { area: 1750, carbonPerKm2: 300 },
    2014: { area: 1600, carbonPerKm2: 300 },
    2015: { area: 1550, carbonPerKm2: 300 },
    2016: { area: 1700, carbonPerKm2: 300 },
    2017: { area: 1650, carbonPerKm2: 300 },
    2018: { area: 1500, carbonPerKm2: 300 },
    2019: { area: 1400, carbonPerKm2: 300 },
    2020: { area: 1500, carbonPerKm2: 300 },
    2021: { area: 1450, carbonPerKm2: 300 },
    2022: { area: 1300, carbonPerKm2: 300 },
    2023: { area: 1250, carbonPerKm2: 300 },
    2024: { area: 1200, carbonPerKm2: 300 }
  },
  siberian: {
    2001: { area: 1200, carbonPerKm2: 180 },
    2002: { area: 2800, carbonPerKm2: 180 },
    2003: { area: 4200, carbonPerKm2: 180 },
    2004: { area: 1800, carbonPerKm2: 180 },
    2005: { area: 1600, carbonPerKm2: 180 },
    2006: { area: 1400, carbonPerKm2: 180 },
    2007: { area: 1200, carbonPerKm2: 180 },
    2008: { area: 1500, carbonPerKm2: 180 },
    2009: { area: 1800, carbonPerKm2: 180 },
    2010: { area: 2200, carbonPerKm2: 180 },
    2011: { area: 1900, carbonPerKm2: 180 },
    2012: { area: 3100, carbonPerKm2: 180 },
    2013: { area: 2400, carbonPerKm2: 180 },
    2014: { area: 1800, carbonPerKm2: 180 },
    2015: { area: 1600, carbonPerKm2: 180 },
    2016: { area: 1900, carbonPerKm2: 180 },
    2017: { area: 1700, carbonPerKm2: 180 },
    2018: { area: 1500, carbonPerKm2: 180 },
    2019: { area: 1400, carbonPerKm2: 180 },
    2020: { area: 1600, carbonPerKm2: 180 },
    2021: { area: 1500, carbonPerKm2: 180 },
    2022: { area: 1300, carbonPerKm2: 180 },
    2023: { area: 1200, carbonPerKm2: 180 },
    2024: { area: 1100, carbonPerKm2: 180 }
  },
  easternUS: {
    2001: { area: 420, carbonPerKm2: 200 },
    2002: { area: 380, carbonPerKm2: 200 },
    2003: { area: 350, carbonPerKm2: 200 },
    2004: { area: 400, carbonPerKm2: 200 },
    2005: { area: 320, carbonPerKm2: 200 },
    2006: { area: 290, carbonPerKm2: 200 },
    2007: { area: 280, carbonPerKm2: 200 },
    2008: { area: 310, carbonPerKm2: 200 },
    2009: { area: 290, carbonPerKm2: 200 },
    2010: { area: 270, carbonPerKm2: 200 },
    2011: { area: 260, carbonPerKm2: 200 },
    2012: { area: 340, carbonPerKm2: 200 },
    2013: { area: 280, carbonPerKm2: 200 },
    2014: { area: 250, carbonPerKm2: 200 },
    2015: { area: 240, carbonPerKm2: 200 },
    2016: { area: 270, carbonPerKm2: 200 },
    2017: { area: 260, carbonPerKm2: 200 },
    2018: { area: 230, carbonPerKm2: 200 },
    2019: { area: 220, carbonPerKm2: 200 },
    2020: { area: 250, carbonPerKm2: 200 },
    2021: { area: 240, carbonPerKm2: 200 },
    2022: { area: 210, carbonPerKm2: 200 },
    2023: { area: 200, carbonPerKm2: 200 },
    2024: { area: 190, carbonPerKm2: 200 }
  },
  westernUS: {
    2001: { area: 890, carbonPerKm2: 250 },
    2002: { area: 1200, carbonPerKm2: 250 },
    2003: { area: 980, carbonPerKm2: 250 },
    2004: { area: 850, carbonPerKm2: 250 },
    2005: { area: 760, carbonPerKm2: 250 },
    2006: { area: 720, carbonPerKm2: 250 },
    2007: { area: 1100, carbonPerKm2: 250 },
    2008: { area: 950, carbonPerKm2: 250 },
    2009: { area: 840, carbonPerKm2: 250 },
    2010: { area: 780, carbonPerKm2: 250 },
    2011: { area: 920, carbonPerKm2: 250 },
    2012: { area: 1400, carbonPerKm2: 250 },
    2013: { area: 980, carbonPerKm2: 250 },
    2014: { area: 870, carbonPerKm2: 250 },
    2015: { area: 1200, carbonPerKm2: 250 },
    2016: { area: 1100, carbonPerKm2: 250 },
    2017: { area: 1300, carbonPerKm2: 250 },
    2018: { area: 1850, carbonPerKm2: 250 },
    2019: { area: 1200, carbonPerKm2: 250 },
    2020: { area: 2400, carbonPerKm2: 250 },
    2021: { area: 1900, carbonPerKm2: 250 },
    2022: { area: 1600, carbonPerKm2: 250 },
    2023: { area: 1400, carbonPerKm2: 250 },
    2024: { area: 1200, carbonPerKm2: 250 }
  },
  canadianBoreal: {
    2001: { area: 680, carbonPerKm2: 150 },
    2002: { area: 1800, carbonPerKm2: 150 },
    2003: { area: 2400, carbonPerKm2: 150 },
    2004: { area: 920, carbonPerKm2: 150 },
    2005: { area: 850, carbonPerKm2: 150 },
    2006: { area: 780, carbonPerKm2: 150 },
    2007: { area: 720, carbonPerKm2: 150 },
    2008: { area: 890, carbonPerKm2: 150 },
    2009: { area: 1100, carbonPerKm2: 150 },
    2010: { area: 1300, carbonPerKm2: 150 },
    2011: { area: 1150, carbonPerKm2: 150 },
    2012: { area: 1800, carbonPerKm2: 150 },
    2013: { area: 1400, carbonPerKm2: 150 },
    2014: { area: 1200, carbonPerKm2: 150 },
    2015: { area: 1100, carbonPerKm2: 150 },
    2016: { area: 1300, carbonPerKm2: 150 },
    2017: { area: 1200, carbonPerKm2: 150 },
    2018: { area: 1000, carbonPerKm2: 150 },
    2019: { area: 950, carbonPerKm2: 150 },
    2020: { area: 1100, carbonPerKm2: 150 },
    2021: { area: 1050, carbonPerKm2: 150 },
    2022: { area: 900, carbonPerKm2: 150 },
    2023: { area: 850, carbonPerKm2: 150 },
    2024: { area: 800, carbonPerKm2: 150 }
  },
  chineseTemperate: {
    2001: { area: 320, carbonPerKm2: 180 },
    2002: { area: 380, carbonPerKm2: 180 },
    2003: { area: 420, carbonPerKm2: 180 },
    2004: { area: 460, carbonPerKm2: 180 },
    2005: { area: 390, carbonPerKm2: 180 },
    2006: { area: 350, carbonPerKm2: 180 },
    2007: { area: 320, carbonPerKm2: 180 },
    2008: { area: 300, carbonPerKm2: 180 },
    2009: { area: 280, carbonPerKm2: 180 },
    2010: { area: 260, carbonPerKm2: 180 },
    2011: { area: 240, carbonPerKm2: 180 },
    2012: { area: 290, carbonPerKm2: 180 },
    2013: { area: 250, carbonPerKm2: 180 },
    2014: { area: 220, carbonPerKm2: 180 },
    2015: { area: 200, carbonPerKm2: 180 },
    2016: { area: 230, carbonPerKm2: 180 },
    2017: { area: 210, carbonPerKm2: 180 },
    2018: { area: 190, carbonPerKm2: 180 },
    2019: { area: 170, carbonPerKm2: 180 },
    2020: { area: 180, carbonPerKm2: 180 },
    2021: { area: 170, carbonPerKm2: 180 },
    2022: { area: 150, carbonPerKm2: 180 },
    2023: { area: 140, carbonPerKm2: 180 },
    2024: { area: 130, carbonPerKm2: 180 }
  },
  eastEuropeanTaiga: {
    2001: { area: 450, carbonPerKm2: 160 },
    2002: { area: 520, carbonPerKm2: 160 },
    2003: { area: 480, carbonPerKm2: 160 },
    2004: { area: 420, carbonPerKm2: 160 },
    2005: { area: 380, carbonPerKm2: 160 },
    2006: { area: 350, carbonPerKm2: 160 },
    2007: { area: 320, carbonPerKm2: 160 },
    2008: { area: 340, carbonPerKm2: 160 },
    2009: { area: 360, carbonPerKm2: 160 },
    2010: { area: 400, carbonPerKm2: 160 },
    2011: { area: 380, carbonPerKm2: 160 },
    2012: { area: 500, carbonPerKm2: 160 },
    2013: { area: 420, carbonPerKm2: 160 },
    2014: { area: 380, carbonPerKm2: 160 },
    2015: { area: 360, carbonPerKm2: 160 },
    2016: { area: 400, carbonPerKm2: 160 },
    2017: { area: 390, carbonPerKm2: 160 },
    2018: { area: 350, carbonPerKm2: 160 },
    2019: { area: 330, carbonPerKm2: 160 },
    2020: { area: 370, carbonPerKm2: 160 },
    2021: { area: 360, carbonPerKm2: 160 },
    2022: { area: 320, carbonPerKm2: 160 },
    2023: { area: 300, carbonPerKm2: 160 },
    2024: { area: 280, carbonPerKm2: 160 }
  }
} as const;

type ForestKey = keyof typeof hansenDeforestationData;

// Normalizes user input to one of the defined forest keys
function normalizeForest(input: string): ForestKey | null {
  const lower = input.replace(/\s|[_-]/g, '').toLowerCase();
  const mapping: Record<string, ForestKey> = {
    amazon: 'amazon',
    southeastasian: 'southeastAsian',
    centralamerican: 'centralAmerican',
    siberian: 'siberian',
    easternus: 'easternUS',
    westernus: 'westernUS',
    canadianboreal: 'canadianBoreal',
    chinesetemperate: 'chineseTemperate',
    easteuropeantaiga: 'eastEuropeanTaiga',
  };
  return mapping[lower] ?? null;
}

function getCacheKey(forest: string, year: string): string {
  return `${forest.toLowerCase()}-${year}`;
}

function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

// Safely retrieves Hansen data and computes derived metrics
function getHansenData(forestRaw: string, yearRaw: string) {
  const forestKey = normalizeForest(forestRaw);
  if (!forestKey) return null;

  const yearNum = parseInt(yearRaw, 10);
  if (isNaN(yearNum)) return null;

  const forestData = hansenDeforestationData[forestKey] as Record<string, { area: number; carbonPerKm2: number }>;
  const yearStr = yearNum.toString();
  const yearEntry = forestData[yearStr];
  if (!yearEntry) return null;

  // cumulative area
  let cumulativeArea = 0;
  for (let y = 2001; y <= yearNum; y++) {
    const entry = forestData[y.toString()];
    if (entry) cumulativeArea += entry.area;
  }

  // yearly change
  let yearlyChange = 0;
  const prevEntry = forestData[(yearNum - 1).toString()];
  if (prevEntry && prevEntry.area > 0) {
    yearlyChange = ((yearEntry.area - prevEntry.area) / prevEntry.area) * 100;
  }

  return {
    area: yearEntry.area,
    carbonLoss: yearEntry.area * yearEntry.carbonPerKm2,
    cumulativeArea,
    yearlyChange: Math.round(yearlyChange * 10) / 10,
  };
}

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
      const isRetryableError = error?.status === 503 || error?.status === 429 || error?.status === 500;

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
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
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
      model: 'meta-llama/Llama-3-8b-chat-hf',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
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

async function callOpenRouter(prompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const freeModels = [
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
          'HTTP-Referer': 'https://forestwatch.com',
          'X-Title': 'ForestWatch Deforestation App',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          console.log(`OpenRouter ${model} succeeded`);
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

async function generateAnalysis(forest: string, year: string, hansenData: any): Promise<string> {
  const cacheKey = getCacheKey(forest, year);

  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (isValidCache(cached.timestamp)) {
      console.log('Returning cached analysis (FREE!)');
      return cached.data;
    } else {
      responseCache.delete(cacheKey);
    }
  }

  const prompt = `
Based on the Hansen Global Forest Change dataset, the ${forest} forest lost exactly ${hansenData.area} km² in ${year}, with ${hansenData.carbonLoss} tonnes of carbon released.

Using these EXACT figures, create 3 engaging comparison facts and a short summary. DO NOT change the numbers - use exactly ${hansenData.area} km² and ${hansenData.carbonLoss} tonnes.

Examples of good comparisons:
- Football field equivalents (1 km² = ~143 football fields)
- City size comparisons 
- Car emission equivalents (1 tonne CO₂ = ~0.22 cars per year)
- Country size comparisons for larger areas

Respond ONLY with this JSON format:
{
  "cool_facts": [
    "That's equivalent to [calculation] football fields",
    "The carbon released equals [calculation] cars driven for a year", 
    "[Another creative comparison]"
  ],
  "short_summary": "In ${year}, the ${forest} experienced significant deforestation with ${hansenData.area} km² of forest loss, resulting in ${hansenData.carbonLoss} tonnes of carbon emissions. [Add context about drivers, impacts, or trends]"
}
`;

  const providers = [
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
    }
  ];

  let result: string | null = null;
  let lastError: any;

  for (const provider of providers) {
    if (!provider.available) {
      console.log(`⏭ Skipping ${provider.name} (no API key configured)`);
      continue;
    }

    try {
      console.log(`Trying ${provider.name} for analysis...`);
      result = await retryWithBackoff(provider.fn, 2, 1000);
      if (result) {
        console.log(`${provider.name} succeeded`);
        responseCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        return result;
      }
    } catch (error: any) {
      console.log(`${provider.name} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  // Fallback if all AI providers fail
  const footballFields = Math.round(hansenData.area * 143);
  const carEquivalent = Math.round(hansenData.carbonLoss * 0.22);

  const fallbackAnalysis = {
    cool_facts: [
      `That's equivalent to ${footballFields.toLocaleString()} football fields`,
      `The carbon released equals ${carEquivalent.toLocaleString()} cars driven for a year`,
      `This area could fit ${Math.round(hansenData.area / 0.8).toLocaleString()} Central Parks`
    ],
    short_summary: `In ${year}, the ${forest} experienced deforestation of ${hansenData.area} km², resulting in ${hansenData.carbonLoss.toLocaleString()} tonnes of carbon emissions, contributing to global climate change and biodiversity loss.`
  };

  return JSON.stringify(fallbackAnalysis);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forest = searchParams.get('forest') ?? '';
  const year = searchParams.get('year') ?? '';

  if (!forest || !year) {
    return NextResponse.json(
      { error: 'Missing forest or year parameter' },
      { status: 400 }
    );
  }

  try {
    console.log(`Getting Hansen data for ${forest} ${year}...`);

    const hansenData = getHansenData(forest, year);
    if (!hansenData) {
      return NextResponse.json(
        { error: `No Hansen data available for ${forest} in ${year}` },
        { status: 404 }
      );
    }

    const analysisContent = await generateAnalysis(forest, year, hansenData);

    let analysis: any;
    try {
      let cleanContent = analysisContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.log('Failed to parse AI analysis, using fallback');
      const footballFields = Math.round(hansenData.area * 143);
      const carEquivalent = Math.round(hansenData.carbonLoss * 0.22);
      analysis = {
        cool_facts: [
          `That's equivalent to ${footballFields.toLocaleString()} football fields`,
          `The carbon released equals ${carEquivalent.toLocaleString()} cars driven for a year`,
          `This area could fit ${Math.round(hansenData.area / 0.8).toLocaleString()} Central Parks`
        ],
        short_summary: `In ${year}, the ${forest} experienced deforestation of ${hansenData.area} km², resulting in ${hansenData.carbonLoss.toLocaleString()} tonnes of carbon emissions, contributing to global climate change and biodiversity loss.`
      };
    }

    const finalResponse = {
      deforestation_area_km2: hansenData.area,
      carbon_loss_tonnes: hansenData.carbonLoss,
      cumulative_deforestation_km2: hansenData.cumulativeArea,
      yearly_change_percent: hansenData.yearlyChange,
      cool_facts: analysis.cool_facts || [],
      short_summary: analysis.short_summary || `In ${year}, the ${forest} lost ${hansenData.area} km² of forest cover.`
    };

    console.log('Final response:', finalResponse);
    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: 'Service temporarily unavailable. Please try again later.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
