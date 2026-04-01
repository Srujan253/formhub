import Response from '../model/Response.js';
import Form from '../model/Form.js';

// Submit form response (authenticated)
export const submitResponse = async (req, res) => {
  try {
    const { formId, answers, respondentName, respondentEmail } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ message: 'Form ID and answers are required' });
    }

    const newResponse = new Response({
      formId,
      answers,
      respondentName: respondentName || 'Anonymous',
      respondentEmail: respondentEmail || 'anonymous',
    });

    await newResponse.save();
    res.status(201).json({ success: true, data: newResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
};

// Submit form response via public share token (no auth)
export const submitPublicResponse = async (req, res) => {
  try {
    const { shareToken, answers, respondentName, respondentEmail } = req.body;

    if (!shareToken || !answers) {
      return res.status(400).json({ message: 'Share token and answers are required' });
    }

    if (!respondentName || respondentName.trim() === '') {
      return res.status(400).json({ message: 'Please enter your name before submitting' });
    }

    const form = await Form.findOne({ shareToken, isActive: true });
    if (!form) {
      return res.status(404).json({ message: 'Form not found or is no longer accepting responses' });
    }

    const newResponse = new Response({
      formId: form._id,
      answers,
      respondentName: respondentName.trim(),
      respondentEmail: respondentEmail || 'anonymous',
    });

    await newResponse.save();
    res.status(201).json({ success: true, data: newResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
};

// Get all responses for a form
export const getFormResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await Response.find({ formId }).populate('formId');

    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching responses', error: error.message });
  }
};

// Get response count for a form
export const getResponseCount = async (req, res) => {
  try {
    const { formId } = req.params;

    const count = await Response.countDocuments({ formId });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting responses', error: error.message });
  }
};
