/**
 * Sales Reps Management Routes
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');

router.get('/reps', (req, res, next) => {
  try {
    const reps = dataStore.getReps();
    return res.json({ success: true, count: reps.length, data: reps });
  } catch (err) {
    next(err);
  }
});

router.post('/reps', (req, res, next) => {
  try {
    const { name, email, role, phone, active } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: { message: 'Name and Email are required.' } });
    }

    const newRep = dataStore.addRep({ name, email, role, phone, active });
    return res.status(201).json({ success: true, message: `Rep ${newRep.name} added.`, data: newRep });
  } catch (err) {
    next(err);
  }
});

router.put('/reps/:id', (req, res, next) => {
  try {
    const updated = dataStore.updateRep(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Rep not found.' } });
    }
    return res.json({ success: true, message: `Rep ${updated.name} updated.`, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/reps/:id', (req, res, next) => {
  try {
    const deleted = dataStore.deleteRep(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { message: 'Rep not found.' } });
    }
    return res.json({ success: true, message: `Rep ${deleted.name} deleted.`, data: deleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
