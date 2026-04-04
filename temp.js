const fs = require('fs');

const jpPath = 'E:/vill_design/google_form/frontend/src/locales/jp.json';
const data = JSON.parse(fs.readFileSync(jpPath, 'utf8'));

// Fix "?" strings
data.header.adminPanel = "管理者パネル";
data.header.settings = "設定";

// Auth fixes
data.auth.appUnderReview = "審査中";
data.auth.appUnderReviewDesc = "あなたのお申し込みはモデレーターに送信されています。確認され次第、アクセス可能になります。";
data.auth.status = "ステータス:";
data.auth.pendingApproval = "承認待ち";
data.auth.logoutOrSwitch = "ログアウトして別のアカウントを使用";
data.auth.userAlreadyExists = "ユーザーは既に存在します";
data.auth.failedToRegister = "登録に失敗しました";
data.auth.failedToLogin = "ログインに失敗しました";
data.auth.languageJapanese = "日本語";
data.auth.failedToRegister = "アカウント登録に失敗しました";

// Admin fixes
data.admin.userVerified = "ユーザーが正常に確認されました";
data.admin.userDeleted = "ユーザーが正常に削除されました";
data.admin.roleChanged = "権限が正常に更新されました";
data.admin.errorVerifying = "確認処理に失敗しました";
data.admin.errorDeleting = "削除処理に失敗しました";
data.admin.errorChangingRole = "権限の更新に失敗しました";
data.admin.settings = "コマンドセンター";

data.formBuilder.types = {
  "short_answer": "Short Answer (記述式)",
  "paragraph": "Paragraph (段落)",
  "multiple_choice": "Multiple Choice",
  "radio": "Radio buttons (ラジオボタン)",
  "checkboxes": "Checkboxes (チェックボックス)",
  "dropdown": "Dropdown (プルダウン)",
  "file_upload": "File Upload (ファイルアップロード)",
  "linear_scale": "Linear Scale",
  "section_break": "Section Break (セクション区切り)",
  "grid_choice": "Multiple Choice Grid",
  "grid_checkbox": "Checkbox Grid"
};

// Also verify FormBuilder inputs have valid Japanese vs "?" 
// Re-write to ensure UTF-8 is solid
fs.writeFileSync(jpPath, JSON.stringify(data, null, 2), 'utf8');
console.log("Updated jp.json cleanly");