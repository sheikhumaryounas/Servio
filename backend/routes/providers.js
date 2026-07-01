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

// POST /api/providers/:id/rate - Submit a rating & review for a provider
router.post('/:id/rate', (req, res) => {
  try {
    const { rating, review, customerId, customerName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const provider = db.providers.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Build the new review entry
    const newReview = {
      customerId: customerId || 'anonymous',
      customerName: customerName || 'Anonymous Customer',
      rating: Number(rating),
      review: review?.trim() || '',
      createdAt: new Date().toISOString()
    };

    // Append to existing reviews array
    const existingReviews = provider.reviews || [];
    const updatedReviews = [...existingReviews, newReview];

    // Recalculate average rating
    const avgRating = (
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
    ).toFixed(1);

    // Persist changes
    const updatedProvider = db.providers.findByIdAndUpdate(req.params.id, {
      reviews: updatedReviews,
      rating: Number(avgRating),
      totalJobs: (provider.totalJobs || 0) + 1
    });

    res.json({
      success: true,
      newRating: Number(avgRating),
      totalReviews: updatedReviews.length,
      provider: updatedProvider
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
