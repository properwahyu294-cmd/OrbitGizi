const fs = require('fs');

function addOnDataChange(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/export default function (\w+)\(\) \{/, 'export default function $1({ onDataChange }: { onDataChange?: () => void }) {');
  content = content.replace(/const newList = await saveIbuHamilApi\(newItem\);\n      setBeneficiaries\(newList\);/g, 'const newList = await saveIbuHamilApi(newItem);\n      setBeneficiaries(newList);\n      if (onDataChange) onDataChange();');
  content = content.replace(/const newList = await deleteIbuHamilApi\(b\.id\);\n          setBeneficiaries\(newList\);/g, 'const newList = await deleteIbuHamilApi(b.id);\n          setBeneficiaries(newList);\n          if (onDataChange) onDataChange();');
  content = content.replace(/const newList = await saveIbuMenyusuiApi\(newItem\);\n      setBeneficiaries\(newList\);/g, 'const newList = await saveIbuMenyusuiApi(newItem);\n      setBeneficiaries(newList);\n      if (onDataChange) onDataChange();');
  content = content.replace(/const newList = await deleteIbuMenyusuiApi\(b\.id\);\n          setBeneficiaries\(newList\);/g, 'const newList = await deleteIbuMenyusuiApi(b.id);\n          setBeneficiaries(newList);\n          if (onDataChange) onDataChange();');
  fs.writeFileSync(file, content);
}

addOnDataChange('src/components/IbuHamilView.tsx');
addOnDataChange('src/components/IbuMenyusuiView.tsx');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<IbuHamilView \/>/g, '<IbuHamilView onDataChange={handlePushToSheetsBackground} />');
app = app.replace(/<IbuMenyusuiView \/>/g, '<IbuMenyusuiView onDataChange={handlePushToSheetsBackground} />');
fs.writeFileSync('src/App.tsx', app);

