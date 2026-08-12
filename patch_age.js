const fs = require('fs');
const file = 'src/components/DataInputCenter.tsx';
let code = fs.readFileSync(file, 'utf-8');

const helperCode = `
export function calculateAgeFromBirthDate(birthDateStr?: string, fallbackAge?: string): string {
  if (!birthDateStr) return fallbackAge || "";
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return fallbackAge || "";
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      months += 12;
    }
  }

  if (years < 0) return fallbackAge || ""; 

  let ageStr = "";
  if (years > 0) ageStr += \`\${years} Tahun\`;
  if (months > 0) {
    if (ageStr) ageStr += " ";
    ageStr += \`\${months} Bulan\`;
  }
  
  if (years === 0 && months === 0) {
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    ageStr = \`\${diffDays} Hari\`;
  }
  
  return ageStr || fallbackAge || "";
}

`;

if (!code.includes('calculateAgeFromBirthDate')) {
  code = code.replace('export default function DataInputCenter', helperCode + 'export default function DataInputCenter');
}

// Update table renders
code = code.replace(/b\.age/g, "calculateAgeFromBirthDate(b.birthDate, b.age)");

// We should be careful about replacing `setBenAge(b.age || "")`
// Let's revert that specific one.
code = code.replace(/setBenAge\(calculateAgeFromBirthDate\(b\.birthDate, b\.age\) \|\| ""\)/g, "setBenAge(b.age || \"\")");

// Also replace selectedDetailBen.age with calculateAgeFromBirthDate
code = code.replace(/selectedDetailBen\.age/g, "calculateAgeFromBirthDate(selectedDetailBen.birthDate, selectedDetailBen.age)");

// For the edit form change:
const oldOnChange = `onChange={(e) => setBenBirthDate(e.target.value)}`;
const newOnChange = `onChange={(e) => {
                      const val = e.target.value;
                      setBenBirthDate(val);
                      if (val) {
                        setBenAge(calculateAgeFromBirthDate(val, benAge));
                      }
                    }}`;
code = code.replace(oldOnChange, newOnChange);

fs.writeFileSync(file, code);
