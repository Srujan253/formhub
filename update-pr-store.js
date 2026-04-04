const fs = require('fs');
const path = require('path');

let prPath = path.join(__dirname, 'frontend/src/pages/PendingReview.jsx');
let prContent = fs.readFileSync(prPath, 'utf8');

if (!prContent.includes('useConfigStore')) {
  prContent = prContent.replace(
    /import { useAuthStore } from '\.\.\/store\/useAuthStore';/,
    "import { useAuthStore } from '../store/useAuthStore';\nimport { useConfigStore } from '../store/useConfigStore';"
  );

  prContent = prContent.replace(
    /const logout = useAuthStore\(\(state\) => state\.logout\);/,
    "const logout = useAuthStore((state) => state.logout);\n  const setLanguage = useConfigStore((state) => state.setLanguage);"
  );

  prContent = prContent.replace(
    /i18n\.changeLanguage\(newLang\);/,
    "setLanguage(newLang);"
  );
  
  fs.writeFileSync(prPath, prContent, 'utf8');
  console.log("PendingReview store injected");
}
