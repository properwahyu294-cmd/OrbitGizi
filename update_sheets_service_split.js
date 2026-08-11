const fs = require('fs');

let content = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');

// I will just rewrite the sheetsService.ts file by keeping the helpers and replacing the main export
