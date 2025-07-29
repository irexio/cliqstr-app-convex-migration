import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Checking UploadThing environment variables...');
    
    const hasSecret = !!process.env.UPLOADTHING_SECRET;
    const hasAppId = !!process.env.UPLOADTHING_APP_ID;
    
    console.log('Environment check:');
    console.log('- UPLOADTHING_SECRET present:', hasSecret);
    console.log('- UPLOADTHING_APP_ID present:', hasAppId);
    console.log('✅ Using secret-based mode (no token needed)');
    
    return NextResponse.json({
      success: true,
      environment: {
        hasSecret,
        hasAppId,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local'
      },
      message: 'UploadThing environment check complete'
    });
    
  } catch (error) {
    console.error('UploadThing debug failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
