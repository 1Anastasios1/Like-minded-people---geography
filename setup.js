const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n=== Like-minded People Geography Setup ===\n');

  if (fs.existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  console.log('\nPlease provide the following configuration:\n');

  const config = {};

  config.PORT = await question('Server port (default: 3000): ') || '3000';

  console.log('\n--- Google Maps Configuration ---');
  config.GOOGLE_MAPS_API_KEY = await question('Google Maps API Key (required): ');

  console.log('\n--- Google Sheets Configuration ---');
  config.GOOGLE_SHEET_ID = await question('Google Sheet ID (from the URL): ');

  console.log('\n--- Authentication Method ---');
  console.log('Choose authentication method:');
  console.log('1. Service Account Key File (recommended)');
  console.log('2. Service Account Key JSON String');
  console.log('3. Simple API Key (limited functionality)');

  const authMethod = await question('Select (1/2/3): ');

  switch (authMethod) {
    case '1':
      config.GOOGLE_SERVICE_ACCOUNT_KEY_PATH = await question('Path to service account key file: ');
      break;
    case '2':
      config.GOOGLE_SERVICE_ACCOUNT_KEY = await question('Service account key JSON (paste entire JSON): ');
      break;
    case '3':
      config.GOOGLE_API_KEY = await question('Google API Key: ');
      break;
    default:
      console.log('Invalid selection. Using API Key method.');
      config.GOOGLE_API_KEY = await question('Google API Key: ');
  }

  let envContent = '';
  for (const [key, value] of Object.entries(config)) {
    if (value) {
      envContent += `${key}=${value}\n`;
    }
  }

  fs.writeFileSync('.env', envContent);
  console.log('\n✓ Configuration saved to .env file');

  console.log('\n--- Updating HTML with Maps API Key ---');
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace(
      'YOUR_API_KEY_HERE',
      config.GOOGLE_MAPS_API_KEY
    );
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✓ Updated public/index.html with Maps API key');
  }

  console.log('\n--- Setup Complete ---');
  console.log('\nNext steps:');
  console.log('1. Make sure your Google Sheet is shared with the service account email');
  console.log('2. Run "npm install" to install dependencies');
  console.log('3. Run "npm start" to start the server');
  console.log('4. Visit http://localhost:' + config.PORT);

  rl.close();
}

setup().catch(console.error);