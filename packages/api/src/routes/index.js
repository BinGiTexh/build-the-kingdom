const express = require('express');
const authRoutes = require('./auth');
const jobRoutes = require('./jobs');
const applicationRoutes = require('./applications');
const userRoutes = require('./users');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes);

module.exports = router;

