import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = re.sub(r"import \{ useParams \} from 'react-router-dom';", 
                         "import { useParams } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';", 
                         content)

    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const PublicFormView = () => {", 
                                  "const PublicFormView = () => {\n  const { t } = useTranslation();")

    replacements = {
        'Fields marked with * are required': "{t('public.requiredField')}",
        '>Next</button>': ">{t('public.next')}</button>",
        '>Back</button>': ">{t('public.back')}</button>",
        '>Submit Response</button>': ">{t('public.submit')}</button>",
        'Submitting...': "{t('public.submitting')}",
        '>Thank You!</h2>': ">{t('public.thankYou')}</h2>",
        'Your response has been successfully submitted.': "{t('public.success')}",
        'Submit Another Response': "{t('public.submitAnother')}",
        '>Powered by</span>': ">{t('public.poweredBy')}</span>",
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('frontend/src/pages/PublicFormView.jsx')
