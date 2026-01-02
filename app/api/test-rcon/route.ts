import { NextResponse } from 'next/server';
import { rconClient } from '@/services/rconClient';

export async function GET() {
  try {
    const response = await rconClient.executeCommand('ShowPlayers');
    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}