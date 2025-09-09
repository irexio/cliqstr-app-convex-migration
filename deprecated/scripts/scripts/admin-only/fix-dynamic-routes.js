// Script to add dynamic configuration to API routes
// Run with: node scripts/fix-dynamic-routes.js

const fs = require('fs');
const path = require('path');

// Directory where API routes are located
const apiDir = path.join(__dirname, '../src/app');

// Config content to add
const configContent = `// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
`;

// Function to walk through directories recursively
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      // Check if this is an API route file
      if (fullPath.includes('/api/')) {
        console.log(`Processing: ${fullPath}`);
        
        // Read the file content
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Only add the config if it's not already there
        if (!content.includes("export const dynamic = 'force-dynamic'")) {
          // Add the config at the top of the file
          content = configContent + content;
          
          // Write the updated content
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Added dynamic config to: ${fullPath}`);
        } else {
          console.log(`Already has dynamic config: ${fullPath}`);
        }
      }
    }
  }
}

console.log('Adding dynamic configuration to API routes...');
processDirectory(apiDir);
console.log('Done!');
