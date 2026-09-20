import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('\n======================================================');
  console.log('  STARTING PRODUCTION TEMPSHARE E2E ACCEPTANCE TESTS');
  console.log('======================================================\n');

  // 1. Health Check
  console.log('[1/9] Testing /api/health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Health status should be ok');
  console.log(`✓ Health check passed (Driver: ${healthData.storageDriver}, DB: ${healthData.database})`);

  // 2. Text Share Creation & Retrieval Flow
  console.log('\n[2/9] Testing Text Share Flow...');
  const sampleText = `Hello TempShare Production!\nLine 2: function test() { return 42; }\nLine 3: 🔒 Cloudflare R2 & PostgreSQL Ready`;
  const textRes = await fetch(`${BASE_URL}/shares/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: sampleText,
      maxAccesses: 0
    })
  });
  const textData = await textRes.json();
  assert.strictEqual(textData.success, true, 'Text share creation should succeed');
  assert(textData.data.otp, 'OTP must be generated');
  assert(textData.data.qrCode, 'QR code must be generated');
  assert.strictEqual(textData.data.otp.length, 6, 'OTP must be 6 digits');
  console.log(`✓ Text share created with OTP: ${textData.data.otp}, Token: ${textData.data.shareToken}`);

  // Verify via OTP
  const verifyOtpRes = await fetch(`${BASE_URL}/shares/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: textData.data.otp })
  });
  const verifyData = await verifyOtpRes.json();
  assert.strictEqual(verifyData.success, true, 'OTP verification should succeed');
  assert.strictEqual(verifyData.data.shareToken, textData.data.shareToken);
  console.log('✓ OTP verification succeeded');

  // Retrieve Content by Token
  const getShareRes = await fetch(`${BASE_URL}/shares/${textData.data.shareToken}`);
  const retrievedData = await getShareRes.json();
  assert.strictEqual(retrievedData.success, true);
  assert.strictEqual(retrievedData.data.textContent, sampleText, 'Retrieved text must match original');
  console.log('✓ Text retrieved accurately matching original content');

  // 3. Multi-file Share & ZIP Download Flow
  console.log('\n[3/9] Testing Multi-File & ZIP Download Flow...');
  const formData = new FormData();
  
  // Create sample dummy files in memory
  const file1 = new Blob(['console.log("Hello from code.js in production");'], { type: 'application/javascript' });
  const file2 = new Blob(['# TempShare Readme\nCloudflare R2 storage integration active.'], { type: 'text/markdown' });
  
  formData.append('files', file1, 'app.js');
  formData.append('files', file2, 'README.md');
  formData.append('paths', JSON.stringify(['src/app.js', 'docs/README.md']));

  const fileUploadRes = await fetch(`${BASE_URL}/shares/files`, {
    method: 'POST',
    body: formData
  });
  const fileUploadData = await fileUploadRes.json();
  assert.strictEqual(fileUploadData.success, true, 'File share creation should succeed');
  assert.strictEqual(fileUploadData.data.fileCount, 2, 'File count must be 2');
  console.log(`✓ Multi-file share created with OTP: ${fileUploadData.data.otp}`);

  // Retrieve file list
  const getFilesRes = await fetch(`${BASE_URL}/shares/${fileUploadData.data.shareToken}`);
  const getFilesData = await getFilesRes.json();
  assert.strictEqual(getFilesData.data.files.length, 2);
  console.log('✓ File list retrieved successfully');

  // Download single file
  const firstFile = getFilesData.data.files[0];
  const downloadSingleRes = await fetch(`${BASE_URL}/shares/${fileUploadData.data.shareToken}/files/${firstFile.id}/download`);
  assert.strictEqual(downloadSingleRes.status, 200);
  const singleContent = await downloadSingleRes.text();
  assert(singleContent.includes('Hello from code.js'), 'File content should match');
  console.log('✓ Single file download verified');

  // Download all as ZIP
  const downloadAllRes = await fetch(`${BASE_URL}/shares/${fileUploadData.data.shareToken}/download-all`);
  assert.strictEqual(downloadAllRes.status, 200);
  assert.strictEqual(downloadAllRes.headers.get('content-type'), 'application/zip');
  const zipBuffer = await downloadAllRes.arrayBuffer();
  assert(zipBuffer.byteLength > 50, 'ZIP buffer should contain zipped files');
  console.log(`✓ Download all as ZIP verified (${zipBuffer.byteLength} bytes)`);

  // 4. Presigned Direct Upload Endpoint
  console.log('\n[4/9] Testing Presigned Direct Upload Endpoint...');
  const presignRes = await fetch(`${BASE_URL}/shares/presign-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileMetadata: [
        { filename: 'cloud_photo.jpg', mimeType: 'image/jpeg', size: 1048576 },
        { filename: 'document.pdf', mimeType: 'application/pdf', size: 2097152 }
      ]
    })
  });
  const presignData = await presignRes.json();
  assert.strictEqual(presignData.success, true);
  assert.strictEqual(presignData.data.uploads.length, 2);
  assert(presignData.data.uploads[0].uploadUrl, 'Must return uploadUrl');
  console.log('✓ Direct presigned upload endpoint verified');

  // 5. Fixed 10-minute expiry (client input must be ignored)
  console.log('\n[5/9] Testing Fixed 10-Minute Expiry...');
  const beforeCreate = Date.now();
  const expiryShareRes = await fetch(`${BASE_URL}/shares/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Expiry must be enforced by the server',
      expiryMinutes: 60, // ignored by the backend
      burnAfterRead: true, // removed feature: ignored
      pin: '9876' // removed feature: ignored
    })
  });
  const expiryShareData = await expiryShareRes.json();
  assert.strictEqual(expiryShareData.success, true);
  const expiryMs = new Date(expiryShareData.data.expiresAt).getTime() - beforeCreate;
  assert(
    Math.abs(expiryMs - 10 * 60 * 1000) < 60 * 1000,
    `Share must expire 10 minutes after creation (got ${Math.round(expiryMs / 1000)}s)`
  );
  assert.strictEqual(expiryShareData.data.hasPin, undefined, 'PIN feature must be gone');
  assert.strictEqual(expiryShareData.data.burnAfterRead, undefined, 'Burn feature must be gone');
  console.log('✓ Share expires after 10 minutes regardless of client-supplied expiryMinutes');

  // No PIN gate and no burn on read for new shares
  const readOnce = await fetch(`${BASE_URL}/shares/${expiryShareData.data.shareToken}`);
  const readTwice = await fetch(`${BASE_URL}/shares/${expiryShareData.data.shareToken}`);
  assert.strictEqual((await readOnce.json()).data.textContent, 'Expiry must be enforced by the server');
  assert.strictEqual(readTwice.status, 200, 'Share must stay readable until it expires (no burn, no PIN)');
  console.log('✓ New shares have no PIN gate and are not burned on first read');

  // 6. File size limit (50 MB per file)
  console.log('\n[6/9] Testing 50 MB Per-File Limit...');
  const bigForm = new FormData();
  bigForm.append('files', new Blob([new Uint8Array(51 * 1024 * 1024)]), 'too_big.bin');
  const bigRes = await fetch(`${BASE_URL}/shares/files`, { method: 'POST', body: bigForm });
  const bigData = await bigRes.json();
  assert.strictEqual(bigRes.status, 413, 'Oversized file must return 413');
  assert.strictEqual(bigData.code, 'FILE_TOO_LARGE');
  assert.strictEqual(bigData.success, false);
  console.log('✓ File larger than 50 MB rejected with FILE_TOO_LARGE');

  // 7. Rate Limiting on Invalid OTPs
  console.log('\n[7/9] Testing Invalid OTP Handling & Rate Limiting...');
  const invalidOtpRes = await fetch(`${BASE_URL}/shares/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: '000000' })
  });
  assert.strictEqual(invalidOtpRes.status, 400, 'Invalid OTP should return 400');
  console.log('✓ Invalid OTP correctly rejected');

  // 8. Vercel Cron Cleanup Endpoint
  console.log('\n[8/9] Testing /api/cleanup Endpoint...');
  const cronRes = await fetch(`${BASE_URL}/cleanup`);
  assert.strictEqual(cronRes.status, 200);
  const cronData = await cronRes.json();
  assert.strictEqual(cronData.success, true);
  console.log(`✓ /api/cleanup verified (Purged ${cronData.data.cleanedCount} expired items)`);

  // 9. Manual Revoke & Deletion
  console.log('\n[9/9] Testing Share Revocation & Deletion...');
  const deleteRes = await fetch(`${BASE_URL}/shares/${textData.data.shareToken}`, {
    method: 'DELETE'
  });
  const deleteData = await deleteRes.json();
  assert.strictEqual(deleteData.success, true);
  
  // Verify it no longer exists
  const postDeleteRes = await fetch(`${BASE_URL}/shares/${textData.data.shareToken}`);
  assert([400, 404, 410].includes(postDeleteRes.status), 'Post deletion status should be 400/404/410');
  console.log('✓ Share successfully revoked and deleted');

  console.log('\n======================================================');
  console.log('  🎉 ALL PRODUCTION ACCEPTANCE TESTS PASSED (9/9)!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
