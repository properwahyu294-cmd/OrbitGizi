const fs = require('fs');

// 1. Fix sheetsService.ts
let ss = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');
ss = ss.replace(
  /  const emailSuffix = userEmail \? `_\$\{userEmail\.toLowerCase\(\)\.trim\(\)\}` : "";\n  const idKey = `orbit_gizi_spreadsheet_id\$\{emailSuffix\}`;\n  const urlKey = `orbit_gizi_spreadsheet_url\$\{emailSuffix\}`;\n\n  let spreadsheetId = localStorage\.getItem\(idKey\) \|\| data\?\.adminSheetId \|\| null;\n  let spreadsheetUrl = localStorage\.getItem\(urlKey\) \|\| data\?\.adminSheetUrl \|\| null;/s,
  `  let spreadsheetId = data?.adminSheetId || localStorage.getItem('orbit_gizi_spreadsheet_id_global') || "1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE";
  let spreadsheetUrl = data?.adminSheetUrl || localStorage.getItem('orbit_gizi_spreadsheet_url_global') || "https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316";`
);
ss = ss.replace(/localStorage\.setItem\(idKey, spreadsheetId\);/, "localStorage.setItem('orbit_gizi_spreadsheet_id_global', spreadsheetId);");
ss = ss.replace(/localStorage\.setItem\(urlKey, spreadsheetUrl\);/, "localStorage.setItem('orbit_gizi_spreadsheet_url_global', spreadsheetUrl);");
fs.writeFileSync('src/lib/sheetsService.ts', ss);

// 2. Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /  \/\/ Synchronize sheetsSyncUrl state when currentUser changes or logs in\/out\n  useEffect\(\(\) => \{\n    if \(currentUser\?\.email\) \{\n      const emailSuffix = `_\$\{currentUser\.email\.toLowerCase\(\)\.trim\(\)\}`;\n      const saved = localStorage\.getItem\(`orbit_gizi_spreadsheet_url\$\{emailSuffix\}`\);\n      if \(saved\) \{\n        setSheetsSyncUrl\(saved\);\n        return;\n      \}\n    \}\n    const globalSaved = localStorage\.getItem\("orbit_gizi_spreadsheet_url"\);\n    setSheetsSyncUrl\(globalSaved \|\| "https:\/\/docs\.google\.com\/spreadsheets\/d\/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE\/edit\?gid=1042318316#gid=1042318316"\);\n  \}, \[currentUser\]\);/s,
  `  // Synchronize sheetsSyncUrl state when currentUser changes or logs in/out
  useEffect(() => {
    const fetchGlobalConfig = async () => {
      try {
        const config = await getAdminSheetConfigApi();
        if (config?.adminSheetUrl) {
           setSheetsSyncUrl(config.adminSheetUrl);
        } else {
           setSheetsSyncUrl("https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316");
        }
      } catch (e) {
        setSheetsSyncUrl("https://docs.google.com/spreadsheets/d/1dGTF6wZ2DoPF2qVcjxrjaxDDQzHQjuHgwvKi1DwTkRE/edit?gid=1042318316#gid=1042318316");
      }
    };
    fetchGlobalConfig();
  }, [currentUser]);`
);
fs.writeFileSync('src/App.tsx', app);
