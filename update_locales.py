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
        'dashboard': 'Dashboard',
        'my': 'My ',
        'forms': 'Forms',
        'heroDesc': 'Create, share, and analyze forms with ease. Get beautiful insights in real time.',
        'createNewForm': 'Create New Form',
        'loadError': 'Failed to load forms. Please try again.',
        'loading': 'Loading your forms...',
        'noFormsYet': 'No forms yet',
        'createFirstDesc': 'Create your first form to start collecting responses',
        'createYourFirst': 'Create Your First Form'
    }
}

jp_updates = {
    'home': {
        'dashboard': '???????',
        'my': '??',
        'forms': '????',
        'heroDesc': '??????????·??·???',
        'createNewForm': '????',
        'loadError': '?????????????????',
        'loading': '?????...',
        'noFormsYet': '??????????',
        'createFirstDesc': '??????????????????????',
        'createYourFirst': '????????????'
    }
}

update_json('src/locales/en.json', en_updates)
update_json('src/locales/jp.json', jp_updates)

