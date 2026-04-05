import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Download, AlertCircle, BarChart3, Users, HelpCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { formAPI, responseAPI } from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, LabelList } from 'recharts';

const RADIO_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#e0e7ff"];
const truncateText = (str, n) => (str && str.length > n ? str.substr(0, n - 1) + '…' : str);

const FileModal = ({ url, onClose }) => {
  const { t } = useTranslation();
  if (!url) return null;
  const isImg = url.includes('/image/upload') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      const filename = url.split('/').pop().split('?')[0] || 'download';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pt-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
      >
         <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-semibold text-gray-800">{t('dashboard.filePreview')}</h3>
           <div className="flex items-center gap-2">
             <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
               <Download className="w-4 h-4" />
               {t('dashboard.downloadOpen')}
             </button>
             <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                 <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
               </svg>
               {t('dashboard.openTab')}
             </a>
             <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
           </div>
         </div>
         <div className="flex-1 overflow-auto bg-gray-100/50 flex items-center justify-center p-4 min-h-[400px]">
           {isImg ? (
             <img src={url} alt="Preview" className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded drop-shadow-sm" />
           ) : (
             url.endsWith('.pdf') ? (
               <iframe src={url + '#toolbar=0'} className="w-full h-[calc(90vh-100px)] rounded shadow-sm border border-gray-200 bg-white" title={t('dashboard.filePreview')} />
             ) : (
               <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm">
                 <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-600 font-medium mb-3">{t('dashboard.noPreview')}</p>
                   <button onClick={handleDownload} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                     {t('dashboard.downloadOpen')}
                   </button>
               </div>
             )
           )}
         </div>
      </motion.div>
    </div>
  );
};

const QuestionSimpleVisual = ({ question, responses, onViewFile }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const isRadio = question.type === 'radio';
  const isCheckbox = question.type === 'checkboxes';

  if (isRadio || isCheckbox) {
    // TODO: map your response data shape here
    const answeredResponses = responses.filter(r => {
      const ans = r.answers?.find(a => a.questionId === question.id);
      return ans && ans.value && (Array.isArray(ans.value) ? ans.value.length > 0 : String(ans.value).trim() !== '');
    });
    const totalRespondents = answeredResponses.length;

    if (totalRespondents === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <TrendingUp size={32} className="mb-2 text-gray-300" />
          <p className="text-sm">{t('dashboard.noResponsesYet')}</p>
        </div>
      );
    }

    const options = question.options?.map(o => o.text) || [];
    const counts = {};
    options.forEach(o => counts[o] = 0);

    answeredResponses.forEach(r => {
      const val = r.answers.find(a => a.questionId === question.id)?.value;
      if (val) {
        const vals = Array.isArray(val) ? val : [val];
        vals.forEach(v => {
          if (counts[v] !== undefined) {
            counts[v]++;
          } else {
            if (counts['Others']) counts['Others']++;
            else counts['Others'] = 1;
          }
        });
      }
    });

    if (isRadio) {
      const chartData = Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .filter(d => options.includes(d.name) || d.name === 'Others' || d.value > 0);

      return (
        <div className="mt-4">
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RADIO_COLORS[index % RADIO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  formatter={(value, name) => {
                    const pct = totalRespondents > 0 ? Math.round((value / totalRespondents) * 100) : 0;
                    return [`${value} (${pct}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-800">{totalRespondents}</span>
              <span className="text-xs text-gray-400">{t('dashboard.responses')}</span>
            </div>
          </div>
          
          <motion.div 
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {chartData.map((entry, index) => {
              const pct = totalRespondents > 0 ? Math.round((entry.value / totalRespondents) * 100) : 0;
              return (
                <motion.div variants={{ hidden: {opacity:0, y:5}, show: {opacity:1, y:0} }} key={index} className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: RADIO_COLORS[index % RADIO_COLORS.length] }}></span>
                  <span className="font-medium mr-2 truncate max-w-[150px]" title={entry.name}>{entry.name}</span>
                  <span className="text-gray-400 font-semibold">{pct}%</span>
                </motion.div>
              );
            })}
          </motion.div>
          <div className="mt-8 text-xs text-gray-400 text-center font-medium">{t('dashboard.basedOnResponses', { count: totalRespondents })}</div>
        </div>
      );
    } else {
      // CHECKBOXES
      const sortedData = Object.entries(counts)
        .map(([name, value]) => ({ 
          name: truncateText(name, 24), 
          fullName: name, 
          value 
        }))
        .filter(d => options.includes(d.fullName) || d.fullName === 'Others' || d.value > 0);

      return (
        <div className="mt-4">
          <div className="w-full" style={{ height: `${Math.max(sortedData.length * 52 + 30, 150)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 120, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: '#475569' }} width={130} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                  formatter={(val, name, props) => {
                    const pct = totalRespondents > 0 ? Math.round((val / totalRespondents) * 100) : 0;
                    return [`${val} (${pct}% of respondents)`, props.payload.fullName];
                  }}
                  labelFormatter={() => null}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={28} isAnimationActive={true} animationBegin={200} animationDuration={1000}>
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    content={(props) => {
                      const { x, y, width, height, value } = props;
                      return (
                        <text x={x + width + 10} y={y + height / 2 + 4} fill="#64748b" fontSize={12} className="font-medium">
                          {value} / {totalRespondents} {t('dashboard.respondents')}
                        </text>
                      );
                    }} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center font-medium">{t('dashboard.basedOnResponses', { count: totalRespondents })}</div>
        </div>
      );
    }
  }

  const rawAnswers = useMemo(() => {
    return responses
      .map(r => r.answers.find(a => a.questionId === question.id)?.value)
      .filter(v => v !== undefined && v !== null && v !== '')
      .flatMap(v => Array.isArray(v) ? v : [v]);
  }, [responses, question.id]);

  if (!rawAnswers.length) {
    return (
      <div className="text-sm text-gray-400 italic py-2">{t('dashboard.noAnswersYet')}</div>
    );
  }

  const displayAnswers = expanded ? rawAnswers : rawAnswers.slice(0, 8);
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {displayAnswers.map((ans, i) => {
            const isFileUpload = question.type === 'file_upload';
            const isImg = isFileUpload && typeof ans === 'string' && (ans.includes('/image/upload') || ans.match(/\.(jpeg|jpg|gif|png|webp)$/i));

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`max-w-[200px] overflow-hidden text-ellipsis px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded-xl border border-gray-200 shadow-sm ${isImg ? 'p-2' : ''}`}
              >
                {isFileUpload && typeof ans === 'string' && ans.startsWith('http') ? (
                  isImg ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-100 bg-white cursor-pointer hover:ring-2 ring-primary-500/50 transition-all" onClick={() => onViewFile(ans)}>
                        <img src={ans} alt="upload" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={(e) => { e.preventDefault(); onViewFile(ans); }} className="text-primary-600 hover:text-primary-800 text-xs font-semibold flex items-center justify-center gap-1 bg-white border border-gray-200 p-1.5 rounded shadow-sm hover:shadow hover:bg-gray-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {t('dashboard.quickView')}
                      </button>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.preventDefault(); onViewFile(ans); }} className="text-primary-600 hover:text-primary-800 underline break-all flex items-center gap-1 font-medium hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors w-full text-left">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{t('dashboard.viewDocument')}</span>
                    </button>
                  )
                ) : (
                  typeof ans === 'object' && ans !== null ? (
                    <div className="flex flex-col gap-1">
                      {Object.entries(ans).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="font-semibold">{k}:</span> {Array.isArray(v) ? v.join(', ') : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ans
                  )
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {rawAnswers.length > 8 && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          {expanded ? t('dashboard.showLess') : t('dashboard.showMore', { count: rawAnswers.length - 8 })}
        </button>
      )}
    </div>
  );
};

const ResponsesDashboard = () => {
  const { t } = useTranslation();
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [viewingFile, setViewingFile] = useState(null);
  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formResponse, responsesResponse] = await Promise.all([
        formAPI.getForm(formId),
        responseAPI.getFormResponses(formId),
      ]);
      setForm(formResponse.data.data);
      setResponses(responsesResponse.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load responses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allQuestions = useMemo(() => {
    if (!form) return [];
    if (form.sections) {
      return form.sections.flatMap(s => s.items).filter(i => i.type !== 'layout_block');
    }
    return form.questions || [];
  }, [form]);

  const trendData = useMemo(() => {
    if (!responses.length) return [];
    const counts = {};
    responses.forEach(r => {
      const dateStr = format(new Date(r.createdAt), 'MMM d');
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [responses]);

  const downloadCSV = () => {
    if (responses.length === 0) {
      alert('No responses to download');
      return;
    }

    const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const headers = ['Respondent Name', 'Date', 'Time', ...allQuestions.map((q) => {
      const doc = new DOMParser().parseFromString(q.title, 'text/html');
      return doc.body.textContent || q.title || "";
    })];
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...responses.map((response, index) => {
        const dt = new Date(response.createdAt);
        const row = [
          escapeCSV(response.respondentName && response.respondentName.toLowerCase() !== 'anonymous' ? response.respondentName : `Respondent ${index + 1}`),
          escapeCSV(dt.toLocaleDateString()),
          escapeCSV(dt.toLocaleTimeString()),
        ];
        allQuestions.forEach((question) => {
          const answer = response.answers.find(
            (a) => a.questionId === question.id
          );
          const val = answer?.value;
          row.push(escapeCSV(Array.isArray(val) ? val.join(', ') : (val || '')));
        });
        return row.join(',');
      }),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title}-responses.csv`;
    a.click();
  };

  const chartableQuestions = useMemo(() => {
    if (!allQuestions.length) return [];
    return allQuestions.filter((q) =>
      ['multiple_choice', 'checkboxes', 'dropdown'].includes(q.type)
    );
  }, [allQuestions]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600"></div>
        </motion.div>
        <p className="text-gray-400 mt-4 text-sm font-medium">{t('dashboard.loadingResponses')}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">{t('dashboard.formNotFound')}</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      {/* Back button */}
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium mb-6"
      >
        <ArrowLeft size={16} />
        {t('dashboard.backToForms')}
      </motion.button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 border-t-4 border-primary-500"
      >
        {form.headerImage && (
          <div className="flex-shrink-0 w-32 h-20 md:w-48 md:h-28 rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50/50 flex items-center justify-center">
            <img 
              src={form.headerImage} 
              alt="Form Header" 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1 break-words">{form.title}</h1>
            {form.description && (
              <div 
                className="prose prose-sm max-w-none text-gray-500 mb-4 break-words"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.description) }}
              />
            )}
          </div>
          {responses.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCSV}
              className="btn-primary shrink-0 flex items-center gap-2 text-sm z-10 sm:mt-0"
            >
              <Download size={16} />
              {t('dashboard.exportCsv')}
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl border-l-4 border-primary-500 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-primary-500" />
              <p className="text-primary-600 text-xs font-semibold uppercase tracking-wider">{t('dashboard.responsesTitle')}</p>
            </div>
            <p className="text-2xl font-extrabold text-primary-900">{responses.length}</p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border-l-4 border-emerald-500 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={14} className="text-emerald-500" />
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">{t('dashboard.questionsTitle')}</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-900">{allQuestions.length}</p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border-l-4 border-amber-500 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-amber-500" />
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider">{t('dashboard.created')}</p>
            </div>
            <p className="text-sm font-bold text-amber-900">
              {new Date(form.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            className="p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-2xl border-l-4 border-violet-500 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-violet-500" />
              <p className="text-violet-600 text-xs font-semibold uppercase tracking-wider">{t('dashboard.lastResponse')}</p>
            </div>
            <p className="text-sm font-bold text-violet-900">
              {responses.length > 0 
                ? formatDistanceToNow(new Date(Math.max(...responses.map(r => new Date(r.createdAt).getTime()))), { addSuffix: true })
                : t('dashboard.never')}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-gray-100 w-fit">
        {['summary', 'individual'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'summary' ? (
              <span className="flex items-center gap-2"><TrendingUp size={14} /> {t('dashboard.summary')}</span>
            ) : (
              <span className="flex items-center gap-2"><Users size={14} /> {t('dashboard.individual')}</span>
            )}
          </button>
        ))}
      </div>

      {responses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-primary-400" />
          </div>
          <p className="text-gray-500 mb-4 text-sm">{t('dashboard.noResponsesYet')}</p>
          <button
            onClick={() => navigate(`/form/${formId}`)}
            className="btn-primary text-sm"
          >
            {t('dashboard.fillForm')}
          </button>
        </motion.div>
      ) : activeTab === 'summary' ? (
        /* Summary View with Charts */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            className="card bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white leading-tight">{t('dashboard.responseTrend')}</h2>
              <p className="text-xs text-slate-400 font-medium">{t('dashboard.submissionsOverTime')}</p>
            </div>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    labelStyle={{ color: '#cbd5e1', marginBottom: '4px' }}
                    formatter={(value) => [`${value} ${value === 1 ? 'response' : 'responses'}`, '']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    dot={{ r: 5, fill: "white", stroke: "#6366f1", strokeWidth: 2 }} 
                    activeDot={{ r: 7, fill: "#6366f1", stroke: "white", strokeWidth: 2, style: { filter: "drop-shadow(0 0 6px #6366f1)" } }} 
                    isAnimationActive={true} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Question Renderers */}
          {allQuestions.map((question, index) => {
            const isVisualType = question.type === 'radio' || question.type === 'checkboxes';
            
            return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index % 5) }}
              className={`card bg-white rounded-2xl shadow-md p-6 border ${isVisualType ? 'border-t-[3px] border-t-indigo-500 border-x-gray-100/80 border-b-gray-100/80' : 'border-gray-100'}`}
            >
              <div className={`flex items-start gap-3 pb-3 ${isVisualType ? 'mb-4 border-b border-gray-50' : 'mb-5 border-b border-gray-50'}`}>
                <div className={`${isVisualType ? 'bg-indigo-100 text-indigo-700' : 'bg-primary-50 text-primary-600'} font-bold text-xs px-3 py-1.5 rounded-full shrink-0 mt-0.5`}>
                  Q{index + 1}
                </div>
                <div className="flex-1">
                  <div 
                    className={`text-base prose prose-sm max-w-none ${isVisualType ? 'font-semibold text-gray-900' : 'font-bold text-gray-900'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }}
                  />
                </div>
              </div>
              <QuestionSimpleVisual question={question} responses={responses} onViewFile={setViewingFile} />
            </motion.div>
          )})}
        </motion.div>
      ) : (
        /* Individual Responses (Paginated) */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          {responses.length > 0 && (
            <motion.div
              key={responses[currentResponseIndex]._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="card"
            >
              {/* Pagination Controls */}
              <div className="mb-6 flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <button
                  onClick={() => setCurrentResponseIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentResponseIndex === 0}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm disabled:shadow-none border border-transparent hover:border-gray-200"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {t('dashboard.responseCurrentOfTotal', { current: currentResponseIndex + 1, total: responses.length })}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentResponseIndex(prev => Math.min(responses.length - 1, prev + 1))}
                  disabled={currentResponseIndex === responses.length - 1}
                  className="p-2 rounded-lg hover:bg-white text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm disabled:shadow-none border border-transparent hover:border-gray-200"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Respondent Info */}
              <div className="mb-6 pb-4 border-b border-gray-100/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm backdrop-blur-sm">
                    {(() => {
                      const name = responses[currentResponseIndex].respondentName;
                      const validName = name && name.toLowerCase() !== 'anonymous' ? name : t('dashboard.respondentNum', { num: currentResponseIndex + 1 });
                      return validName.charAt(0).toUpperCase();
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-gray-900">
                        {(() => {
                          const name = responses[currentResponseIndex].respondentName;
                          return name && name.toLowerCase() !== 'anonymous' ? name : t('dashboard.respondentNum', { num: currentResponseIndex + 1 });
                        })()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(responses[currentResponseIndex].createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-6">
                {allQuestions.map((question) => {
                  const answer = responses[currentResponseIndex].answers.find(
                    (a) => a.questionId === question.id
                  );

                  return (
                    <div key={question.id} className="relative">
                      <div className="text-sm font-semibold text-gray-800 mb-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.title || '') }} />
                      <div className="px-4 py-3 bg-gray-50/80 rounded-xl text-sm text-gray-700 border border-gray-100/80 min-h-[44px]">
                        {(() => {
                          const val = answer?.value;
                          if (!val || (Array.isArray(val) && val.length === 0)) {
                             return <span className="text-gray-400 italic">{t('dashboard.noAnswer')}</span>;
                          }
                          if (question.type === 'file_upload' && typeof val === 'string') {
                             const isImg = val.includes('/image/upload') || val.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                             return (
                               <div className="flex flex-col gap-2 max-w-sm">
                                 {isImg && (
                                   <div className="h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all" onClick={() => setViewingFile(val)}>
                                      <img src={val} alt="Uploaded file" className="max-w-full max-h-full object-contain" />
                                   </div>
                                 )}
                                 <button onClick={() => setViewingFile(val)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold bg-white p-2.5 rounded-lg border border-primary-100 shadow-sm transition-all hover:border-primary-300 w-fit hover:bg-gray-50">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                   </svg>
                                   {t('dashboard.openFullView')}
                                 </button>
                               </div>
                             );
                          }
                          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                            return (
                              <div className="flex flex-col gap-1">
                                {Object.entries(val).map(([k, v]) => (
                                  <div key={k} className="text-sm">
                                    <span className="font-semibold">{k}:</span> {Array.isArray(v) ? v.join(', ') : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return Array.isArray(val) ? val.join(', ') : String(val);
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {viewingFile && (
          <FileModal url={viewingFile} onClose={() => setViewingFile(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResponsesDashboard;
