const fs = require('fs');
const path = require('path');

// PendingReview.jsx
let prPath = path.join(__dirname, 'frontend/src/pages/PendingReview.jsx');
let prContent = fs.readFileSync(prPath, 'utf8');

prContent = prContent.replace(
  /{i18n\.language === 'en' \? 'æ—¥æœ¬èªž' : 'English'}/,
  "{i18n.language === 'en' ? t('auth.languageJapanese') : t('auth.languageEnglish')}"
);
prContent = prContent.replace(
  /{i18n\.language === 'en' \? 'Application under review' : 'å¯©æŸ»ä¸'}/,
  "{t('auth.appUnderReview')}"
);
prContent = prContent.replace(
  /{\s*i18n\.language === 'en'\s*\?\s*'Your application is being beamed to our moderators\. Youâ€™ll gain access once verified\.'\s*:\s*'ã‚ãªãŸã®ãŠç”³ã—è¾¼ã¿ã¯ãƒ¢ãƒ‡ãƒ¬ãƒ¼ã‚¿ãƒ¼ã«é€ä¿¡ã•ã‚Œã¦ã„ã¾ã™ã€‚ç¢ºèªã•ã‚Œæ¬¡ç¬¬ã€ã‚¢ã‚¯ã‚»ã‚¹å¯èƒ½ã«ãªã‚Šã¾ã™ã€‚'\s*}/g,
  "{t('auth.appUnderReviewDesc')}"
);
prContent = prContent.replace(
  /<p className="text-sm font-semibold text-slate-700 mb-1">Status:<\/p>/,
  '<p className="text-sm font-semibold text-slate-700 mb-1">{t(\'auth.status\')}</p>'
);
prContent = prContent.replace(
  /Pending Approval/,
  "{t('auth.pendingApproval')}"
);
prContent = prContent.replace(
  /{i18n\.language === 'en' \? 'Log out \/ Switch Account' : 'ãƒã‚°ã‚¢ã‚¦ãƒƒˆã—ã¦åˆ¥ã®ã‚¢ã‚«ã‚¦ãƒ³ãƒˆã‚’ä½¿ç”¨'}/,
  "{t('auth.logoutOrSwitch')}"
);

fs.writeFileSync(prPath, prContent, 'utf8');
console.log('PendingReview updated!');
