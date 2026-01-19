
import { VisionService } from '../src/services/vision.service';

// Mocking Multer File Interface
const createMockFile = (originalname: string, size: number, mimetype: string = 'application/pdf'): any => {
    return {
        fieldname: 'file',
        originalname,
        encoding: '7bit',
        mimetype,
        size,
        buffer: Buffer.from('mock-content'),
        destination: '',
        filename: originalname,
        path: ''
    };
};

const runTest = async () => {
    console.log("👁️ Testing Idea 4: Automatic Document Validation (Computer Vision)\n");

    const vision = new VisionService();

    // Test Case 1: Valid Signed Document
    // Name implies signed, valid PDF, good size
    const file1 = createMockFile("acord_pedagogic_signed.pdf", 5000);
    console.log(`📄 Case 1: Uploading "${file1.originalname}" (${file1.size} bytes)...`);
    const result1 = await vision.validateDocument(file1);
    console.log(`   ➡ Valid: ${result1.valid} (Expected: true)`);
    console.log(`   ➡ Meta: ${JSON.stringify(result1.metadata)}\n`);

    // Test Case 2: Invalid Extension
    const file2 = createMockFile("evidence.jpg", 2000, "image/jpeg");
    console.log(`📄 Case 2: Uploading "${file2.originalname}"...`);
    const result2 = await vision.validateDocument(file2);
    console.log(`   ➡ Valid: ${result2.valid} (Expected: false)`);
    console.log(`   ➡ Errors: ${result2.errors.join(', ')}\n`);

    // Test Case 3: Unsigned Document (Detected by keyword 'unsigned' in mock)
    const file3 = createMockFile("acord_pedagogic_unsigned_draft.pdf", 5000);
    console.log(`📄 Case 3: Uploading "${file3.originalname}"...`);
    const result3 = await vision.validateDocument(file3);
    console.log(`   ➡ Valid: ${result3.valid} (Expected: false)`);
    console.log(`   ➡ Errors: ${result3.errors.join(', ')}\n`);

    // Test Case 4: Empty Document (Too small)
    const file4 = createMockFile("corrupted.pdf", 100);
    console.log(`📄 Case 4: Uploading "${file4.originalname}" (100 bytes)...`);
    const result4 = await vision.validateDocument(file4);
    console.log(`   ➡ Valid: ${result4.valid} (Expected: false)`);
    console.log(`   ➡ Errors: ${result4.errors.join(', ')}\n`);

};

runTest();
