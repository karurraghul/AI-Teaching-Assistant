// list-deps.js
const fs = require('node:fs');
const path = require('node:path');

// Read package.json from current directory
const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Get all dependencies
    const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };
    
    // Filter React and Radix dependencies
    const reactDeps = {};
    for (const [key, value] of Object.entries(allDependencies)) {
        if (key.includes('react') || key.includes('@radix')) {
            reactDeps[key] = value;
        }
    }
    
    // Print results
    console.log('\nReact and Radix Dependencies:');
    console.log(JSON.stringify(reactDeps, null, 2));
    
    // Save to file
    fs.writeFileSync('react-deps.json', JSON.stringify(reactDeps, null, 2));
    console.log('\nSaved to react-deps.json');

} catch (error) {
    console.error('Error:', error.message);
}