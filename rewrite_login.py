import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = re.sub(r"import \{ useNavigate, Link \} from 'react-router-dom';", 
                         "import { useNavigate, Link } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';", 
                         content)

    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const LoginPage = () => {", 
                                  "const LoginPage = () => {\n  const { t } = useTranslation();")

    replacements = {
        'Welcome back': "{t('auth.welcomeBack')}",
        'Sign in to continue to Pulse': "{t('auth.login')}",
        '>Email address</label>': ">{t('auth.email')}</label>",
        '>Password</label>': ">{t('auth.password')}</label>",
        'Signing in...': "{t('auth.login')}...",
        'Sign in\n': "{t('auth.login')}\n",
        "Don't have an account? <span className=\"underline\">Register</span>": "{t('auth.dontHave')}",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('frontend/src/pages/LoginPage.jsx')
