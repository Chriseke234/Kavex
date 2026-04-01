const fs = require('fs');
const path = require('path');

function walk(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        filelist = walk(dir + '/' + file, filelist);
      }
    }
    else {
      if (file.endsWith('.html')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
}

const htmlFiles = walk('c:/Users/CHRIS/Kavex');
let count = 0;
htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('design-system.css')) {
    // Find <head>
    const headIndex = content.indexOf('<head>');
    if (headIndex !== -1) {
      // Find first <link
      let insertIndex = content.indexOf('<link', headIndex);
      if (insertIndex === -1) insertIndex = content.indexOf('<style', headIndex);
      if (insertIndex === -1) insertIndex = content.indexOf('</head>', headIndex);
      
      if (insertIndex !== -1) {
        content = content.slice(0, insertIndex) + '<link rel="stylesheet" href="/assets/css/design-system.css">\n    ' + content.slice(insertIndex);
        fs.writeFileSync(file, content, 'utf8');
        count++;
      }
    }
  }
});
console.log(`Updated ${count} files.`);
