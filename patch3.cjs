const fs = require('fs');
let code = fs.readFileSync('src/lib/dataService.ts', 'utf8');

// Replace import
code = code.replace(
  'import { UnitType } from "../types";',
  'import { UnitType, OrbitGiziData, Pillar, Indicator, Village, MBGBeneficiary } from "../types";'
);

// Remove interface Village
const villageRegex = /export interface Village \{[\s\S]*?pilar5_target_accuracy: number;\n\}/m;
code = code.replace(villageRegex, '');

// Remove interface PillarIndicator
const indicatorRegex = /export interface PillarIndicator \{[\s\S]*?description: string;\n\}/m;
code = code.replace(indicatorRegex, '');

// Remove interface Pillar
const pillarRegex = /export interface Pillar \{[\s\S]*?indicators: PillarIndicator\[\];\n\}/m;
code = code.replace(pillarRegex, '');

// Remove interface OrbitGiziData
const dataRegex = /export interface OrbitGiziData \{[\s\S]*?desc: string;\n  \};\n\}/m;
code = code.replace(dataRegex, '');

fs.writeFileSync('src/lib/dataService.ts', code);
console.log("Patched dataService types");
