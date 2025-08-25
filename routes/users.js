import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();


router.get('/profile', auth, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});

module.exports = router;