const fs = require('fs');
const path = require('path');

// Directories to search
const apiDir = path.join(__dirname, 'src', 'app', 'api');
const pagesDir = path.join(__dirname, 'src', 'app');

// Pattern to check if dynamic export already exists
const dynamicExportPattern = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"];?/;

// Function to add dynamic export to a file
function addDynamicExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if the file already has the dynamic export
    if (dynamicExportPattern.test(content)) {
      console.log(`✓ Already has dynamic export: ${filePath}`);
      return;
    }
    
    // Add the dynamic export at the top of the file
    const newContent = `export const dynamic = 'force-dynamic';\n\n${content}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Added dynamic export to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error);
  }
}

// Function to recursively process directories
function processDirectory(dir, isApiDir = false) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name === 'node_modules' || entry.name === '.next') {
        continue;
      }
      
      // Process subdirectories
      processDirectory(fullPath, isApiDir || entry.name === 'api');
    } else if (entry.isFile() && 
              (entry.name === 'route.ts' || entry.name === 'route.js' || 
               (entry.name === 'page.tsx' || entry.name === 'page.js' || entry.name === 'page.ts'))) {
      
      // For API routes, always add dynamic export
      if (isApiDir || fullPath.includes(path.sep + 'api' + path.sep)) {
        addDynamicExport(fullPath);
      } else {
        // For pages, check if they use getCurrentUser or other server-only features
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('getCurrentUser') || 
            content.includes('cookies') || 
            content.includes('headers') || 
            content.includes('request.url')) {
          addDynamicExport(fullPath);
        }
      }
    }
  }
}

console.log('🔍 Adding dynamic export to API routes and server components...');
processDirectory(apiDir, true);
processDirectory(pagesDir);
console.log('✨ Done!');
