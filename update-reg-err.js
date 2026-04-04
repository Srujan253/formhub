const fs = require('fs');
const path = require('path');

let regPath = path.join(__dirname, 'frontend/src/pages/RegisterPage.jsx');
let regContent = fs.readFileSync(regPath, 'utf8');

regContent = regContent.replace(
  /setError\(err\.response\?\.data\?\.message \|\| t\('auth\.failedToRegister'\)\);/,
  "const msg = err.response?.data?.message;\n      if (msg === 'User already exists') {\n        setError(t('auth.userAlreadyExists'));\n      } else {\n        setError(msg || t('auth.failedToRegister'));\n      }"
);
fs.writeFileSync(regPath, regContent, 'utf8');
console.log('Register updated for specific errors');
