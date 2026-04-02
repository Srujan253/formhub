const fs = require('fs');
const enPath = './src/locales/en.json';
const jpPath = './src/locales/jp.json';

const enUpdates = {
  home: {
    dashboard: "Dashboard",
    my: "My ",
    forms: "Forms",
    heroDesc: "Create, share, and analyze forms with ease. Get beautiful insights in real time.",
    createNewForm: "Create New Form",
    loadError: "Failed to load forms. Please try again.",
    loading: "Loading your forms...",
    noFormsYet: "No forms yet",
    createFirstDesc: "Create your first form to start collecting responses",
    createYourFirst: "Create Your First Form",
    active: "Active",
    inactive: "Inactive",
    questions: "questions",
    edit: "Edit",
    qrCode: "QR Code",
    results: "Results"
  },
  formBuilder: {
    createNewForm: "Create New Form",
    formTitle: "Form Title *",
    formTitlePlaceholder: "e.g., Customer Feedback Survey",
    descriptionLabel: "Description",
    formHeaderImage: "FORM HEADER IMAGE",
    dropFile: "Drop file or Click to upload",
    edit: "Edit"
  }
};

const jpData = {
  header: {
    myForms: "マイフォーム",
    create: "フォーム作成",
    logout: "ログアウト",
    dashboard: "ダッシュボード"
  },
  auth: {
    welcomeBack: "お帰りなさい",
    createAccount: "アカウントを作成",
    email: "メールアドレス",
    password: "パスワード",
    name: "氏名",
    register: "アカウント登録",
    login: "ログイン",
    about: "ご自身／組織についてお聞かせください",
    pendingReview: "審査待ち",
    invalidCredentials: "ログインに失敗しました。認証情報が間違っています。",
    alreadyHave: "すでにアカウントをお持ちですか？ ログイン",
    dontHave: "アカウントをお持ちではありませんか？ 登録",
    pulseAnimation: "申請はモデレーターに送信されました。確認が完了次第、アクセス可能になります。"
  },
  admin: {
    userManagement: "ユーザー管理",
    verify: "承認する",
    delete: "削除"
  },
  home: {
    search: "フォームを検索...",
    recent: "最近のフォーム",
    noForms: "フォームがありません",
    createFirst: "最初のフォームを作成する",
    responses: "件の回答",
    dashboard: "ダッシュボード",
    my: "マイ",
    forms: "フォーム",
    heroDesc: "フォームを簡単に作成・共有・分析。",
    createNewForm: "新規作成",
    loadError: "フォームの読み込みに失敗しました。",
    loading: "読み込み中...",
    noFormsYet: "フォームがありません",
    createFirstDesc: "最初のフォームを作成して回答を収集しましょう",
    createYourFirst: "最初のフォームを作成する",
    active: "アクティブ",
    inactive: "非アクティブ",
    questions: "質問",
    edit: "編集",
    qrCode: "QRコード",
    results: "結果"
  },
  formBuilder: {
    addQuestion: "質問を追加",
    addTitleDesc: "タイトルと説明を追加",
    saveForm: "フォームを保存",
    sectionBreak: "セクション区切り",
    saving: "保存中...",
    allSaved: "保存済み",
    saveNow: "今すぐ保存",
    sectionTitle: "セクションのタイトル",
    description: "説明 (任意)",
    questionTitle: "質問のタイトル",
    required: "必須",
    addOther: "「その他」を追加",
    backToForms: "フォーム一覧へ戻る",
    share: "共有",
    preview: "プレビュー",
    createNewForm: "新規フォーム作成",
    formTitle: "フォームのタイトル *",
    formTitlePlaceholder: "例：顧客フィードバックアンケート",
    descriptionLabel: "説明",
    formHeaderImage: "ヘッダー画像",
    dropFile: "ファイルをドロップ、またはクリックしてアップロード",
    edit: "編集",
    types: {
      short_answer: "記述式",
      paragraph: "段落",
      multiple_choice: "マルチチョイス",
      radio: "ラジオボタン",
      checkboxes: "チェックボックス",
      dropdown: "プルダウン",
      file_upload: "ファイルアップロード",
      linear_scale: "均等目盛",
      section_break: "セクション区切り"
    }
  },
  public: {
    submit: "回答を送信",
    submitting: "送信中...",
    next: "次へ",
    back: "戻る",
    thankYou: "ありがとうございます！",
    success: "回答が正常に送信されました。",
    submitAnother: "別の回答を送信する",
    poweredBy: "Powered by",
    requiredField: "* は必須項目です"
  },
  dashboard: {
    totalResponses: "総回答数",
    exportCsv: "CSVエクスポート",
    share: "共有",
    backToForm: "フォームに戻る",
    summary: "概要",
    individual: "個別",
    questions: "質問"
  },
  footer: {
    rights: "無断転載を禁じます",
    privacy: "プライバシーポリシー"
  }
};

let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

for (const [key, val] of Object.entries(enUpdates)) {
  enData[key] = { ...enData[key], ...val };
}

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(jpPath, JSON.stringify(jpData, null, 2), 'utf8');
console.log('Locales successfully written!');
