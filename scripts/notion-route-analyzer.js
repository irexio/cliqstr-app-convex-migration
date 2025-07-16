#!/usr/bin/env node

/**
 * Notion-Compatible Route and Flow Analyzer for Cliqstr
 * 
 * This script automatically analyzes API routes and flow changes
 * and outputs in a format that can be easily imported into Notion.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_ROUTES_DIR = path.join(process.cwd(), 'src', 'app', 'api');
const PAGE_ROUTES_DIR = path.join(process.cwd(), 'src', 'app');
const DOCS_OUTPUT_FILE = path.join(process.cwd(), 'docs', 'API-Routes-Flows-Notion.md');
const CSV_OUTPUT_FILE = path.join(process.cwd(), 'docs', 'API-Routes-Notion.csv');
const PAGE_FLOWS_CSV = path.join(process.cwd(), 'docs', 'Page-Flows-Notion.csv');
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'public'];

// Helper function to get all route files
function findRouteFiles(dir, fileList = [], prefix = '') {
  if (EXCLUDED_DIRS.includes(path.basename(dir))) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findRouteFiles(filePath, fileList, `${prefix}/${file}`);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push({
        path: filePath,
        route: prefix || '/',
        content: fs.readFileSync(filePath, 'utf8')
      });
    }
  });
  
  return fileList;
}

// Helper function to find page files
function findPageFiles(dir, fileList = [], prefix = '') {
  if (EXCLUDED_DIRS.includes(path.basename(dir))) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      findPageFiles(filePath, fileList, `${prefix}/${file}`);
    } else if (file === 'page.tsx' || file === 'page.js' || file === 'page.ts') {
      fileList.push({
        path: filePath,
        route: prefix || '/',
        content: fs.readFileSync(filePath, 'utf8')
      });
    }
  });
  
  return fileList;
}

// Extract HTTP methods from route files
function extractHttpMethods(content) {
  const methods = [];
  if (content.includes('export async function GET') || content.includes('export function GET')) methods.push('GET');
  if (content.includes('export async function POST') || content.includes('export function POST')) methods.push('POST');
  if (content.includes('export async function PUT') || content.includes('export function PUT')) methods.push('PUT');
  if (content.includes('export async function DELETE') || content.includes('export function DELETE')) methods.push('DELETE');
  if (content.includes('export async function PATCH') || content.includes('export function PATCH')) methods.push('PATCH');
  
  return methods.length ? methods : ['Unknown'];
}

// Extract route description from comments
function extractDescription(content) {
  const commentRegex = /\/\*\*([\s\S]*?)\*\//;
  const match = content.match(commentRegex);
  
  if (match && match[1]) {
    return match[1]
      .split('\n')
      .map(line => line.trim().replace(/^\*\s*/, ''))
      .filter(line => line)
      .join(' ');
  }
  
  // Try to find single-line comments
  const singleLineRegex = /\/\/\s*(.+)/;
  const singleLineMatch = content.match(singleLineRegex);
  
  if (singleLineMatch && singleLineMatch[1]) {
    return singleLineMatch[1].trim();
  }
  
  return 'No description available';
}

// Extract redirects from page files
function extractRedirects(content) {
  const redirects = [];
  const redirectRegex = /redirect\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = redirectRegex.exec(content)) !== null) {
    redirects.push(match[1]);
  }
  
  return redirects;
}

// Escape CSV values
function escapeCSV(value) {
  if (!value) return '';
  // If value contains comma, newline or double quote, wrap in quotes
  const needsQuotes = /[,\r\n"]/g.test(value);
  if (needsQuotes) {
    // Double up any double quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Generate Notion-compatible CSV for API Routes
function generateApiRoutesCSV(apiRoutes) {
  let csv = 'Route,Methods,Description,Tags,Status\n';
  
  apiRoutes.forEach(route => {
    const methods = extractHttpMethods(route.content).join(', ');
    const description = extractDescription(route.content);
    
    // Determine tags based on content
    let tags = '';
    if (route.content.includes('APA-HARDENED')) tags += 'APA-Hardened, ';
    if (route.content.includes('getCurrentUser')) tags += 'Auth-Required, ';
    if (methods.includes('GET')) tags += 'Read, ';
    if (methods.includes('POST') || methods.includes('PUT') || methods.includes('PATCH')) tags += 'Write, ';
    if (methods.includes('DELETE')) tags += 'Delete, ';
    tags = tags.slice(0, -2); // Remove trailing comma and space
    
    // Determine status
    let status = 'Active';
    if (route.content.includes('TODO') || route.content.includes('FIXME')) {
      status = 'In Progress';
    } else if (route.content.includes('DEPRECATED')) {
      status = 'Deprecated';
    }
    
    csv += `${escapeCSV(route.route)},${escapeCSV(methods)},${escapeCSV(description)},${escapeCSV(tags)},${escapeCSV(status)}\n`;
  });
  
  return csv;
}

// Generate Notion-compatible CSV for Page Flows
function generatePageFlowsCSV(pageRoutes) {
  let csv = 'Page,Redirects To,Description,Has Auth Check,Dynamic Rendering\n';
  
  pageRoutes.forEach(page => {
    const redirects = extractRedirects(page.content).join(', ');
    const description = extractDescription(page.content);
    
    // Check if page has auth check
    const hasAuthCheck = page.content.includes('getCurrentUser') || 
                         page.content.includes('useSession') || 
                         page.content.includes('redirect(\'/sign-in\')');
    
    // Check if page uses dynamic rendering
    const hasDynamicRendering = page.content.includes('force-dynamic') || 
                               page.content.includes('revalidate');
    
    csv += `${escapeCSV(page.route)},${escapeCSV(redirects)},${escapeCSV(description)},${escapeCSV(hasAuthCheck ? 'Yes' : 'No')},${escapeCSV(hasDynamicRendering ? 'Yes' : 'No')}\n`;
  });
  
  return csv;
}

// Generate documentation
function generateDocumentation() {
  console.log('Analyzing API routes and page flows for Notion...');
  
  const apiRoutes = findRouteFiles(API_ROUTES_DIR);
  const pageRoutes = findPageFiles(PAGE_ROUTES_DIR);
  
  // Generate Notion-compatible Markdown
  let markdown = `# Cliqstr API Routes and Flow Documentation\n\n`;
  markdown += `*This file is formatted for Notion import. Last updated: ${new Date().toISOString()}*\n\n`;
  markdown += `## How to Use This Documentation in Notion\n\n`;
  markdown += `1. Import the CSV files into Notion:\n`;
  markdown += `   - \`API-Routes-Notion.csv\` - Contains all API endpoints\n`;
  markdown += `   - \`Page-Flows-Notion.csv\` - Contains all page flows\n\n`;
  markdown += `2. After importing, convert each table to a database\n`;
  markdown += `3. For API Routes, add filters and views:\n`;
  markdown += `   - Filter by Tags (APA-Hardened, Auth-Required, etc.)\n`;
  markdown += `   - Group by HTTP Methods\n`;
  markdown += `   - Sort by Route\n\n`;
  markdown += `4. For Page Flows, add filters and views:\n`;
  markdown += `   - Filter by Has Auth Check\n`;
  markdown += `   - Filter by Dynamic Rendering\n`;
  markdown += `   - Group by Redirects To\n\n`;
  
  // Generate recent changes section
  try {
    markdown += `## Recent Changes\n\n`;
    const recentChanges = execSync('git log -n 10 --pretty=format:"%h - %s (%cr)" -- src/app/').toString();
    markdown += "```\n" + recentChanges + "\n```\n";
  } catch (error) {
    markdown += `\n## Recent Changes\n\n*Git information not available*\n`;
  }
  
  // Generate CSV files
  const apiRoutesCSV = generateApiRoutesCSV(apiRoutes);
  const pageFlowsCSV = generatePageFlowsCSV(pageRoutes);
  
  // Write files
  fs.writeFileSync(DOCS_OUTPUT_FILE, markdown);
  fs.writeFileSync(CSV_OUTPUT_FILE, apiRoutesCSV);
  fs.writeFileSync(PAGE_FLOWS_CSV, pageFlowsCSV);
  
  console.log(`Documentation generated at ${DOCS_OUTPUT_FILE}`);
  console.log(`API Routes CSV generated at ${CSV_OUTPUT_FILE}`);
  console.log(`Page Flows CSV generated at ${PAGE_FLOWS_CSV}`);
}

// Main execution
generateDocumentation();
