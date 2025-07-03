/**
 * APA Authentication Test Runner
 * 
 * This script runs the APA authentication test suite
 * and provides a summary of test results.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const TEST_FILES = [
  'auth.test.js',
  'invite-code.test.js',
  'parent-approval.test.js'
];

console.log('🔐 Starting APA Authentication Tests');
console.log('====================================');

// Function to run tests
async function runTests() {
  for (const testFile of TEST_FILES) {
    console.log(`\n🧪 Running ${testFile}...`);
    
    const testProcess = spawn('npx', ['jest', path.join(__dirname, testFile), '--verbose'], {
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve) => {
      testProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(`❌ ${testFile} tests failed with code ${code}`);
        } else {
          console.log(`✅ ${testFile} tests completed successfully`);
        }
        resolve();
      });
    });
  }
  
  console.log('\n====================================');
  console.log('🏁 APA Authentication Test Suite Completed');
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
