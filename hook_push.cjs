const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We will append handlePushToSheetsBackground() right after setRefreshTrigger(prev => prev + 1);
content = content.replace(/setRefreshTrigger\(prev => prev \+ 1\);\n    }\);/g, 'setRefreshTrigger(prev => prev + 1);\n      handlePushToSheetsBackground();\n    });');

fs.writeFileSync('src/App.tsx', content);
