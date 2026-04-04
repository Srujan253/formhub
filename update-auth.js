const fs = require('fs');
const path = require('path');

// RegisterPage
let regPath = path.join(__dirname, 'frontend/src/pages/RegisterPage.jsx');
let regContent = fs.readFileSync(regPath, 'utf8');

regContent = regContent.replace(
  /\|\| 'Failed to register'/g,
  "|| t('auth.failedToRegister')"
);

fs.writeFileSync(regPath, regContent, 'utf8');
console.log('Register updated!');

// LoginPage
let loginPath = path.join(__dirname, 'frontend/src/pages/LoginPage.jsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace(
  /\|\| 'Failed to login'/g,
  "|| t('auth.failedToLogin')"
);

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('Login updated!');
