import { NextResponse } from 'next/server';

const PALWORLD_API_URL = process.env.PALWORLD_API_URL;
const PALWORLD_API_USERNAME = process.env.PALWORLD_API_USERNAME;
const PALWORLD_API_PASSWORD = process.env.PALWORLD_API_PASSWORD;

async function getPalworldAPI(endpoint: string) {
  if (!PALWORLD_API_URL || !PALWORLD_API_USERNAME || !PALWORLD_API_PASSWORD) {
    throw new Error('Palworld API credentials not configured');
  }

  const credentials = Buffer.from(`${PALWORLD_API_USERNAME}:${PALWORLD_API_PASSWORD}`).toString('base64');
  
  const response = await fetch(`${PALWORLD_API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Palworld API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const metrics = await getPalworldAPI('/v1/api/metrics');
    
    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    console.error('Error fetching server metrics:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch server metrics',
      data: {
        currentplayernum: 0,
        serverfps: 0,
        serverframetime: 0,
        days: 0,
        maxplayernum: 0,
        uptime: 0
      }
    }, { status: 500 });
  }
}
