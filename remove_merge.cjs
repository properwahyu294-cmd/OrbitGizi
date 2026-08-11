const fs = require('fs');

let content = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');

const regex = /\/\/ FETCH & MERGE LOGIC.*?try \{.*?await clearSheets\(accessToken, spreadsheetId!\);/s;
content = content.replace(regex, `try {
    await clearSheets(accessToken, spreadsheetId!);`);

fs.writeFileSync('src/lib/sheetsService.ts', content);
