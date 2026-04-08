import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Save, AlertCircle, Share2, ArrowLeft, GripVertical, Type, Image as ImageIcon, LayoutList, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { formAPI, emailAPI } from '../services/api';
import QuestionInput from '../components/QuestionInput';
import InviteModal from '../components/InviteModal';
import Toast from '../components/Toast';
import ImageUpload from '../components/ImageUpload';
import RichTextEditor from '../components/RichTextEditor';
import MediaUpload from '../components/MediaUpload';
import ShareModal from '../components/ShareModal';
import FormViewer from './FormViewer';
import { useBeforeUnload } from 'react-use';

const SaveStatus = ({ status, t }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="fixed top-20 right-8 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 shadow-glass"
  >
    {status === 'saving' ? (
      <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    ) : (
      <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )}
    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {status === 'saving' ? t('formBuilder.saving') : t('formBuilder.allSaved')}
    </span>
  </motion.div>
);

const PaletteTool = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="w-12 h-12 bg-white rounded-xl shadow-glass border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all relative group"
    title={label}
  >
    <Icon size={24} strokeWidth={1.5} />
    <div className="absolute right-14 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
      {label}
    </div>
  </motion.button>
);

const FormBuilder = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    headerImage: '',
    sections: [
      { id: uuidv4(), title: '', description: '', items: [] }
    ],
  });
  const [activeSection, setActiveSection] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  useEffect(() => {
    if (!id || !hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      saveFormSilently();
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges, id]);

  useBeforeUnload(hasUnsavedChanges, 'You have unsaved changes, are you sure you want to leave?');

  // Intercept the system/browser back button
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Push a dummy state into history so the initial "Back" click just pops this off instead of leaving
    window.history.pushState(null, '', window.location.pathname);

    const handlePopState = (e) => {
      // The user clicked the browser's back button
      setShowExitConfirm(true);
      // Keep the user trapped on the current page by pushing another dummy state immediately
      window.history.pushState(null, '', window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const fetchForm = async () => {
    try {
      const response = await formAPI.getForm(id);
      let data = response.data.data;
      if (!data.sections || data.sections.length === 0) {
        data.sections = [
          {
             id: uuidv4(),
             title: '',
             description: '',
             items: data.questions || []
          }
        ];
      }
      setFormData(data);
    } catch (err) {
      setError('Failed to load form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormDataChange = (updates) => {
    setFormData({ ...formData, ...updates });
    setHasUnsavedChanges(true);
  };

  const handleSectionChange = (sIndex, updates) => {
    const sections = [...formData.sections];
    sections[sIndex] = { ...sections[sIndex], ...updates };
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleAddItem = (sIndex, type = 'question', layoutType = null) => {
    const newItem = {
      id: uuidv4(),
      type: type === 'layout_block' ? 'layout_block' : 'short_answer',
      layoutType: layoutType,
      title: '',
      description: '',
      mediaUrl: '',
      mediaType: '',
      required: false,
      options: [],
    };
    const sections = [...formData.sections];
    
    if (activeItemIndex !== null && sIndex === activeSection) {
      sections[sIndex].items.splice(activeItemIndex + 1, 0, newItem);
      setActiveItemIndex(activeItemIndex + 1);
    } else {
      sections[sIndex].items.push(newItem);
      setActiveItemIndex(sections[sIndex].items.length - 1);
    }
    
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
    setActiveSection(sIndex);
  };

  const scrollToSection = (index) => {
    setActiveSection(index);
    setTimeout(() => {
      const element = index === 0 ? document.getElementById('form-header-card') : document.getElementById(`section-${index}`);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleAddSection = () => {
    const newSection = {
      id: uuidv4(),
      title: '',
      description: '',
      items: [],
    };
    const sections = [...formData.sections];
    
    if (activeItemIndex !== null) {
      // Split the active section's items below the active item
      const currentItems = sections[activeSection].items;
      const itemsToMove = currentItems.splice(activeItemIndex + 1);
      newSection.items = itemsToMove;
    }
    
    sections.splice(activeSection + 1, 0, newSection);

    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
    setActiveSection(activeSection + 1);
    setActiveItemIndex(null); 
    scrollToSection(activeSection + 1);
  };

  const handleDeleteSection = (sIndex) => {
    if (formData.sections.length <= 1) {
      setToast({ message: t('formBuilder.cannotDeleteLast', { defaultValue: 'Cannot delete last section' }), type: 'error' });
      return;
    }
    setSectionToDelete(sIndex);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete === null) return;
    const sections = [...formData.sections];
    
    if (sectionToDelete > 0) {
      sections[sectionToDelete - 1].items.push(...sections[sectionToDelete].items);
    } else if (sections.length > 1) {
      sections[1].items.unshift(...sections[sectionToDelete].items);
    }

    sections.splice(sectionToDelete, 1);
    
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
    setToast({ message: t('formBuilder.sectionRemoved', { defaultValue: 'Section removed' }), type: 'success' });
    setTimeout(() => setToast(null), 3000);
    if (activeSection >= sections.length) {
      setActiveSection(Math.max(0, sections.length - 1));
    }
    setSectionToDelete(null);
  };

  const handleMoveSectionBreakUp = (sIndex) => {
    if (sIndex === 0) return;
    const sections = [...formData.sections];
    const prevSection = sections[sIndex - 1];
    const currentSection = sections[sIndex];
    if (prevSection.items.length === 0) return; // no questions to grab
    
    // The last item of the previous section moves to the top of the current section
    const itemToMove = prevSection.items.pop();
    currentSection.items.unshift(itemToMove);
    
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleMoveSectionBreakDown = (sIndex) => {
    // Moving this break down means bringing the *first* item of the *current* section into the *previous* section!
    if (sIndex === 0) return;
    const sections = [...formData.sections];
    const prevSection = sections[sIndex - 1];
    const currentSection = sections[sIndex];
    if (currentSection.items.length === 0) return;
    
    const itemToMove = currentSection.items.shift();
    prevSection.items.push(itemToMove);
    
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleItemChange = (sIndex, iIndex, updatedItem) => {
    const sections = [...formData.sections];
    sections[sIndex].items[iIndex] = updatedItem;
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleDuplicateItem = (sIndex, iIndex) => {
    const sections = [...formData.sections];
    const itemToDuplicate = sections[sIndex].items[iIndex];
    const duplicatedItem = { ...itemToDuplicate, id: uuidv4() };
    sections[sIndex].items.splice(iIndex + 1, 0, duplicatedItem);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = (sIndex, iIndex) => {
    const sections = [...formData.sections];
    sections[sIndex].items.splice(iIndex, 1);
    setFormData({ ...formData, sections });
    setHasUnsavedChanges(true);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === 'SECTION') {
      const newSections = Array.from(formData.sections);
      
      // Preserve the questions for each positional index
      const originalItemsArrays = newSections.map(sec => sec.items);
      
      // Move only the section objects
      const [movedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, movedSection);
      
      // Reattach the items to the positional slots so they don't move
      newSections.forEach((sec, i) => {
        sec.items = originalItemsArrays[i];
      });
      
      setFormData({ ...formData, sections: newSections });
      setHasUnsavedChanges(true);
      return;
    }

    const sourceSIndex = parseInt(source.droppableId);
    const destSIndex = parseInt(destination.droppableId);

    const newSections = [...formData.sections];
    const [movedItem] = newSections[sourceSIndex].items.splice(source.index, 1);
    newSections[destSIndex].items.splice(destination.index, 0, movedItem);

    setFormData({ ...formData, sections: newSections });
    setHasUnsavedChanges(true);
  };

  const handleSaveForm = async (e) => {
    if (e) e.preventDefault();
    try {
      const currentTitle = typeof formData.title === 'string' ? formData.title.replace(/<[^>]*>?/gm, '').trim() : '';
      if (!currentTitle) {
        setError(t('formBuilder.titleRequiredMsg', { defaultValue: 'Form title is required' }));
        return;
      }
      setSaving(true);
      if (id) {
        await formAPI.updateForm(id, formData);
        setSuccess(t('formBuilder.formUpdated', { defaultValue: 'Form updated successfully!' }));
      } else {
        const response = await formAPI.createForm(formData);
        setSuccess(t('formBuilder.formCreated', { defaultValue: 'Form created successfully!' }));
        setHasUnsavedChanges(false);
        setTimeout(() => navigate(`/edit/${response.data.data._id}`), 1000);
      }
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(t('formBuilder.saveError', { defaultValue: 'Failed to save form' }));
    } finally {
      setSaving(false);
    }
  };

  const saveFormSilently = async () => {
    if (!id || !formData.title.trim()) return;
    try {
      setAutoSaveStatus('saving');
      await formAPI.updateForm(id, formData);
      setHasUnsavedChanges(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      setAutoSaveStatus('');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-primary-200 border-t-primary-600 animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading form...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`mx-auto px-4 lg:px-8 py-8 flex transition-all duration-300 ease-in-out ${showLivePreview ? 'w-full max-w-[1800px] gap-8' : 'w-full max-w-4xl'}`}>
      <div className={`relative transition-all duration-300 ${showLivePreview ? 'w-full lg:w-1/2 lg:pr-12 lg:border-r lg:border-gray-100' : 'w-full pr-12 sm:pr-16 md:pr-16'}`}>          <AnimatePresence>
            {showExitConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-8 left-1/2 z-[200] flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md min-w-[320px] max-w-[90vw] bg-white border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight pb-0 mb-0">
                    {t('formBuilder.closeWithoutSaving', { defaultValue: 'Close without saving? All changes will be lost.' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {t('public.back', { defaultValue: 'No' })}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      setHasUnsavedChanges(false);
                      // Since we pushed 2 back states (1 on initial change, 1 on intercept), we pop them before navigating gracefully
                      window.history.go(-2);
                      setTimeout(() => navigate('/'), 100);
                    }}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 rounded-lg transition-colors"
                  >
                    {t('public.submitButton', { defaultValue: 'Yes' })}
                  </button>
                </div>
              </motion.div>
            )}
            {sectionToDelete !== null && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-8 left-1/2 z-[200] flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md min-w-[320px] max-w-[90vw] bg-white border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight pb-0 mb-0">
                    {t('formBuilder.confirmDeleteSection', { defaultValue: 'Delete this section? Questions will be moved to the adjacent section.' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSectionToDelete(null)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {t('public.back', { defaultValue: 'No' })}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteSection}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    {t('admin.delete', { defaultValue: 'Delete' })}
                  </button>
                </div>
              </motion.div>
            )}          </AnimatePresence>
        <div className="flex items-center justify-between mb-6">
            <motion.button onClick={() => {
              if (hasUnsavedChanges) {
                setShowExitConfirm(true);
              } else {
                navigate('/');
              }
            }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
            <ArrowLeft size={16} />{t('formBuilder.backToForms')}</motion.button>
          {id && formData.shareToken && (
            <motion.button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-50/80 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100/80 border border-primary-100">
              <Share2 size={16} /> {t('formBuilder.share', { defaultValue: 'Share' })}
            </motion.button>
          )}
        </div>

        <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

        <div className="pb-32">
          <form id="form-header-card" onSubmit={handleSaveForm} className="card mb-6 relative">
          {formData.sections.length > 1 && (
            <div className="absolute -top-3 left-4 bg-primary-100 text-primary-700 px-3 py-1 text-xs font-bold rounded-full shadow-sm">
              {t('formBuilder.sectionCount', { defaultValue: `Section 1 of ${formData.sections.length}` })}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-6 text-gray-900 mt-2">{id ? t('formBuilder.edit') : t('formBuilder.createNewForm')}</h1>
          <div className="mb-5">
            <label className="form-label">{t('formBuilder.formTitle')}</label>
            <input type="text" value={formData.title} onChange={(e) => handleFormDataChange({ title: e.target.value })} placeholder={t('formBuilder.formTitlePlaceholder')} className="form-input text-lg font-semibold" required />
          </div>
          <div className="mb-6">
            <label className="form-label">{t('formBuilder.descriptionLabel')}</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
               <RichTextEditor content={formData.description || ''} onChange={(html) => handleFormDataChange({ ...formData, description: html })} placeholder={t('formBuilder.descriptionPlaceholder')} />
            </div>
          </div>
          <div className="mb-6 space-y-4">
            <ImageUpload label={t('formBuilder.formHeaderImage')} value={formData.headerImage || ''} onChange={(url) => { handleFormDataChange({ headerImage: url }); setToast({ message: t('system.saved'), type: 'success' }); setTimeout(() => setToast(null), 3000); }} />
          </div>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {formData.sections.map((section, sIndex) => (
                  <Draggable key={`section-${section.id}`} draggableId={`section-${section.id}`} index={sIndex} isDragDisabled={true}>
                    {(provided, snapshot) => (
                      <div
                          id={`section-${sIndex}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-10 relative scroll-mt-24 ${activeSection === sIndex ? 'z-50' : 'z-10'}`}
                        onClick={(e) => {
                          // Allow internal inputs/buttons to function independently
                          if (e.target.tagName.toLowerCase() !== 'textarea' && e.target.tagName.toLowerCase() !== 'input') {
                            setActiveSection(sIndex);
                            setActiveItemIndex(null);
                          }
                        }}
                      >

                        {/* Drag handler block completely removed as nested sections visually drag all their contents by layout rules */}

                        { (sIndex > 0 || (sIndex === 0 && (section.title || section.description))) && (
                          <div className={`card mb-4 relative ${activeSection === sIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
                            <div className="absolute -top-3 left-4 bg-primary-100 text-primary-700 px-3 py-1 text-xs font-bold rounded-full shadow-sm">
                              {t('formBuilder.sectionCount', { defaultValue: `Section ${sIndex + 1} of ${formData.sections.length}` })}
                            </div>
                            <div className="flex justify-between items-start mb-4 mt-2">
                              <div className="flex-1 mr-4">
                                <textarea
                                  value={section.title}
                                  onChange={(e) => {
                                    e.target.style.height = 'inherit';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                    handleSectionChange(sIndex, { title: e.target.value });
                                  }}
                                  placeholder={t('formBuilder.sectionTitle', { defaultValue: 'Section Title' })}
                                  className="text-xl font-bold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:outline-none w-full px-2 py-1 mb-2 transition-colors resize-none overflow-hidden"
                                  rows="1"
                                />
                                <textarea
                                  value={section.description || ''}
                                  onChange={(e) => {
                                    e.target.style.height = 'inherit';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                    handleSectionChange(sIndex, { description: e.target.value });
                                  }}
                                  placeholder={t('formBuilder.description', { defaultValue: 'Description (optional)' })}
                                  className="text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-500 focus:outline-none w-full px-2 py-1 transition-colors resize-none overflow-hidden"
                                  rows="1"
                                />
                                <p className="text-xs text-red-500 mt-2 px-2">
                                  {t('formBuilder.emptyTitleDescriptionWarning', { defaultValue: 'If you do not enter a title or description, it will not appear on the answer screen.' })}
                                </p>
                              </div>
                              <div className="flex flex-col items-center gap-1 sm:flex-row">
                                {sIndex > 0 && (
                                  <>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSectionBreakUp(sIndex); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title={t('formBuilder.moveSectionUp', { defaultValue: 'Move section break up one question' })}>
                                      <ChevronUp size={18} />
                                    </button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveSectionBreakDown(sIndex); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title={t('formBuilder.moveSectionDown', { defaultValue: 'Move section break down one question' })}>
                                      <ChevronDown size={18} />
                                    </button>
                                  </>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSection(sIndex); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t('formBuilder.deleteSection', { defaultValue: 'Delete section' })}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <Droppable droppableId={sIndex.toString()} type="ITEM">
                          {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-4 min-h-[50px] transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-primary-50/50 p-2' : ''}`}>
                              {section.items.map((item, iIndex) => (
                                <Draggable key={item.id} draggableId={item.id} index={iIndex}>
                                  {(provided, snapshot) => (
                                    <div 
                                      ref={provided.innerRef} 
                                      {...provided.draggableProps} 
                                      className={`${snapshot.isDragging ? 'z-50' : ''} pt-3 relative`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSection(sIndex);
                                        setActiveItemIndex(iIndex);
                                      }}
                                    >
                                      <div className="relative group">
                                        <div {...provided.dragHandleProps} className="absolute left-1/2 -top-4 -translate-x-1/2 bg-white border border-primary-100 rounded-full shadow-sm text-primary-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 cursor-grab active:cursor-grabbing z-20 px-3 py-1 flex items-center justify-center">
                                          <GripVertical size={16} />
                                        </div>
                                        <QuestionInput
                                          question={item}
                                          onChange={(updated) => handleItemChange(sIndex, iIndex, updated)}
                                          onDuplicate={() => handleDuplicateItem(sIndex, iIndex)}
                                          onDelete={() => handleDeleteItem(sIndex, iIndex)}
                                          onUploadSuccess={() => { setToast({ message: 'Media updated!', type: 'success' }); setTimeout(() => setToast(null), 3000); }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </div>
      </div>

      {/* Floating Palette aligned right of active section loosely */}
      <div className={`fixed top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-glass z-50 transition-all duration-300 ${showLivePreview ? 'hidden lg:flex right-[calc(50vw+20px)]' : 'right-2 sm:right-4 md:right-[max(20px,calc(50vw-450px))]'}`}>
        <PaletteTool
          icon={Eye}
          label={t('formBuilder.preview', { defaultValue: 'Live Preview' })}
          onClick={() => {
            if (window.innerWidth < 1024) {
              if (id) {
                window.open(`/form/${id}`, '_blank');
              } else {
                setToast({ message: t('formBuilder.saveBeforePreview', { defaultValue: 'Please save the form before previewing.' }), type: 'error' });
                setTimeout(() => setToast(null), 3000);
              }
            } else {
              setShowLivePreview(!showLivePreview);
            }
          }}
        />
        <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1" />
        <PaletteTool icon={Plus} label={t('formBuilder.addQuestion')} onClick={() => handleAddItem(activeSection, 'question')} />
        <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1" />
        <PaletteTool icon={Type} label={t('formBuilder.addTitleDesc')} onClick={() => handleAddItem(activeSection, 'layout_block', 'title_desc')} />
        <PaletteTool icon={ImageIcon} label={t('formBuilder.addImageBlock', { defaultValue: 'Add Image' })} onClick={() => handleAddItem(activeSection, 'layout_block', 'image')} />
        <div className="w-6 h-[1px] bg-gray-200 mx-auto my-1" />
        <PaletteTool icon={LayoutList} label={t('formBuilder.sectionBreak')} onClick={handleAddSection} />
      </div>

      <AnimatePresence>
        {showLivePreview && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: '50%' }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className="hidden lg:block flex-1 bg-gray-50/50 rounded-3xl border border-gray-200 overflow-hidden shadow-inner sticky top-8 h-[calc(100vh-64px)] max-h-screen overflow-y-auto"
          >
            <div className="pointer-events-none relative h-full">
              <FormViewer previewData={{ ...formData, sections: formData.sections }} isPreviewMode={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="fixed bottom-20 left-1/2 z-[100] flex gap-3 p-2 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl"
          >
            <motion.button onClick={handleSaveForm} disabled={saving} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base shadow-md transition-all duration-300 ${saving ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20'}`}>
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              {saving ? t('formBuilder.saving', { defaultValue: 'Saving...' }) : t('formBuilder.saveNow', { defaultValue: 'Save Changes' })}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareToken={formData?.shareToken}
        formTitle={formData?.title}
      />

      {formData.sections && formData.sections.length > 1 && (
        <div className="fixed bottom-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-[200] pointer-events-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-glass border border-gray-200 p-2 flex items-center gap-2 max-w-full overflow-x-auto">
          <button
            onClick={() => scrollToSection(activeSection > 0 ? activeSection - 1 : formData.sections.length - 1)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Previous Section"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex gap-1 overflow-x-auto px-2 scrollbar-none">
            {formData.sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToSection(idx)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  activeSection === idx 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollToSection(activeSection < formData.sections.length - 1 ? activeSection + 1 : 0)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Next Section"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </motion.div>
  );
};
export default FormBuilder;





