import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Smart AI text parser for emergency categorization (Roman Urdu & English support)
router.post('/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const lowerDesc = description.toLowerCase();
    
    // Default categories & keywords
    const matches = {
      electrician: ['bijli', 'electric', 'wire', 'wiring', 'spark', 'short circuit', 'fan', 'light', 'ups', 'meter', 'current', 'dhuan', 'smoke', 'board', 'switch', 'pankha', 'button', 'holder'],
      plumber: ['pani', 'water', 'leak', 'pipe', 'tap', 'flush', 'sink', 'tank', 'washroom', 'drain', 'gutter', 'nalka', 'motor', 'pump', 'tooti', 'commode', 'leakage'],
      'AC mechanic': ['ac', 'aircon', 'cooling', 'compressor', 'split', 'window ac', 'chilling', 'gas charge', 'servicing', 'garm', 'heat', 'filter'],
      painter: ['rang', 'color', 'paint', 'paints', 'damp', 'deewar', 'wall paint', 'painter', 'distemper', 'seelan'],
      mason: ['mason', 'tile', 'marble', 'cement', 'eent', 'brick', 'plaster', 'floor', 'construct', 'mistri', 'kanta', 'pathar'],
      'appliance repair': ['fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'tv', 'led', 'dispenser', 'dryer', 'machine', 'geyser', 'freeze', 'friz'],
      carpenter: ['carpenter', 'wood', 'lakri', 'door', 'table', 'chair', 'sofa', 'bed', 'lock', 'cabinet', 'almari', 'hinge', 'darwaza'],
      'car mechanic': ['car', 'gaari', 'engine', 'tuning', 'brake', 'oil change', 'puncture', 'battery', 'mechanic', 'radiator', 'tyre', 'gari', 'break'],
      cleaner: ['clean', 'cleaning', 'safai', 'carpet', 'sofa cleaning', 'deep cleaning', 'dusting', 'wash', 'broom', 'jharoo', 'pocha'],
      'cctv installer': ['cctv', 'camera', 'security', 'wifi', 'router', 'network', 'internet', 'dvr', 'cable', 'lan', 'camra'],
      'solar technician': ['solar', 'plate', 'panel', 'inverter', 'battery', 'lithium', 'load shedding', 'shamsi', 'soler', 'platein']
    };

    let detectedCategory = 'appliance repair'; // Default fallback

    let highestScore = 0;

    for (const [category, keywords] of Object.entries(matches)) {
      let score = 0;
      keywords.forEach(kw => {
        if (lowerDesc.includes(kw)) {
          score++;
          // Double score for precise matches
          if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerDesc)) {
            score++;
          }
        }
      });

      if (score > highestScore) {
        highestScore = score;
        detectedCategory = category;
      }
    }

    // Urgency detection (fires, short circuits, water flooding, extreme heat/cold)
    const urgencyKeywords = [
      'spark', 'short circuit', 'dhuan', 'smoke', 'fire', 'current', 'shock',
      'flooding', 'leakage', 'leak', 'drain block', 'urgent', 'jaldi', 'emergency',
      'blast', 'blast ho gaya', 'ag lag', 'tapak', 'paani hi paani', 'water load'
    ];

    let urgency = 'Normal';
    urgencyKeywords.forEach(kw => {
      if (lowerDesc.includes(kw)) {
        urgency = 'High';
      }
    });

    // Simulated parsing delay for AI impact
    await new Promise(resolve => setTimeout(resolve, 600));

    res.json({
      serviceType: detectedCategory,
      urgency,
      confidence: highestScore > 0 ? 0.90 : 0.50,
      aiSummary: description.length > 50 ? `${description.substring(0, 50)}...` : description
    });
  } catch (error) {
    console.error('Error analyzing request:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

// Fetch user's active request (customer or provider role)
router.get('/active-job/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find if user is a provider
    const provider = db.providers.findOne({ userId });

    let activeJob = null;
    if (provider) {
      // Find jobs assigned to this provider which are accepted
      activeJob = db.requests.findOne({
        providerId: provider.id,
        status: 'accepted'
      });
    } else {
      // Find jobs created by this customer which are pending or accepted
      activeJob = db.requests.findOne({
        customerId: userId,
        status: 'pending'
      }) || db.requests.findOne({
        customerId: userId,
        status: 'accepted'
      });
    }

    if (!activeJob) {
      return res.json({ job: null });
    }

    // Attach counterparty profiles
    const customer = db.users.findById(activeJob.customerId);
    let providerDetails = null;

    if (activeJob.providerId) {
      const pProfile = db.providers.findById(activeJob.providerId);
      const pUser = db.users.findById(pProfile.userId);
      providerDetails = {
        id: pProfile.id,
        name: pUser ? pUser.name : 'Service Partner',
        phone: pUser ? pUser.phone : '',
        serviceType: pProfile.serviceType,
        coordinates: pProfile.location?.coordinates,
        profilePic: pUser ? pUser.profilePic : null
      };
    }

    res.json({
      job: {
        ...activeJob,
        customerName: customer ? customer.name : 'Emergency Customer',
        customerPhone: customer ? customer.phone : '',
        customerProfilePic: customer ? customer.profilePic : null,
        provider: providerDetails
      }
    });
  } catch (error) {
    console.error('Error fetching active job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
