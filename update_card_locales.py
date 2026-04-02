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
    'home': {
        'active': 'Active',
        'inactive': 'Inactive',
        'questions': 'questions',
        'edit': 'Edit',
        'qrCode': 'QR Code',
        'results': 'Results'
    }
}

jp_updates = {
    'home': {
        'active': 'アクティブ',
        'inactive': '非アクティブ',
        'questions': '質問',
        'edit': '編集',
        'qrCode': 'QRコード',
        'results': '結果'
    }
}

update_json('src/locales/en.json', en_updates)
update_json('src/locales/jp.json', jp_updates)
