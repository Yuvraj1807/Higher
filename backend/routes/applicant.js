module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  // Get all jobs
  router.get('/jobs', async (req, res) => {
    try {
      const snapshot = await db.collection('jobs').get();
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply for job
  router.post('/apply', async (req, res) => {
    try {
      const { applicantId, jobId, resume } = req.body;
      await db.collection('applications').add({
        applicantId,
        jobId,
        resume,
        createdAt: new Date(),
        status: 'pending'
      });
      res.json({ success: true, message: 'Application submitted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get applicant's applications
  router.get('/applications/:applicantId', async (req, res) => {
    try {
      const { applicantId } = req.params;
      const snapshot = await db.collection('applications').where('applicantId', '==', applicantId).get();
      const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};