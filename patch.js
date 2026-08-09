const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleSaveBeneficiary = \(ben: MBGBeneficiary\) => \{[\s\S]*?setRefreshTrigger\(prev => prev \+ 1\);\n    \}\);\n  \};/m;

const replacement = `const handleSaveBeneficiary = (ben: MBGBeneficiary) => {
    const isEdit = beneficiaries.some(b => b.id === ben.id);
    const actionType = isEdit ? "EDIT_SASARAN" : "TAMBAH_SASARAN";
    const desc = isEdit ? \`Mengubah data sasaran MBG/PMT\` : \`Menambah data sasaran baru MBG/PMT (\${ben.category})\`;
    requireOperatorProfileAndExecute(actionType, desc, ben.name, () => {
      let updated = [];
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
