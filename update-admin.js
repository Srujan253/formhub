const fs = require('fs');
const path = require('path');

let adminPath = path.join(__dirname, 'frontend/src/pages/AdminPanel.jsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

adminContent = adminContent.replace(
  /message: 'User verified successfully'/g,
  "message: t('admin.userVerified')"
);
adminContent = adminContent.replace(
  /\|\| 'Error verifying user'/g,
  "|| t('admin.errorVerifying')"
);
adminContent = adminContent.replace(
  /message: \Role updated to \\/g,
  "message: t('admin.roleChanged') + ' ' + newRole"
);
adminContent = adminContent.replace(
  /\|\| 'Error updating role'/g,
  "|| t('admin.errorChangingRole')"
);
adminContent = adminContent.replace(
  /message: 'User deleted successfully'/g,
  "message: t('admin.userDeleted')"
);
adminContent = adminContent.replace(
  /\|\| 'Error deleting user'/g,
  "|| t('admin.errorDeleting')"
);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log('AdminPanel updated!');
