const fs = require('fs');

function updateJSON(path, updates) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const group in updates) {
    if (!data[group]) data[group] = {};
    for (const key in updates[group]) {
      data[group][key] = updates[group][key];
    }
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

updateJSON('E:/vill_design/google_form/frontend/src/locales/en.json', {
  admin: {
    commandCenter: "Command Center",
    commandCenterDesc: "Manage users, roles, and verifications.",
    createUser: "Create User",
    createStaff: "Create Staff Account",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    selectRole: "Select Role",
    staffRole: "Staff",
    adminRole: "Admin",
    managerRole: "Manager",
    aboutLabel: "About:",
    pendingStatus: "Pending",
    activeStatus: "Active",
    deleteConfirm: "Delete User?",
    deleteConfirmDesc: "This action cannot be undone.",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm",
    errorCreatingUser: "Failed to create user",
    userCreated: "User created successfully",
    systemAdmin: "System Admin"
  }
});

updateJSON('E:/vill_design/google_form/frontend/src/locales/jp.json', {
  admin: {
    commandCenter: "コマンドセンター",
    commandCenterDesc: "ユーザー、権限、および認証を一元管理します。",
    createUser: "ユーザーを作成",
    createStaff: "スタッフアカウントを作成",
    nameLabel: "氏名",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    selectRole: "権限を選択",
    staffRole: "スタッフ",
    adminRole: "管理者",
    managerRole: "マネージャー",
    aboutLabel: "詳細:",
    pendingStatus: "承認待ち",
    activeStatus: "アクティブ",
    deleteConfirm: "ユーザーを削除しますか？",
    deleteConfirmDesc: "この操作は元に戻せません。",
    cancelBtn: "キャンセル",
    confirmBtn: "確認",
    errorCreatingUser: "ユーザーの作成に失敗しました",
    userCreated: "ユーザーが作成されました",
    systemAdmin: "システム管理者"
  },
  auth: {
    appUnderReview: "審査中",
    appUnderReviewDesc: "あなたのお申し込みはモデレーターに送信されています。審査が完了次第、アクセス可能になります。",
    pendingApproval: "承認待ち"
  }
});

console.log("Successfully updated ALL admin keys in locales!");
