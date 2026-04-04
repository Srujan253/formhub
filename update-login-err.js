const fs = require('fs');
const path = require('path');

let loginPath = path.join(__dirname, 'frontend/src/pages/LoginPage.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace(
  /setError\(err\.response\?\.data\?\.message \|\| t\('auth\.failedToLogin'\)\);/,
  "const msg = err.response?.data?.message;\n      if (msg === 'Invalid credentials') {\n        setError(t('auth.failedToLogin'));\n      } else {\n        setError(msg || t('auth.failedToLogin'));\n      }"
);

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('Login updated for specific errors');
