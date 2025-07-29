import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Checking UploadThing environment variables...');
    
    const hasSecret = !!process.env.UPLOADTHING_SECRET;
    const hasToken = !!process.env.UPLOADTHING_TOKEN;
    const hasAppId = !!process.env.UPLOADTHING_APP_ID;
    
    console.log('Environment check:');
    console.log('- UPLOADTHING_SECRET present:', hasSecret);
    console.log('- UPLOADTHING_TOKEN present:', hasToken);
    console.log('- UPLOADTHING_APP_ID present:', hasAppId);
    
    return NextResponse.json({
      success: true,
      environment: {
        hasSecret,
        hasToken,
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
