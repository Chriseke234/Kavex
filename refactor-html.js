const fs = require('fs');
const path = require('path');

const projectDir = 'c:/Users/CHRIS/Kavex/';

// Dictionary of HTML class replacements
const classReplacements = {
  // Buttons
  'btn-primary btn-full': 'btn-primary btn-full',
  'btn-ghost btn-full': 'btn-ghost btn-full',
  'btn-primary btn-full': 'btn-primary btn-full',
  'btn-primary': 'btn-primary',
  'btn-outline': 'btn-outline',
  'btn-primary btn-lg': 'btn-primary btn-lg',
  'btn-secondary btn-lg': 'btn-secondary btn-lg',
  'btn-outline': 'btn-outline',
  'btn-primary': 'btn-primary', // Wait, whatsapp was green. Let's just map to primary or secondary for now if we want global standardization.
  
  // Badges
  'badge-gray': 'badge-gray',
  'badge-green': 'badge-green',
  'badge-green': 'badge-green',
  
  // Forms inputs
  '': '',
  '': '',
  '': ''
};

function walk(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        filelist = walk(dir + '/' + file, filelist);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
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

  // Replace class attributes exactly or just global string replacements
  for (const [oldClass, newClass] of Object.entries(classReplacements)) {
      // We want to replace class="something oldClass something"
      // the safest way in pure string replace is \boldClass\b 
      // but in JS regex \bauth-btn-primary\b is easy
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      content = content.replace(regex, newClass);
  }

  // Cleanup standard multiple spaces in class="..." caused by replacing with empty string
  content = content.replace(/class="([^"]*)"/g, function(match, inner) {
      // trim and replace multiple spaces
      const cleanClass = inner.replace(/\s+/g, ' ').trim();
      if(cleanClass === "") {
        // if class is completely empty, maybe just keep class=""
        return `class=""`;
      }
      return `class="${cleanClass}"`;
  });

  if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated HTML/JS classes in ${file}`);
  }
});
