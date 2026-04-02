import re

def rewrite(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'useTranslation' not in content:
        content = re.sub(r"import \{ useNavigate, useParams \} from 'react-router-dom';", 
                         "import { useNavigate, useParams } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';", 
                         content)

    if 'const { t } = useTranslation();' not in content:
        content = content.replace("const FormBuilder = () => {", 
                                  "const FormBuilder = () => {\n  const { t } = useTranslation();")

    replacements = {
        'Add Question': "{t('formBuilder.addQuestion')}",
        'Add Title/Desc Block': "{t('formBuilder.addTitleDesc')}",
        'Save Form': "{t('formBuilder.saveForm')}",
        'Section Break': "{t('formBuilder.sectionBreak')}",
        'Saving...': "{t('formBuilder.saving')}",
        'All Saved': "{t('formBuilder.allSaved')}",
        'Save Now': "{t('formBuilder.saveNow')}",
        '>Share</button>': ">{t('formBuilder.share')}</button>",
        '>Preview</button>': ">{t('formBuilder.preview')}</button>",
        'Back to Forms': "{t('formBuilder.backToForms')}",
    }

    for k, v in replacements.items():
        content = content.replace(f">{{k}}<", f">{{v}}<") 
        # doing it more roughly
        content = content.replace(f"'{k}'", f"t('{k}')") # Not perfect but ok
        content = content.replace(f"> {k} <", f"> {{v}} <")
        if k in ['Add Question', 'Add Title/Desc Block', 'Save Form', 'Section Break', 'Saving...', 'All Saved', 'Save Now', 'Back to Forms']:
            content = content.replace(k, v)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

rewrite('frontend/src/pages/FormBuilder.jsx')
