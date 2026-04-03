const fs = require('fs');
let c = fs.readFileSync('src/pages/FormViewer.jsx', 'utf8');

c = c.replace(/const validateForm = \(\) => \{[\s\S]*?return Object\.keys\(newErrors\)\.length === 0;\n  \};/,
`const getAllItems = () => {
    if (form.sections && form.sections.length > 0) {
      return form.sections.flatMap(section => section.items || []);
    }
    return form.questions || [];
  };

  const validateForm = () => {
    const newErrors = {};

    getAllItems().forEach((item) => {
      if (item.type !== 'layout_block' && item.required) {
        const answer = answers[item.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[item.id] = true;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };`);

c = c.replace(/const formattedAnswers = form\.questions\.map\(\(question\) => \(\{\n\s*questionId: question\.id,\n\s*questionType: question\.type,\n\s*value: answers\[question\.id\] \|\| '',\n\s*\}\)\);/, 
`const formattedAnswers = getAllItems()
        .filter(item => item.type !== 'layout_block')
        .map((question) => ({
          questionId: question.id,
          questionType: question.type,
          value: answers[question.id] || '',
        }));`);

c = c.replace(/\{form\.questions\.map\(\(question, index\) => \([\s\S]*?<\/motion\.div>\n\s*\)\)}/, 
`{(form.sections && form.sections.length > 0 ? form.sections : [{ id: 'default', title: '', items: form.questions || [] }]).map((section, sIndex) => (
          <div key={section.id || sIndex} className="mb-8 space-y-4">
            {form.sections && form.sections.length > 1 && (section.title || section.description) && (
              <div className="mb-6 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                {section.title && <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">{section.title}</h2>}
                {section.description && <p className="text-gray-500 mt-2 text-sm">{section.description}</p>}
              </div>
            )}
            {(section.items || []).map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <QuestionPreview
                  question={question}
                  answer={answers[question.id]}
                  onChange={handleAnswerChange}
                  errors={errors}
                />
              </motion.div>
            ))}
          </div>
        ))}`);

fs.writeFileSync('src/pages/FormViewer.jsx', c);
console.log('done');
