import User from '../model/User.js';

// @desc    Get users based on role
// @route   GET /api/manager/users
// @access  Private/SuperAdmin & Admin
export const getUsers = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') {
       filter = { role: 'staff', createdBy: req.user._id };
    }

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Create Staff User
// @route   POST /api/manager/staff
// @access  Private/SuperAdmin
export const createStaffUser = async (req, res) => {
  try {
const { name, email, password, role } = req.body;

      let assignedRole = role || 'staff';
      if (req.user.role === 'manager') {
         assignedRole = 'staff';
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        about: 'Account created by Admin/Manager',
        role: assignedRole,
      isVerified: true,
      createdBy: req.user._id
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating staff user' });
  }
};

// @desc    Verify user
// @route   PATCH /api/manager/users/:id/verify
// @access  Private/SuperAdmin
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isVerified = true;
    await user.save();
    
    res.json({ message: 'User verified successfully', user: { id: user._id, isVerified: user.isVerified, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying user' });
  }
};

// @desc    Change user role
// @route   PATCH /api/manager/users/:id/role
// @access  Private/SuperAdmin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'manager', 'staff'].includes(role)) {
       return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing your own role or demoting the original super manager
    if (user.email === 'ksrujan026@gmail.com' && role !== 'admin') {
        return res.status(403).json({ message: 'Cannot demote the main super manager' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'Role updated successfully', user: { id: user._id, role: user.role, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating role' });
  }
};

// @desc    Delete user
// @route   DELETE /api/manager/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email === 'ksrujan026@gmail.com') {
      return res.status(403).json({ message: 'Cannot delete the main super manager' });
    }
    
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};
