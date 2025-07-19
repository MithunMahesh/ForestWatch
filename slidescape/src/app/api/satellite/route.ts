import { NextRequest } from 'next/server';
import ee from '@google/earthengine';
import { readFileSync } from 'fs';
import { join } from 'path';

let initialized = false;

// load and authenticate Earth Engine
async function initEarthEngine() {
  if (!initialized) {
    
    try {
      const privateKey = JSON.parse(
        readFileSync(join(process.cwd(), 'gee-service-account.json'), 'utf8')
      );

      await new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(
          privateKey,
          () => {
            ee.initialize(
              null,
              null,
              () => {
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
    await initEarthEngine();

    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    console.log(`Fetching data from ${start} to ${end}`);

    // ✅ Updated dataset selection with better coverage
    let dataset: string;
    if (yearNum >= 2013) {
      dataset = 'LANDSAT/LC08/C02/T1_L2'; // Landsat 8 Collection 2 Level 2
    } else if (yearNum >= 1999) {
      dataset = 'LANDSAT/LE07/C02/T1_L2'; // Landsat 7 Collection 2 Level 2
    } else {
      dataset = 'LANDSAT/LT05/C02/T1_L2'; // Landsat 5 Collection 2 Level 2
    }

    console.log(`Using dataset: ${dataset}`);

    // ✅ Amazon region coordinates
    const region = ee.Geometry.Rectangle([-75, -15, -45, 5]);

    const collection = ee.ImageCollection(dataset)
      .filterDate(start, end)
      .filterBounds(region)
      .filter(ee.Filter.lt('CLOUD_COVER', 20)); // Filter out very cloudy images

    console.log('Getting collection size...');
    const size = await new Promise<number>((resolve, reject) => {
      collection.size().getInfo((result: number, error: any) => {
        if (error) {
          console.error('Error getting collection size:', error);
          reject(error);
        } else {
          console.log(`Collection size: ${result}`);
          resolve(result);
        }
      });
    });

    if (size === 0) {
      console.log('No images found for the specified criteria');
      return new Response(
        JSON.stringify({
          year,
          thumbnail: null,
          message: 'No satellite imagery found for this year.',
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Creating mosaic...');
    const image = collection.median(); // Use median instead of mosaic for better cloud removal

    // ✅ Updated visualization parameters for Collection 2 Level 2
    let visParams: any;
    if (yearNum >= 2013) {
      // Landsat 8/9 bands
      visParams = {
        bands: ['SR_B4', 'SR_B3', 'SR_B2'], // Red, Green, Blue
        min: 7000,
        max: 12000,
        gamma: 1.4
      };
    } else {
      // Landsat 5/7 bands
      visParams = {
        bands: ['SR_B3', 'SR_B2', 'SR_B1'], // Red, Green, Blue
        min: 7000,
        max: 12000,
        gamma: 1.4
      };
    }

    console.log('Generating thumbnail...');
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
              console.error('Error generating thumbnail:', error);
              reject(error);
            } else {
              console.log('Thumbnail generated successfully:', url);
              resolve(url);
            }
          }
        );
      } catch (err) {
        console.error('Exception in getThumbURL:', err);
        reject(err);
      }
    });

    return new Response(
      JSON.stringify({ 
        year, 
        thumbnail: url,
        dataset,
        imageCount: size 
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch image', 
        details: err.message,
        stack: err.stack 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}