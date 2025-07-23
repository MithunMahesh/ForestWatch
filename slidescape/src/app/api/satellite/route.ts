import { NextRequest } from 'next/server';
import ee from '@google/earthengine';
import { readFileSync } from 'fs';
import { join } from 'path';

let initialized = false;

// ✅ Lazy-load and authenticate Earth Engine
async function initEarthEngine() {
  if (!initialized) {
    console.log('Initializing Earth Engine...');
    
    try {
      const privateKey = JSON.parse(
        readFileSync(join(process.cwd(), 'gee-service-account.json'), 'utf8')
      );

      await new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(
          privateKey,
          () => {
            console.log('Authentication successful');
            ee.initialize(
              null,
              null,
              () => {
                console.log('Earth Engine initialized');
                initialized = true;
                resolve(null);
              },
              (err: any) => {
                console.error('Earth Engine initialization failed:', err);
                reject(err);
              }
            );
          },
          (err: any) => {
            console.error('Authentication failed:', err);
            reject(err);
          }
        );
      });
    } catch (error) {
      console.error('Error reading service account file:', error);
      throw error;
    }
  }
}

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get('year');
  const yearNum = Number(year);

  console.log(`Received request for year: ${year}`);

  if (!year || isNaN(yearNum)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing year' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Step 1: Initializing Earth Engine...');
    await initEarthEngine();
    console.log('Step 1: ✅ Earth Engine initialized');

    console.log('Step 2: Loading Hansen Global Forest Change dataset...');
    
    // ✅ Hansen Global Forest Change dataset
    const dataset = ee.Image('UMD/hansen/global_forest_change_2024_v1_12');
    console.log('Step 2: ✅ Hansen dataset loaded');

    // ✅ Amazon region coordinates (you can change this back to Texas if needed)
    const region = ee.Geometry.Rectangle([-75, -15, -45, 5]); // Amazon
    console.log('Step 3: ✅ Region defined');

    // ✅ Create forest loss mask for specific year
    const lossYear = dataset.select('lossyear');
    const targetYear = yearNum - 2000; // Hansen uses 0-24 for years 2000-2024
    
    console.log(`Step 4: Creating forest visualization for year ${yearNum} (Hansen year: ${targetYear})`);

    // ✅ Create different visualizations based on what you want to show
    let image: any;
    let visParams: any;

    if (yearNum === 2000) {
      // Show original tree cover for year 2000
      image = dataset.select('treecover2000');
      visParams = {
        min: 0,
        max: 100,
        palette: ['black', 'darkgreen', 'green', 'lightgreen']
      };
    } else {
      // Show forest loss up to the selected year
      const lossMask = lossYear.lte(targetYear).and(lossYear.gt(0));
      const treeCover = dataset.select('treecover2000');
      
      // Create a composite: green for remaining forest, red for lost forest
      const remainingForest = treeCover.updateMask(lossMask.not());
      const lostForest = treeCover.updateMask(lossMask);
      
      // Combine both layers
      image = ee.Image.cat([
        lostForest.rename('red'),
        remainingForest.rename('green'),
        ee.Image.constant(0).rename('blue')
      ]);
      
      visParams = {
        bands: ['red', 'green', 'blue'],
        min: 0,
        max: 100,
        gamma: 1.0
      };
    }

    console.log('Step 4: ✅ Forest visualization created');

    console.log('Step 5: Generating thumbnail...');
    const url = await new Promise<string>((resolve, reject) => {
      try {
        image.getThumbURL(
          {
            dimensions: 512,
            region: region,
            format: 'png',
            ...visParams,
          },
          (url: string, error: any) => {
            if (error) {
              console.error('Step 5: ❌ Error generating thumbnail:', error);
              reject(new Error(`Thumbnail generation error: ${error.message || error}`));
            } else {
              console.log('Step 5: ✅ Thumbnail generated successfully:', url);
              resolve(url);
            }
          }
        );
      } catch (syncError: any) {
        console.error('Step 5: ❌ Sync error in getThumbURL:', syncError);
        reject(new Error(`Sync error in getThumbURL: ${syncError?.message || syncError}`));
      }
    });

    console.log('Step 6: ✅ Returning successful response');
    return new Response(
      JSON.stringify({ 
        year, 
        thumbnail: url,
        dataset: 'Hansen Global Forest Change 2024',
        hansenYear: targetYear,
        region: 'Amazon',
        description: yearNum === 2000 ? 'Original tree cover' : `Forest loss up to ${yearNum}`
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('❌ API Error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch forest change image', 
        details: err.message || 'Unknown error occurred',
        errorType: err.name || 'UnknownError',
        year: year,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}