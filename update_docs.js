const fs = require('fs');

const rbacSection = `
### 🔐 Role-Based Access Control & Hierarchy
- **Admin**: Full system access. Can view all forms, responses, and manage the entire user base (can create/delete Admin, Manager, and Staff accounts).
- **Manager**: Department or team leader. Can orchestrate forms and create/manage **Staff** accounts under them.
- **Staff**: Regular user with restricted access. Can create their own forms and view their specific dashboard, but has no access to user management.
`;

function updateFile(fileName) {
  try {
    let content = fs.readFileSync(fileName, 'utf8');
    
    if (content.includes('Role-Based Access Control')) {
      console.log(fileName + ' already contains RBAC section.');
      return;
    }

    // Insert into Core Features
    content = content.replace('### Core Features\n', '### Core Features\n' + rbacSection);
    
    // Remove from "Planned Additions" or "Enhancements" if it exists
    content = content.replace(/- \[ \] User authentication and form ownership\n?/g, '');
    content = content.replace(/- \[ \] User authentication\n?/g, '');

    fs.writeFileSync(fileName, content);
    console.log('Successfully updated ' + fileName);
  } catch (err) {
    console.error('Error updating ' + fileName + ':', err.message);
  }
}

updateFile('README.md');
updateFile('FEATURES.md');
