import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = re.sub(r"import \{ useNavigate, Link \} from 'react-router-dom';", 
                         "import { useNavigate, Link } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';", 
                         content)

    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const RegisterPage = () => {", 
                                  "const RegisterPage = () => {\n  const { t } = useTranslation();")

    replacements = {
        'Create your account': "{t('auth.createAccount')}",
        'Get started with Pulse today': "{t('auth.register')}",
        '>Full Name</label>': ">{t('auth.name')}</label>",
        '>Email address</label>': ">{t('auth.email')}</label>",
        '>Password</label>': ">{t('auth.password')}</label>",
        'Creating account...': "{t('auth.register')}...",
        'Sign up\n': "{t('auth.register')}\n",
        "Already have an account? <span className=\"underline\">Sign in</span>": "{t('auth.alreadyHave')}",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('frontend/src/pages/RegisterPage.jsx')
