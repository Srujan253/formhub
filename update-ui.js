const fs = require('fs');
const path = require('path');

// 1. Update Locales
const enPath = path.join(__dirname, 'frontend/src/locales/en.json');
const jpPath = path.join(__dirname, 'frontend/src/locales/jp.json');

const enLocale = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const jpLocale = JSON.parse(fs.readFileSync(jpPath, 'utf8'));

// Updates for English
enLocale.appName = "Pulse";
if(!enLocale.header) enLocale.header = {};
enLocale.header.adminPanel = "Admin Panel";
enLocale.auth.appUnderReview = "Application under review";
enLocale.auth.appUnderReviewDesc = "Your application is being beamed to our moderators. You'll gain access once verified.";
enLocale.auth.status = "Status:";
enLocale.auth.pendingApproval = "Pending Approval";
enLocale.auth.logoutOrSwitch = "Log out / Switch Account";
enLocale.auth.userAlreadyExists = "User already exists";
enLocale.auth.failedToRegister = "Failed to register";
enLocale.auth.failedToLogin = "Login failed. Invalid credentials.";
enLocale.auth.languageJapanese = "???";
enLocale.auth.languageEnglish = "English";

if (!enLocale.admin) enLocale.admin = {};
enLocale.admin.userVerified = "User verified successfully";
enLocale.admin.userDeleted = "User deleted successfully";
enLocale.admin.roleChanged = "Role updated successfully";
enLocale.admin.errorVerifying = "Failed to verify user";
enLocale.admin.errorDeleting = "Failed to delete user";
enLocale.admin.errorChangingRole = "Failed to update role";
enLocale.admin.settings = "Settings";

// Updates for Japanese
jpLocale.appName = "Pulse";
if(!jpLocale.header) jpLocale.header = {};
jpLocale.header.adminPanel = "??????";
if(!jpLocale.auth) jpLocale.auth = {};
jpLocale.auth.appUnderReview = "???";
jpLocale.auth.appUnderReviewDesc = "??????????????????????????????????????????";
jpLocale.auth.status = "?????:";
jpLocale.auth.pendingApproval = "????";
jpLocale.auth.logoutOrSwitch = "????? / ??????????";
jpLocale.auth.userAlreadyExists = "?????????????";
jpLocale.auth.failedToRegister = "?????????";
jpLocale.auth.failedToLogin = "?????????????????????????";
jpLocale.auth.languageJapanese = "???";
jpLocale.auth.languageEnglish = "English";

if (!jpLocale.admin) jpLocale.admin = {};
jpLocale.admin.userVerified = "???????????????";
jpLocale.admin.userDeleted = "???????????????";
jpLocale.admin.roleChanged = "??????????????";
jpLocale.admin.errorVerifying = "??????????????";
jpLocale.admin.errorDeleting = "??????????????";
jpLocale.admin.errorChangingRole = "?????????????";
jpLocale.admin.settings = "??";

fs.writeFileSync(enPath, JSON.stringify(enLocale, null, 2), 'utf8');
fs.writeFileSync(jpPath, JSON.stringify(jpLocale, null, 2), 'utf8');

console.log("Locales updated!");

let navPath = path.join(__dirname, 'frontend/src/components/Navigation.jsx');
let navContent = fs.readFileSync(navPath, 'utf8');
navContent = navContent.replace(
  /<span className=\"hidden sm:inline\">Settings<\/span>/,
  '<span className=\"hidden sm:inline\">{t(\'header.adminPanel\')}</span>'
);
fs.writeFileSync(navPath, navContent, 'utf8');

console.log("Navigation updated!");
