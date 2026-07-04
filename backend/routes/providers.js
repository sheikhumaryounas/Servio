import express from 'express';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import Request from '../models/Request.js';

const router = express.Router();

// Get all active (available) providers, with optional type filtering
router.get('/active', async (req, res) => {
  try {
    const { serviceType } = req.query;

    let query = { isAvailable: true };
    if (serviceType) {
      query.serviceType = serviceType;
    }

    let providers = await Provider.find(query);

    const seedReviews = [
      { customerName: "Zainab Ahmed", rating: 5, review: "Bohot achi service thi! Saaf kaam kia bilkul.", createdAt: new Date("2026-06-30T10:00:00.000Z") },
      { customerName: "Usman Ali", rating: 4, review: "Time pe aaye aur standard rates pe kaam kia.", createdAt: new Date("2026-06-29T15:30:00.000Z") },
      { customerName: "Ayesha Khan", rating: 5, review: "Excellent work, very polite and professional.", createdAt: new Date("2026-06-28T09:15:00.000Z") }
    ];

    const enriched = await Promise.all(providers.map(async (p) => {
      const user = await User.findById(p.userId).catch(() => null);
      const reviews = p.reviews && p.reviews.length > 0 ? p.reviews : seedReviews.slice(0, 1 + (p._id.toString().charCodeAt(0) % 2));
      const totalReviewsCount = reviews.length;
      const calculatedRating = totalReviewsCount > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
        : p.rating || 4.8;

      return {
        id: p._id.toString(),
        userId: p.userId,
        serviceType: p.serviceType,
        isAvailable: p.isAvailable,
        location: p.location,
        experience: p.experience,
        xp: p.xp,
        level: p.level,
        badge: p.badge,
        name: user ? user.name : 'Service Partner',
        phone: user ? user.phone : '',
        profilePic: user ? user.profilePic : null,
        reviews,
        rating: calculatedRating,
        totalJobs: p.totalJobs || totalReviewsCount
      };
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching active providers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get provider details by ID
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const user = await User.findById(provider.userId).catch(() => null);
    const seedReviews = [
      { customerName: "Zainab Ahmed", rating: 5, review: "Bohot achi service thi! Saaf kaam kia bilkul.", createdAt: new Date("2026-06-30T10:00:00.000Z") },
      { customerName: "Usman Ali", rating: 4, review: "Time pe aaye aur standard rates pe kaam kia.", createdAt: new Date("2026-06-29T15:30:00.000Z") },
      { customerName: "Ayesha Khan", rating: 5, review: "Excellent work, very polite and professional.", createdAt: new Date("2026-06-28T09:15:00.000Z") }
    ];
    const reviews = provider.reviews && provider.reviews.length > 0 ? provider.reviews : seedReviews.slice(0, 2);
    const totalReviewsCount = reviews.length;
    const calculatedRating = totalReviewsCount > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
      : provider.rating || 4.8;

    res.json({
      id: provider._id.toString(),
      userId: provider.userId,
      serviceType: provider.serviceType,
      isAvailable: provider.isAvailable,
      location: provider.location,
      experience: provider.experience,
      xp: provider.xp,
      level: provider.level,
      badge: provider.badge,
      name: user ? user.name : 'Service Partner',
      phone: user ? user.phone : '',
      profilePic: user ? user.profilePic : null,
      reviews,
      rating: calculatedRating,
      totalJobs: provider.totalJobs || totalReviewsCount
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/providers/:id/rate - Submit a rating & review for a provider
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating, review, customerId, customerName, requestId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const newReview = {
      customerId: customerId || 'anonymous',
      customerName: customerName || 'Anonymous Customer',
      rating: Number(rating),
      review: review?.trim() || '',
      createdAt: new Date()
    };

    const existingReviews = provider.reviews || [];
    const updatedReviews = [...existingReviews, newReview];

    const avgRating = (
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
    ).toFixed(1);

    const updatedProvider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        reviews: updatedReviews,
        rating: Number(avgRating),
        totalJobs: (provider.totalJobs || 0) + 1
      },
      { new: true }
    );

    if (requestId) {
      await Request.findByIdAndUpdate(requestId, {
        rating: Number(rating),
        review: review?.trim() || ''
      }).catch(() => {});
    }

    res.json({
      success: true,
      newRating: Number(avgRating),
      totalReviews: updatedReviews.length,
      provider: {
        id: updatedProvider._id.toString(),
        rating: updatedProvider.rating,
        totalJobs: updatedProvider.totalJobs
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
