import Form from '../model/Form.js';
import crypto from 'crypto';

// Create a new form
export const createForm = async (req, res) => {
  try {
    const { title, description, headerImage, mediaUrl, mediaType, questions, sections } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Form title is required' });
    }

    const newForm = await Form.create({
      title,
      description,
      headerImage,
      mediaUrl,
      mediaType,
      sections: sections || (questions ? [{ id: 'default', title: '', items: questions }] : []),
      createdBy: req.user ? req.user._id : 'anonymous',
      shareToken: crypto.randomBytes(16).toString('hex'),
    });

    res.status(201).json({ success: true, data: newForm });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ message: 'Error creating form', error: error.message, stack: error.stack });
  }
};

// Get a specific form
export const getForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Generate shareToken for older forms that don't have one
    if (!form.shareToken) {
      form.shareToken = crypto.randomBytes(16).toString('hex');
      await form.save();
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form', error: error.message });
  }
};

// Get form by public share token (no auth required)
export const getFormByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const form = await Form.findOne({ shareToken: token });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!form.isActive) {
      return res.status(403).json({ message: 'This form is currently not accepting responses' });
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form', error: error.message });
  }
};

// Update a form
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, headerImage, mediaUrl, mediaType, sections, questions, isActive } = req.body;

    const sectionsToUpdate = sections || (questions ? [{ id: 'default', title: '', items: questions }] : undefined);

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { title, description, headerImage, mediaUrl, mediaType, ...(sectionsToUpdate && { sections: sectionsToUpdate }), isActive },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Generate shareToken if missing
    if (!updatedForm.shareToken) {
      updatedForm.shareToken = crypto.randomBytes(16).toString('hex');
      await updatedForm.save();
    }

    res.status(200).json({ success: true, data: updatedForm });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Error updating form', error: error.message, stack: error.stack });
  }
};

// Get all forms for the authenticated manager (or assigned forms if staff)
export const getAllForms = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'staff') {
       query.createdBy = req.user.createdBy;
    } else if (req.user.role === 'manager') {
       query.createdBy = req.user._id;
    }
    
    const forms = await Form.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forms', error: error.message });
  }
};

// Delete a form
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form', error: error.message });
  }
};
