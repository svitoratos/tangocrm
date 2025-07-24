const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to remove debug console logs
function removeDebugLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log statements (but keep console.error for error handling)
    const originalContent = content;
    
    // Remove console.log statements with debug patterns
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    
    // Remove multi-line console.log statements
    content = content.replace(/console\.log\([\s\S]*?\);?\s*/g, '');
    
    // Remove specific debug patterns
    content = content.replace(/console\.log\(['"`]===.*?===['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]🔄.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]💾.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]📝.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]🎯.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]📖.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]🗑️.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]📤.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]📥.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]🔍.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]✅.*?['"`][^)]*\);?\s*/g, '');
    content = content.replace(/console\.log\(['"`]❌.*?['"`][^)]*\);?\s*/g, '');
    
    // Remove debug comments
    content = content.replace(/\/\/ Debug:.*$/gm, '');
    content = content.replace(/\/\/ ===.*?===.*$/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned: ${filePath}`);
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🧹 Starting production cleanup...');

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir);

let cleanedCount = 0;
files.forEach(file => {
  if (removeDebugLogs(file)) {
    cleanedCount++;
  }
});

console.log(`✅ Cleanup complete! Modified ${cleanedCount} files.`);
console.log('🚀 Your codebase is now production-ready!'); 