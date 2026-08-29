import EmailGroup from '../model/EmailGroup.js';

// GET all groups for logged-in user
export const getGroups = async (req, res) => {
  try {
    const groups = await EmailGroup.find({ createdBy: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
};

// POST create a group
export const createGroup = async (req, res) => {
  try {
    const { name, description, emails } = req.body;

    // Normalise and deduplicate
    const cleanEmails = [...new Set(
      (emails || []).map(e => e.trim().toLowerCase()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    )];

    if (cleanEmails.length === 0) {
      return res.status(400).json({ message: 'No valid emails provided' });
    }

    const group = await EmailGroup.create({
      name,
      description,
      emails: cleanEmails,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update a group
export const updateGroup = async (req, res) => {
  try {
    const group = await EmailGroup.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const { name, description, emails } = req.body;

    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (emails !== undefined) {
      const cleanEmails = [...new Set(
        emails.map(e => e.trim().toLowerCase()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      )];
      if (cleanEmails.length === 0) return res.status(400).json({ message: 'No valid emails provided' });
      group.emails = cleanEmails;
    }

    await group.save();
    res.json({ success: true, data: group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE a group
export const deleteGroup = async (req, res) => {
  try {
    const group = await EmailGroup.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ success: true, message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
