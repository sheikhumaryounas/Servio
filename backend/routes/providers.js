import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Get all active (available) providers, with optional type filtering
router.get('/active', (req, res) => {
  try {
    const { serviceType } = req.query;
    let query = { isAvailable: true };

    let providers = db.providers.find(query);
    
    // Inject user names and info
    providers = providers.map(p => {
      const user = db.users.findById(p.userId);
      return {
        ...p,
        name: user ? user.name : 'Service Partner',
        phone: user ? user.phone : ''
      };
    });

    if (serviceType) {
      providers = providers.filter(p => p.serviceType.includes(serviceType));
    }

    res.json(providers);
  } catch (error) {
    console.error('Error fetching active providers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider details by ID
router.get('/:id', (req, res) => {
  try {
    const provider = db.providers.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const user = db.users.findById(provider.userId);
    res.json({
      ...provider,
      name: user ? user.name : 'Service Partner',
      phone: user ? user.phone : ''
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
