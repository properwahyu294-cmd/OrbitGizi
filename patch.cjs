const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleSaveBeneficiary = \(ben: MBGBeneficiary\) => \{[\s\S]*?setRefreshTrigger\(prev => prev \+ 1\);\n    \}\);\n  \};/m;

const replacement = `const handleSaveBeneficiary = (ben: MBGBeneficiary) => {
    const isEdit = beneficiaries.some(b => b.id === ben.id);
    const actionType = isEdit ? "EDIT_SASARAN" : "TAMBAH_SASARAN";
    const desc = isEdit ? \`Mengubah data sasaran MBG/PMT\` : \`Menambah data sasaran baru MBG/PMT (\${ben.category})\`;
    requireOperatorProfileAndExecute(actionType, desc, ben.name, () => {
      let updated: MBGBeneficiary[] = [];
      if (isEdit) {
        updated = beneficiaries.map(b => (b.id === ben.id ? ben : b));
      } else {
        updated = [ben, ...beneficiaries];
      }
      setBeneficiaries(updated);
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      syncBeneficiariesApi(updated).catch(console.error);
      setRefreshTrigger(prev => prev + 1);
    });
  };`;

if (regex.test(code)) {
  fs.writeFileSync('src/App.tsx', code.replace(regex, replacement));
  console.log("Replaced handleSaveBeneficiary");
} else {
  console.log("Regex did not match");
}

const regex2 = /const handleDeleteBeneficiary = \(id: string\) => \{[\s\S]*?setRefreshTrigger\(prev => prev \+ 1\);\n    \}\);\n  \};/m;
const replacement2 = `const handleDeleteBeneficiary = (id: string) => {
    const target = beneficiaries.find(b => b.id === id);
    const targetName = target ? target.name : id;
    requireOperatorProfileAndExecute("HAPUS_SASARAN", "Menghapus data sasaran", targetName, () => {
      const updated = beneficiaries.filter(b => b.id !== id);
      setBeneficiaries(updated);
      localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
      syncBeneficiariesApi(updated).catch(console.error);
      setRefreshTrigger(prev => prev + 1);
    });
  };`;
if (regex2.test(code)) {
  code = fs.readFileSync('src/App.tsx', 'utf8');
  fs.writeFileSync('src/App.tsx', code.replace(regex2, replacement2));
  console.log("Replaced handleDeleteBeneficiary");
}

const regex3 = /const handleAddWeightRecord = \(beneficiaryId: string, record: WeightRecord\) => \{[\s\S]*?setRefreshTrigger\(prev => prev \+ 1\);\n      \}\n    \);\n  \};/m;
const replacement3 = `const handleAddWeightRecord = (beneficiaryId: string, record: WeightRecord) => {
    const target = beneficiaries.find(b => b.id === beneficiaryId);
    const targetName = target ? target.name : beneficiaryId;
    requireOperatorProfileAndExecute(
      "CATAT_PENIMBANGAN",
      \`Mencatat/memperbarui pengukuran BB/TB (\${record.weightKg}kg, \${record.heightCm}cm, Periode: \${record.period})\`,
      targetName,
      () => {
        const updated = beneficiaries.map(b => {
          if (b.id === beneficiaryId) {
            const filtered = b.weightRecords.filter(r => r.period !== record.period);
            return {
              ...b,
              weightRecords: [...filtered, record]
            };
          }
          return b;
        });
        setBeneficiaries(updated);
        localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
        syncBeneficiariesApi(updated).catch(console.error);
        setRefreshTrigger(prev => prev + 1);
      }
    );
  };`;
if (regex3.test(code)) {
  code = fs.readFileSync('src/App.tsx', 'utf8');
  fs.writeFileSync('src/App.tsx', code.replace(regex3, replacement3));
  console.log("Replaced handleAddWeightRecord");
}

const regex4 = /const handleDeleteWeightRecord = \(beneficiaryId: string, period: string\) => \{[\s\S]*?setRefreshTrigger\(prev => prev \+ 1\);\n      \}\n    \);\n  \};/m;
const replacement4 = `const handleDeleteWeightRecord = (beneficiaryId: string, period: string) => {
    const target = beneficiaries.find(b => b.id === beneficiaryId);
    const targetName = target ? target.name : beneficiaryId;
    requireOperatorProfileAndExecute(
      "HAPUS_PENIMBANGAN",
      \`Menghapus riwayat penimbangan periode \${period}\`,
      targetName,
      () => {
        const updated = beneficiaries.map(b => {
          if (b.id === beneficiaryId) {
            const filtered = b.weightRecords.filter(r => r.period !== period);
            return {
              ...b,
              weightRecords: filtered
            };
          }
          return b;
        });
        setBeneficiaries(updated);
        localStorage.setItem("orbit_gizi_local_beneficiaries", JSON.stringify(updated));
        syncBeneficiariesApi(updated).catch(console.error);
        setRefreshTrigger(prev => prev + 1);
      }
    );
  };`;
if (regex4.test(code)) {
  code = fs.readFileSync('src/App.tsx', 'utf8');
  fs.writeFileSync('src/App.tsx', code.replace(regex4, replacement4));
  console.log("Replaced handleDeleteWeightRecord");
}
