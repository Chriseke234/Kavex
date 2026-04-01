const fs = require('fs');
const path = require('path');

const cssDir = 'c:/Users/CHRIS/Kavex/assets/css';
const htmlDir = 'c:/Users/CHRIS/Kavex/';

// Color mappings map hex (lowercase) -> var name
const colorMappings = {
  '#0a2540': 'var(--navy)',
  '#0f4c81': 'var(--navy-mid)',
  '#eff6ff': 'var(--navy-light)',
  '#ea580c': 'var(--orange)',
  '#c84b0a': 'var(--orange-dark)',
  '#fff7ed': 'var(--orange-light)',
  '#1d9e75': 'var(--green)',
  '#f0fdf4': 'var(--green-light)',
  '#f9fafb': 'var(--gray-50)',
  '#f3f4f6': 'var(--gray-100)',
  '#e5e7eb': 'var(--gray-200)',
  '#9ca3af': 'var(--gray-400)',
  '#4b5563': 'var(--gray-600)',
  '#111827': 'var(--gray-900)'
};

const varMappings = {
  'var(--primary-black)': 'var(--gray-900)',
  'var(--primary-orange)': 'var(--orange)',
  'var(--primary-white)': '#FFFFFF',
  'var(--bg-light)': 'var(--gray-50)',
  'var(--text-muted)': 'var(--gray-600)',
  'var(--border-color)': 'var(--gray-200)',
  'var(--transition)': 'all 0.2s ease'
};

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini') {
        processFiles(fullPath);
      }
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        // Replace old variables
        for (const [oldVar, newVar] of Object.entries(varMappings)) {
            // Regex to match exact string
            content = content.replace(new RegExp(oldVar.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newVar);
        }

        // Replace hex colors (case insensitive)
        for (const [hex, variable] of Object.entries(colorMappings)) {
            const regex = new RegExp(hex, 'gi');
            content = content.replace(regex, variable);
        }
        
        // Font families
        content = content.replace(/'Outfit', sans-serif/g, "'Plus Jakarta Sans', sans-serif");
        
        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated ${fullPath}`);
        }
    }
  });
}

processFiles(htmlDir);

// Now manually clean main.css
const mainCssPath = path.join(cssDir, 'main.css');
if (fs.existsSync(mainCssPath)) {
    let mainCss = fs.readFileSync(mainCssPath, 'utf8');
    // We want to delete the reset lines roughly from @import ... to .btn-primary:hover {...}
    // We can do this by finding the index of "/* Hero Section */"
    const heroIndex = mainCss.indexOf('/* Hero Section */');
    if (heroIndex !== -1) {
        mainCss = mainCss.substring(heroIndex);
        fs.writeFileSync(mainCssPath, mainCss, 'utf8');
        console.log("Stripped reset rules from main.css");
    }
}
