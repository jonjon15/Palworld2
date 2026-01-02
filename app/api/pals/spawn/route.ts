import { NextRequest, NextResponse } from 'next/server';
import { rconClient } from '@/services/rconClient';
import type { SpawnRequest } from '@/types/palworld';

export async function POST(request: NextRequest) {
  try {
    const body: SpawnRequest = await request.json();
    
    if (!body.palId || typeof body.palId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid palId' },
        { status: 400 }
      );
    }
    
    if (!body.quantity || body.quantity < 1 || body.quantity > 100) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    if (!body.coordinates || 
        typeof body.coordinates.x !== 'number' ||
        typeof body.coordinates.y !== 'number' ||
        typeof body.coordinates.z !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }
    
    const response = await rconClient.spawnPal(
      body.palId,
      body.quantity,
      body.coordinates.x,
      body.coordinates.y,
      body.coordinates.z
    );
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Pal spawned successfully',
        response
      }
    });
  } catch (error) {
    console.error('Error spawning pal:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to spawn pal' 
      },
      { status: 500 }
    );
  }
}
