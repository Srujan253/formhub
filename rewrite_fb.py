import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = {
        '>Create New Form</h2>': ">{t('formBuilder.createNewForm')}</h2>",
        '>Form Title *</label>': ">{t('formBuilder.formTitle')}</label>",
        'placeholder="e.g., Customer Feedback Survey"': 'placeholder={t(\'formBuilder.formTitlePlaceholder\')}',
        '>Description</label>': ">{t('formBuilder.descriptionLabel')}</label>",
        '>FORM HEADER IMAGE</label>': ">{t('formBuilder.formHeaderImage')}</label>",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('src/pages/FormBuilder.jsx')
