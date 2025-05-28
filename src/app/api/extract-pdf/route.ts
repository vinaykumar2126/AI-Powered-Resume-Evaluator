import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    console.log('📄 Using REAL PDF parsing for:', file.name);
    console.log('📊 File size:', file.size, 'bytes');

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    try {
      console.log('📦 Attempting to import pdf-parse...');
      // Dynamic import to avoid build issues
      const pdfParse = (await import('pdf-parse')).default;
      console.log('✅ pdf-parse imported successfully');
      
      // Convert File to Buffer for pdf-parse
      console.log('🔄 Converting file to buffer...');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('✅ Buffer created, size:', buffer.length);

      // Parse PDF
      console.log('🔍 Starting PDF parsing...');
      const pdfData = await pdfParse(buffer);
      
      console.log('✅ PDF parsed successfully');
      console.log('📝 Extracted text length:', pdfData.text.length);
      console.log('📖 Number of pages:', pdfData.numpages);
      
      return NextResponse.json({ 
        text: pdfData.text,
        pages: pdfData.numpages,
        info: pdfData.info 
      });

    } catch (parseError) {
      console.error('❌ PDF parsing specific error:', parseError);
      console.error('Error details:', {
        name: parseError instanceof Error ? parseError.name : 'Unknown',
        message: parseError instanceof Error ? parseError.message : 'Unknown error',
        stack: parseError instanceof Error ? parseError.stack : 'No stack trace'
      });
      
      return NextResponse.json(
        { 
          error: 'PDF parsing failed', 
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          suggestion: 'Make sure pdf-parse is installed: npm install pdf-parse'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error in PDF parsing:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
