import json

def update_json(filepath, updates):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    def merge(a, b):
        for key, value in b.items():
            if isinstance(value, dict) and key in a:
                merge(a[key], value)
            else:
                a[key] = value
        return a
    data = merge(data, updates)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

en_updates = {
    'formBuilder': {
        'createNewForm': 'Create New Form',
        'formTitle': 'Form Title *',
        'formTitlePlaceholder': 'e.g., Customer Feedback Survey',
        'descriptionLabel': 'Description',
        'formHeaderImage': 'FORM HEADER IMAGE',
        'dropFile': 'Drop file or Click to upload',
        'edit': 'Edit'
    }
}

jp_updates = {
    'formBuilder': {
        'createNewForm': '新規フォーム作成',
        'formTitle': 'フォームのタイトル *',
        'formTitlePlaceholder': '例：顧客フィードバックアンケート',
        'descriptionLabel': '説明',
        'formHeaderImage': 'ヘッダー画像',
        'dropFile': 'ファイルをドロップ、またはクリックしてアップロード',
        'edit': '編集'
    }
}

update_json('src/locales/en.json', en_updates)
update_json('src/locales/jp.json', jp_updates)
