const fs = require('fs');

let content = fs.readFileSync('src/lib/sheetsService.ts', 'utf8');

content = content.replace(/name: row\[1\] !== "-" \? row\[1\] : "",/g, 'name: (row[1] && row[1] !== "-") ? row[1] : "",');
content = content.replace(/parentName: row\[2\] !== "-" \? row\[2\] : "",/g, 'parentName: (row[2] && row[2] !== "-") ? row[2] : "",');
content = content.replace(/nik: row\[3\] !== "-" \? row\[3\] : "",/g, 'nik: (row[3] && row[3] !== "-") ? row[3] : "",');
content = content.replace(/gender: row\[4\] !== "-" \? row\[4\] : "Laki-laki",/g, 'gender: (row[4] && row[4] !== "-") ? row[4] : "Laki-laki",');
content = content.replace(/category: row\[6\] !== "-" \? row\[6\] : "Anak Stunting",/g, 'category: (row[6] && row[6] !== "-") ? row[6] : "Anak Stunting",');
content = content.replace(/propinsi: row\[7\] !== "-" \? row\[7\] : "Nusa Tenggara Timur",/g, 'propinsi: (row[7] && row[7] !== "-") ? row[7] : "Nusa Tenggara Timur",');
content = content.replace(/kabupaten: row\[8\] !== "-" \? row\[8\] : "Nagekeo",/g, 'kabupaten: (row[8] && row[8] !== "-") ? row[8] : "Nagekeo",');
content = content.replace(/puskesmas: row\[9\] !== "-" \? row\[9\] : "",/g, 'puskesmas: (row[9] && row[9] !== "-") ? row[9] : "",');
content = content.replace(/kelurahan: row\[10\] !== "-" \? row\[10\] : "",/g, 'kelurahan: (row[10] && row[10] !== "-") ? row[10] : "",');
content = content.replace(/dusun: row\[11\] !== "-" \? row\[11\] : "",/g, 'dusun: (row[11] && row[11] !== "-") ? row[11] : "",');
content = content.replace(/posyandu: row\[12\] !== "-" \? row\[12\] : "",/g, 'posyandu: (row[12] && row[12] !== "-") ? row[12] : "",');
content = content.replace(/attendanceStatus: row\[13\] !== "-" \? row\[13\] : "Mengunjungi Posyandu",/g, 'attendanceStatus: (row[13] && row[13] !== "-") ? row[13] : "Mengunjungi Posyandu",');
content = content.replace(/notes: row\[20\] !== "-" \? row\[20\] : ""/g, 'notes: (row[20] && row[20] !== "-") ? row[20] : ""');

// For Ibu Hamil
content = content.replace(/namaIbu: row\[1\] !== "-" \? row\[1\] : "",/g, 'namaIbu: (row[1] && row[1] !== "-") ? row[1] : "",');
content = content.replace(/alamat: row\[4\] !== "-" \? row\[4\] : "",/g, 'alamat: (row[4] && row[4] !== "-") ? row[4] : "",');
content = content.replace(/catatan: row\[10\] !== "-" \? row\[10\] : ""/g, 'catatan: (row[10] && row[10] !== "-") ? row[10] : ""');

// For Ibu Menyusui
content = content.replace(/bayiNama: row\[9\] !== "-" \? row\[9\] : "",/g, 'bayiNama: (row[9] && row[9] !== "-") ? row[9] : "",');

// Also filter out completely empty rows (where name is empty)
content = content.replace(/const parsedMbg = sheetMbg.map/g, 'const parsedMbg = sheetMbg.filter((r: any[]) => r && r[1]).map');
content = content.replace(/const parsedIbuHamil = sheetIbuHamil.map/g, 'const parsedIbuHamil = sheetIbuHamil.filter((r: any[]) => r && r[1]).map');
content = content.replace(/const parsedIbuMenyusui = sheetIbuMenyusui.map/g, 'const parsedIbuMenyusui = sheetIbuMenyusui.filter((r: any[]) => r && r[1]).map');

fs.writeFileSync('src/lib/sheetsService.ts', content);
