import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test UploadThing environment variables
    const hasSecret = !!process.env.UPLOADTHING_SECRET;
    const hasAppId = !!process.env.UPLOADTHING_APP_ID;
    const hasToken = !!process.env.UPLOADTHING_TOKEN;
    
    console.log('🔍 UploadThing Environment Check:');
    console.log('- UPLOADTHING_SECRET present:', hasSecret);
    console.log('- UPLOADTHING_APP_ID present:', hasAppId);
    console.log('- UPLOADTHING_TOKEN present (should be false):', hasToken);
    
    // Test if we can import UploadThing
    const { createUploadthing } = await import('uploadthing/next');
    const f = createUploadthing();
    
    return NextResponse.json({
      success: true,
      environment: {
        hasSecret,
        hasAppId,
        hasToken,
        secretLength: process.env.UPLOADTHING_SECRET?.length || 0,
        appIdLength: process.env.UPLOADTHING_APP_ID?.length || 0,
      },
      message: 'UploadThing configuration test complete',
      uploadthingImport: 'Success'
    });
    
  } catch (error) {
    console.error('❌ UploadThing test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
