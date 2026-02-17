// Build script to create config.js from environment variables
const fs = require('fs');

const config = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
};

const configContent = `// Auto-generated configuration
window.ENV = ${JSON.stringify(config, null, 2)};
`;

fs.writeFileSync('config.js', configContent);
console.log('config.js generated successfully');
