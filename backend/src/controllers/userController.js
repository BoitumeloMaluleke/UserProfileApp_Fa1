const User = require('../models/User');

const getProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return res.json(req.user);
};

const updateProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { name, bio, avatarUrl } = req.body;

  try {
    req.user.name = name || req.user.name;
    req.user.bio = bio ?? req.user.bio;
    req.user.avatarUrl = avatarUrl ?? req.user.avatarUrl;

    const updatedUser = await req.user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};


