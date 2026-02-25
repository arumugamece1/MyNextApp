import { NextResponse } from 'next/server';
import { elevenlabs } from '@/app/lib/elevenlab';

export async function GET() {
  try {
    const session = await elevenlabs.conversationalAi.createSession({
      agent_id: 'agent_4401khqh4g71ej2a4wjqxjpctbrd',
    });

    return NextResponse.json({
      signedUrl: session.signed_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
