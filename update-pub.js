const fs = require('fs');
const path = require('path');

let pubPath = path.join(__dirname, 'frontend/src/pages/PublicFormView.jsx');
let pubContent = fs.readFileSync(pubPath, 'utf8');

pubContent = pubContent.replace(
  />Pulse<\/span>/g,
  ">{t('appName', { defaultValue: 'Pulse' })}</span>"
);

fs.writeFileSync(pubPath, pubContent, 'utf8');
console.log('PublicFormView updated for Pulse');
