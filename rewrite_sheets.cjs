const fs = require('fs');

let content = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');

// We will add pullFromGoogleSheets
const pullFunc = `
export async function pullFromGoogleSheets(accessToken: string, spreadsheetId: string) {
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

      const parsedMbg = sheetMbg.map((row: any[]) => ({
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

      const parsedIbuHamil = sheetIbuHamil.map((row: any[]) => ({
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

      const parsedIbuMenyusui = sheetIbuMenyusui.map((row: any[]) => ({
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

      // Post back to API to save to server
      const baseUrl = window.location.origin;
      await fetch(\`\${baseUrl}/api/beneficiaries/batch\`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaries: parsedMbg })
      }).catch(e => console.error(e));
      
      await fetch(\`\${baseUrl}/api/ibu-hamil/batch\`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ibuHamil: parsedIbuHamil })
      }).catch(e => console.error(e));
      
      await fetch(\`\${baseUrl}/api/ibu-menyusui/batch\`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ibuMenyusui: parsedIbuMenyusui })
      }).catch(e => console.error(e));

      return {
        success: true,
        beneficiaries: parsedMbg,
        ibuHamil: parsedIbuHamil,
        ibuMenyusui: parsedIbuMenyusui
      };
    }
  } catch (err) {
    console.error("Error saat pull data dari Google Sheets:", err);
    throw err;
  }
}
`;

content = content + "\n" + pullFunc;

fs.writeFileSync('src/lib/sheetsService.ts', content);
