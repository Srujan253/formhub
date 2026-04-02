import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add useTranslation import
    if 'useTranslation' not in content:
        content = re.sub(r"import \{ useNavigate \} from 'react-router-dom';", 
                         "import { useNavigate } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';", 
                         content)

    # Add t hook
    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const HomePage = () => {", 
                                  "const HomePage = () => {\n  const { t } = useTranslation();")

    # Replace texts with t()
    replacements = {
        'Dashboard': "{t('home.dashboard')}",
        'My <span': "{t('home.my')} <span",
        '>Forms</span>': ">{t('home.forms')}</span>",
        'Create, share, and analyze forms with ease. Get beautiful insights in real time.': "{t('home.heroDesc')}",
        'Create New Form': "{t('home.createNewForm')}",
        'Failed to load forms. Please try again.': "{t('home.loadError')}",
        'Loading your forms...': "{t('home.loading')}",
        'No forms yet': "{t('home.noFormsYet')}",
        'Create your first form to start collecting responses': "{t('home.createFirstDesc')}",
        'Create Your First Form': "{t('home.createYourFirst')}",
        "{forms.length} form{forms.length !== 1 ? 's' : ''}": "{forms.length} {t('home.forms')}"
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('frontend/src/pages/HomePage.jsx')
