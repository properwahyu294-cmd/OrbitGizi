const fs = require('fs');

let content = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');

const replacement = `
  await ensureSheetTabsExist(accessToken, spreadsheetId!);

  // FETCH & MERGE LOGIC (2-WAY SYNC)
  try {
    const fetchRes = await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values:batchGet?ranges=Penerima%20MBG!A2:Z&ranges=Ibu%20Hamil!A2:Z&ranges=Ibu%20Menyusui!A2:Z\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` }
    });
    if (fetchRes.ok) {
      const fetchJson = await fetchRes.json();
      const valueRanges = fetchJson.valueRanges || [];
      
      const sheetMbg = valueRanges[0]?.values || [];
      const sheetIbuHamil = valueRanges[1]?.values || [];
      const sheetIbuMenyusui = valueRanges[2]?.values || [];

      const parsedMbg = sheetMbg.map((row) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : \`ben_\${Date.now()}_\${Math.random().toString(36).substring(2,6)}\`,
        name: row[1] !== "-" ? row[1] : "",
        parentName: row[2] !== "-" ? row[2] : "",
        nik: row[3] !== "-" ? row[3] : "",
        gender: row[4] !== "-" ? row[4] : "Laki-laki",
        age: parseInt(row[5]) || 0,
        category: row[6] !== "-" ? row[6] : "Anak Stunting",
        location: {
          propinsi: row[7] !== "-" ? row[7] : "Nusa Tenggara Timur",
          kabupaten: row[8] !== "-" ? row[8] : "Nagekeo",
          puskesmas: row[9] !== "-" ? row[9] : "",
          kelurahan: row[10] !== "-" ? row[10] : "",
          dusun: row[11] !== "-" ? row[11] : "",
          posyandu: row[12] !== "-" ? row[12] : "",
        },
        attendanceStatus: row[13] !== "-" ? row[13] : "Mengunjungi Posyandu",
        isReceivedMBG: row[15] === "YA",
        isReceivedPMT: row[16] === "YA",
        isPetugasDesaHadir: row[17] === "YA",
        isPetugasPosyanduHadir: row[18] === "YA",
        stakeholdersHadir: (row[19] && row[19] !== "-" && row[19] !== "Petugas Desa, Kader Posyandu, Puskesmas") ? row[19].split(", ") : [],
        notes: row[20] !== "-" ? row[20] : ""
      }));

      const parsedIbuHamil = sheetIbuHamil.map((row) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : \`ibu_\${Date.now()}_\${Math.random().toString(36).substring(2,6)}\`,
        namaIbu: row[1] !== "-" ? row[1] : "",
        umur: parseInt(row[2]) || 0,
        nik: row[3] !== "-" ? row[3] : "",
        alamat: row[4] !== "-" ? row[4] : "",
        puskesmas: row[5] !== "-" ? row[5] : "",
        kelurahan: row[6] !== "-" ? row[6] : "",
        dusun: row[7] !== "-" ? row[7] : "",
        posyandu: row[8] !== "-" ? row[8] : "",
        usiaKehamilan: parseInt(row[9]) || 0,
        catatan: row[10] !== "-" ? row[10] : ""
      }));

      const parsedIbuMenyusui = sheetIbuMenyusui.map((row) => ({
        id: (row[0] && row[0] !== "-") ? row[0] : \`ibum_\${Date.now()}_\${Math.random().toString(36).substring(2,6)}\`,
        namaIbu: row[1] !== "-" ? row[1] : "",
        umur: parseInt(row[2]) || 0,
        nik: row[3] !== "-" ? row[3] : "",
        alamat: row[4] !== "-" ? row[4] : "",
        puskesmas: row[5] !== "-" ? row[5] : "",
        kelurahan: row[6] !== "-" ? row[6] : "",
        dusun: row[7] !== "-" ? row[7] : "",
        posyandu: row[8] !== "-" ? row[8] : "",
        bayiNama: row[9] !== "-" ? row[9] : "",
        catatan: row[10] !== "-" ? row[10] : ""
      }));

      const mergeData = (localArr, sheetArr) => {
        if (!Array.isArray(localArr)) localArr = [];
        const localMap = new Map(localArr.map(item => [item.id, item]));
        const merged = [...localArr];
        sheetArr.forEach(sheetItem => {
          if (!localMap.has(sheetItem.id)) {
            merged.push(sheetItem);
          } else {
             // For simplicity, we could overwrite local with sheet if we trust sheet more, 
             // but keeping local is safer if they just edited in the app. Let's keep local.
          }
        });
        return merged;
      };

      if (data) {
        data.beneficiaries = mergeData(data.beneficiaries, parsedMbg);
        data.ibuHamil = mergeData(data.ibuHamil, parsedIbuHamil);
        data.ibuMenyusui = mergeData(data.ibuMenyusui, parsedIbuMenyusui);
        
        // Post back to API to save to server
        const baseUrl = window.location.origin;
        fetch(\`\${baseUrl}/api/beneficiaries/batch\`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beneficiaries: data.beneficiaries })
        }).catch(e => console.error(e));
        
        fetch(\`\${baseUrl}/api/ibu-hamil/batch\`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ibuHamil: data.ibuHamil })
        }).catch(e => console.error(e));
        
        fetch(\`\${baseUrl}/api/ibu-menyusui/batch\`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ibuMenyusui: data.ibuMenyusui })
        }).catch(e => console.error(e));
      }
    }
  } catch (err) {
    console.error("Error saat fetch & merge data dari Google Sheets:", err);
  }

  // Clear existing data first to avoid trailing mismatched rows
  try {
    await clearSheets(accessToken, spreadsheetId!);
  } catch (err) {
    console.warn("Mencoba membuat spreadsheet baru karena spreadsheet lama mungkin telah dihapus di Drive atau tidak dapat diakses.");
    await initNewSpreadsheet();
    try {
      await ensureSheetTabsExist(accessToken, spreadsheetId!);
      await clearSheets(accessToken, spreadsheetId!);
    } catch (innerErr) {
      console.error("Gagal melakukan pembersihan kedua pada spreadsheet baru:", innerErr);
    }
  }`;

content = content.replace(
  /  await ensureSheetTabsExist\(accessToken, spreadsheetId!\);\n\n  \/\/ Clear existing data first to avoid trailing mismatched rows\n  try {\n    await clearSheets\(accessToken, spreadsheetId!\);\n  } catch \(err\) {\n    console.warn\("Mencoba membuat spreadsheet baru karena spreadsheet lama mungkin telah dihapus di Drive atau tidak dapat diakses."\);\n    await initNewSpreadsheet\(\);\n    try {\n      await ensureSheetTabsExist\(accessToken, spreadsheetId!\);\n      await clearSheets\(accessToken, spreadsheetId!\);\n    } catch \(innerErr\) {\n      console.error\("Gagal melakukan pembersihan kedua pada spreadsheet baru:", innerErr\);\n    }\n  }/,
  replacement
);

fs.writeFileSync('src/lib/sheetsService.ts', content);
