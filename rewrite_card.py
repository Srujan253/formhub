import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = content.replace("import React from 'react';", "import React from 'react';\nimport { useTranslation } from 'react-i18next';")

    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const FormCard = ({ form, index, onFormUpdate, onFormDelete }) => {", "const FormCard = ({ form, index, onFormUpdate, onFormDelete }) => {\n  const { t } = useTranslation();")

    replacements = {
        ' ? \'Active\' : \'Inactive\'}': " ? t('home.active') : t('home.inactive')}",
        ' questions': " {t('home.questions')}",
        '>Edit</span>': ">{t('home.edit')}</span>",
        '>QR Code</span>': ">{t('home.qrCode')}</span>",
        '>Results</span>': ">{t('home.results')}</span>",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('src/components/FormCard.jsx')
