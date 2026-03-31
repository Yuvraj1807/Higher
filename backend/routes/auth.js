module.exports = (db, auth) => {
  const express = require('express');
  const router = express.Router();

  // Sign up
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, role, displayName } = req.body;
      const userRecord = await auth.createUser({
        email,
        password,
        displayName
      });

      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        displayName,
        role,
        createdAt: new Date(),
        profileCompleted: false
      });

      res.json({ success: true, uid: userRecord.uid, message: 'User created' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user profile
  router.get('/profile/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
      res.json(userDoc.data());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update profile
  router.post('/profile/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      await db.collection('users').doc(uid).update(req.body);
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};