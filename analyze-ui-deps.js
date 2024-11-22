// analyze-ui-deps.js
const fs = require('node:fs');
const path = require('node:path');

const UI_COMPONENTS_DIR = path.join(process.cwd(), 'components', 'ui');

// Map of component files to their Radix dependencies
const componentRadixMap = {
  'checkbox.tsx': '@radix-ui/react-checkbox',
  'collapsible.tsx': '@radix-ui/react-collapsible',
  'command.tsx': '@radix-ui/react-command',
  'context-menu.tsx': '@radix-ui/react-context-menu',
  'dialog.tsx': '@radix-ui/react-dialog',
  'drawer.tsx': '@radix-ui/react-dialog', // drawer often uses dialog
  'dropdown-menu.tsx': '@radix-ui/react-dropdown-menu',
  'label.tsx': '@radix-ui/react-label',
  'menubar.tsx': '@radix-ui/react-menubar',
  'navigation-menu.tsx': '@radix-ui/react-navigation-menu',
  'popover.tsx': '@radix-ui/react-popover',
  'progress.tsx': '@radix-ui/react-progress',
  'radio-group.tsx': '@radix-ui/react-radio-group',
  'scroll-area.tsx': '@radix-ui/react-scroll-area',
  'select.tsx': '@radix-ui/react-select',
  'separator.tsx': '@radix-ui/react-separator',
  'slider.tsx': '@radix-ui/react-slider',
  'switch.tsx': '@radix-ui/react-switch',
  'tabs.tsx': '@radix-ui/react-tabs',
  'toast.tsx': '@radix-ui/react-toast',
  'toggle.tsx': '@radix-ui/react-toggle',
  'toggle-group.tsx': '@radix-ui/react-toggle-group',
  'tooltip.tsx': '@radix-ui/react-tooltip'
};

try {
  // Get all .tsx files in the UI components directory
  const uiFiles = fs.readdirSync(UI_COMPONENTS_DIR)
    .filter(file => file.endsWith('.tsx'));

  // Track found components and their Radix dependencies
  const foundComponents = new Set();
  const requiredRadixDeps = new Set();

  // Check each UI component file
  uiFiles.forEach(file => {
    const content = fs.readFileSync(path.join(UI_COMPONENTS_DIR, file), 'utf8');
    
    // Check if file imports from Radix
    if (content.includes('@radix-ui/react-')) {
      foundComponents.add(file);
      
      // Add corresponding Radix dependency
      if (componentRadixMap[file]) {
        requiredRadixDeps.add(componentRadixMap[file]);
      } else {
        // Try to find Radix import directly from file
        const matches = content.match(/@radix-ui\/react-[a-z-]+/g);
        if (matches) {
          matches.forEach(match => requiredRadixDeps.add(match));
        }
      }
    }
  });

  // Generate package.json dependencies section
  const dependencies = {};
  requiredRadixDeps.forEach(dep => {
    dependencies[dep] = "^1.0.0"; // Using a default version
  });

  console.log('\nUI Components using Radix:');
  console.log([...foundComponents].sort());

  console.log('\nRequired Radix Dependencies:');
  console.log([...requiredRadixDeps].sort());

  console.log('\nAdd to package.json:');
  console.log(JSON.stringify({ dependencies }, null, 2));

  // Save to file
  fs.writeFileSync('radix-dependencies.json', JSON.stringify({ dependencies }, null, 2));
  console.log('\nSaved dependencies to radix-dependencies.json');

} catch (error) {
  console.error('Error:', error.message);
}