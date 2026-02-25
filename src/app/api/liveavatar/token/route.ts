import { NextResponse } from 'next/server';

export async function POST() {
  try {
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Something went wrong',
      },
      {
        status: 400,
      }
    );
  }
}
