const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const pushLogic = `
  const handlePushToSheetsBackground = async () => {
    if (!googleToken || !data) return;
    try {
      const activeUser = currentUser;
      const [latestBens, sheetConfig, latestHamil, latestMenyusui, latestVisitors, latestAudits] = await Promise.all([
        getBeneficiariesApi(),
        getAdminSheetConfigApi(),
        getIbuHamilApi(),
        getIbuMenyusuiApi(),
        fetchVisitorLogsApi(),
        fetchAuditLogsApi()
      ]);
      const fullData = {
        ...data,
        beneficiaries: (latestBens && Array.isArray(latestBens)) ? latestBens : beneficiaries,
        ibuHamil: (latestHamil && Array.isArray(latestHamil)) ? latestHamil : [],
        ibuMenyusui: (latestMenyusui && Array.isArray(latestMenyusui)) ? latestMenyusui : [],
        visitorLogs: (latestVisitors && Array.isArray(latestVisitors)) ? latestVisitors : [],
        auditLogs: (latestAudits && Array.isArray(latestAudits)) ? latestAudits : [],
        adminSheetUrl: sheetConfig?.adminSheetUrl || data.adminSheetUrl,
        adminSheetId: sheetConfig?.adminSheetId || data.adminSheetId
      };
      
      const result = await syncToGoogleSheets(googleToken, data.kabupatenName, fullData, activeUser?.email || undefined);
      if (result.spreadsheetUrl && result.spreadsheetUrl !== sheetsSyncUrl) {
        setSheetsSyncUrl(result.spreadsheetUrl);
        await updateAdminSheetConfigApi(result.spreadsheetUrl);
      }
    } catch (e) {
      console.error("Background push failed", e);
    }
  };
`;

// Insert pushLogic right before handleSyncSheetsDirect
content = content.replace('  const handleSyncSheetsDirect = async (token: string, userObj?: User | null) => {', pushLogic + '\n  const handleSyncSheetsDirect = async (token: string, userObj?: User | null) => {');

// Rewrite handleSyncSheetsDirect to use pullFromGoogleSheets
const directLogic = `
  const handleSyncSheetsDirect = async (token: string, userObj?: User | null) => {
    if (!data) return;
    setSyncingSheets(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      let activeSheetId = sheetsSyncUrl;
      if (!activeSheetId) {
         const sheetConfig = await getAdminSheetConfigApi();
         activeSheetId = sheetConfig?.adminSheetId || data.adminSheetId;
      } else {
         const match = activeSheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
         if (match) activeSheetId = match[1];
      }
      
      if (!activeSheetId) {
         // If there's no sheet id, just push to create one
         await handlePushToSheetsBackground();
         setSyncSuccess(true);
         setTimeout(() => setSyncSuccess(false), 5000);
         return;
      }
      
      await pullFromGoogleSheets(token, activeSheetId);
      
      setRefreshTrigger(prev => prev + 1);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError("Gagal memuat data dari Sheet: " + err.message);
    } finally {
      setSyncingSheets(false);
    }
  };
`;

// Replace handleSyncSheetsDirect implementation
const startIdx = content.indexOf('  const handleSyncSheetsDirect = async (token: string, userObj?: User | null) => {');
const endIdx = content.indexOf('  const handleSyncSheets = async () => {');
content = content.substring(0, startIdx) + directLogic + content.substring(endIdx);

fs.writeFileSync('src/App.tsx', content);
