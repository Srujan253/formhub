const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/ResponsesDashboard.jsx', 'utf8');

c = c.replace(
  /\{\s*responses\.map\(\(response, index\) => \([\s\S]*?\}\)\)\s*\}/,
  `{(() => {
            if (responses.length === 0) return <div className="text-center py-10 text-gray-500">No responses yet.</div>;
            const response = responses[currentResponseIndex];
            return (
              <motion.div
                key={response._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="card"
              >
                <div className="mb-4 pb-3 border-b border-gray-100/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(response.respondentName ? response.respondentName : \`R\${currentResponseIndex + 1}\`).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {response.respondentName ? response.respondentName : \`Respondent \${currentResponseIndex + 1}\`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Response #\${currentResponseIndex + 1} &bull; {new Date(response.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.preventDefault(); setCurrentResponseIndex(Math.max(0, currentResponseIndex - 1)); }} 
                      disabled={currentResponseIndex === 0}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      &larr; Prev
                    </button>
                    <span className="text-sm text-gray-500 font-medium px-2">
                      {currentResponseIndex + 1} of {responses.length}
                    </span>
                    <button 
                      onClick={(e) => { e.preventDefault(); setCurrentResponseIndex(Math.min(responses.length - 1, currentResponseIndex + 1)); }} 
                      disabled={currentResponseIndex === responses.length - 1}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {allQuestions.map((question) => {
                    const answer = response.answers.find(
                      (a) => a.questionId === question.id
                    );

                    return (
                      <div key={question.id}>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }} />
                        <div className="px-4 py-2.5 bg-gray-50/80 rounded-xl text-sm text-gray-700 border border-gray-100/80 max-h-[300px] overflow-y-auto">
                          {Array.isArray(answer?.value)
                            ? answer.value.join(', ')
                            : answer?.value || <span className="text-gray-400 italic">No answer</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}`
);

fs.writeFileSync('frontend/src/pages/ResponsesDashboard.jsx', c);
console.log('saved');