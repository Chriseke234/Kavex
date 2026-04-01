const fs = require('fs');
const path = require('path');

const projectDir = 'c:/Users/CHRIS/Kavex/';

function walk(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        filelist = walk(dir + '/' + file, filelist);
      }
    } else {
      if (file.endsWith('.html')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
}

const targetFiles = walk(projectDir);

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Add 'section' class to <section> tags
  // Regex looks for <section or <section class="..."
  content = content.replace(/<section\b([^>]*)>/g, (match, attrs) => {
      if (attrs.includes('class=')) {
          // Has class attribute
          return match.replace(/class="([^"]*)"/, (classMatch, classList) => {
              if (!classList.split(' ').includes('section')) {
                  return `class="${classList} section"`;
              }
              return classMatch;
          });
      } else {
          // No class attribute
          return `<section class="section"${attrs}>`;
      }
  });

  // 2. Clean up old button classes
  // The user told us to replace old button classes. Sometimes "btn btn-primary" is left.
  // "btn" is no longer needed since ".btn-primary" contains all base styles in design-system.css
  content = content.replace(/\bbtn\b\s+(btn-(primary|secondary|outline|ghost|lg|sm|full))/g, '$1');
  
  // Replace btn-white with btn-ghost (assumed best match)
  content = content.replace(/\bbtn btn-white\b/g, 'btn-ghost');

  if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Formatted sections and buttons in ${file}`);
  }
});
