import express from 'express';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Request from '../models/Request.js';
import Transaction from '../models/Transaction.js';
import { callAI } from '../config/aiService.js';

const router = express.Router();

// Smart AI text parser for emergency categorization (Roman Urdu & English support)
router.post('/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Try Gemini classification if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          You are the AI routing core of "Servio", a real-time local service finder.
          Analyze the following user service request description:
          "${description}"

          Your task is to classify this request. Respond ONLY with a valid JSON object matching this schema:
          {
            "serviceType": "electrician" | "plumber" | "AC mechanic" | "painter" | "mason" | "appliance repair" | "carpenter" | "car mechanic" | "cleaner" | "cctv installer" | "solar technician",
            "urgency": "Normal" | "Medium" | "High",
            "confidence": float (between 0.0 and 1.0),
            "aiSummary": "A concise one-sentence summary of the user's issue in English.",
            "safetyWarning": "A critical safety warning for the customer under 15 words. If no immediate hazard, return 'No immediate safety hazard. Standard caution recommended.'",
            "checklist": ["Technician check 1", "Technician check 2", "Technician check 3"]
          }
        `;
        const geminiResult = await callAI([
          { parts: [{ text: prompt }] }
        ]);
        return res.json(geminiResult);
      } catch (geminiError) {
        console.warn('[Requests API] Gemini analyze failed, falling back to keyword rules:', geminiError.message);
      }
    }

    const lowerDesc = description.toLowerCase();
    
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

    let detectedCategory = 'appliance repair';
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(matches)) {
      let score = 0;
      keywords.forEach(kw => {
        if (lowerDesc.includes(kw)) {
          score++;
          if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerDesc)) score++;
        }
      });
      if (score > highestScore) { highestScore = score; detectedCategory = category; }
    }

    const urgencyKeywords = ['spark', 'short circuit', 'dhuan', 'smoke', 'fire', 'current', 'shock', 'flooding', 'leakage', 'leak', 'drain block', 'urgent', 'jaldi', 'emergency', 'blast', 'ag lag', 'tapak', 'paani hi paani'];
    let urgency = 'Normal';
    urgencyKeywords.forEach(kw => { if (lowerDesc.includes(kw)) urgency = 'High'; });

    await new Promise(resolve => setTimeout(resolve, 600));

    res.json({
      serviceType: detectedCategory,
      urgency,
      confidence: highestScore > 0 ? 0.90 : 0.50,
      aiSummary: description.length > 50 ? `${description.substring(0, 50)}...` : description,
      safetyWarning: urgency === 'High' ? 'Safety recommendation: Caution is advised. Power down any dangerous circuits/valves.' : 'No immediate safety hazard. Standard caution recommended.',
      checklist: [
        `Verify the reported problem: "${description.substring(0, 30)}..."`,
        'Check related connections and power/water supply',
        'Restore normal operations and test thoroughly'
      ]
    });
  } catch (error) {
    console.error('Error analyzing request:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

// Fetch user's active request (customer or provider role)
router.get('/active-job/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const provider = await Provider.findOne({ userId });

    let activeJob = null;
    if (provider) {
      activeJob = await Request.findOne({
        providerId: provider._id.toString(),
        status: 'accepted'
      });
    } else {
      activeJob = await Request.findOne({
        customerId: userId,
        status: { $in: ['pending', 'accepted'] }
      });
    }

    if (!activeJob) {
      return res.json({ job: null });
    }

    const customer = await User.findById(activeJob.customerId).catch(() => null);
    let providerDetails = null;

    if (activeJob.providerId) {
      const pProfile = await Provider.findById(activeJob.providerId).catch(() => null);
      if (pProfile) {
        const pUser = await User.findById(pProfile.userId).catch(() => null);
        providerDetails = {
          id: pProfile._id.toString(),
          name: pUser ? pUser.name : 'Service Partner',
          phone: pUser ? pUser.phone : '',
          serviceType: pProfile.serviceType,
          coordinates: pProfile.location?.coordinates,
          profilePic: pUser ? pUser.profilePic : null
        };
      }
    }

    res.json({
      job: {
        ...activeJob.toObject(),
        id: activeJob._id.toString(),
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

// AI Multimodal visual diagnostics simulator
router.post('/diagnose', async (req, res) => {
  try {
    const { image, serviceType, description } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const base64Data = image.includes(',') ? image.split(',')[1] : image;
        const mimeType = image.includes('data:') ? image.split(';')[0].split(':')[1] : 'image/jpeg';
        
        const prompt = `
          You are the AI Diagnostic Specialist of "Servio".
          The user has submitted a service request. We have:
          - Category/Service: ${serviceType || 'Not specified'}
          - Written Description: ${description || 'No description provided.'}

          Analyze the photo of the issue and provide a diagnostic report.
          Respond ONLY with a valid JSON object matching this schema:
          {
            "serviceType": "electrician" | "plumber" | "AC mechanic" | "painter" | "mason" | "appliance repair" | "carpenter" | "car mechanic" | "cleaner" | "cctv installer" | "solar technician",
            "urgency": "Normal" | "Medium" | "High",
            "confidence": float (between 0.0 and 1.0),
            "diagnosis": "Detailed explanation of what the problem is and why it happened",
            "partsRequired": ["Part name 1", "Part name 2"],
            "priceRange": "Est. price range in PKR (e.g. 1,500 - 3,000 PKR)",
            "aiSummary": "A concise diagnostic summary.",
            "safetyWarning": "A critical safety warning under 15 words.",
            "checklist": ["Technician check 1", "Technician check 2", "Technician check 3"]
          }
        `;
        const geminiResult = await callAI([
          { parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }
        ]);
        return res.json({ success: true, ...geminiResult });
      } catch (geminiError) {
        console.warn('[Requests API] Gemini diagnose failed, falling back to local simulation:', geminiError.message);
      }
    }

    let category = serviceType || 'electrician';
    let diagnosis = 'General appliance anomaly detected';
    let confidence = 0.88;
    let partsRequired = ['Standard repair kit'];
    let priceRange = '1,000 - 2,500 PKR';
    let urgency = 'Normal';
    const descLower = (description || '').toLowerCase();

    if (category === 'AC mechanic' || descLower.includes('ac') || descLower.includes('cooling')) {
      category = 'AC mechanic'; diagnosis = 'AC Compressor start capacitor failure'; partsRequired = ['AC Running Capacitor 45uF']; priceRange = '1,800 - 3,000 PKR'; confidence = 0.92; urgency = 'Medium';
    } else if (category === 'electrician' || descLower.includes('spark') || descLower.includes('bijli')) {
      category = 'electrician'; diagnosis = 'Terminal short-circuit in switchboard'; partsRequired = ['Single-pole 10A breaker', '1.5mm copper wiring']; priceRange = '800 - 1,500 PKR'; confidence = 0.95; urgency = 'High';
    } else if (category === 'plumber' || descLower.includes('leak') || descLower.includes('pani')) {
      category = 'plumber'; diagnosis = 'PPR connector joint fracture'; partsRequired = ['PPR Pipe Connector (25mm)', 'Thread seal tape']; priceRange = '1,200 - 2,000 PKR'; confidence = 0.89; urgency = 'Medium';
    } else if (category === 'appliance repair' || descLower.includes('fridge') || descLower.includes('machine')) {
      category = 'appliance repair'; diagnosis = 'Appliance motor relay coil burned'; partsRequired = ['Overload protector relay']; priceRange = '1,500 - 3,500 PKR'; confidence = 0.90; urgency = 'Normal';
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    res.json({
      success: true, serviceType: category, urgency, confidence, diagnosis, partsRequired, priceRange,
      aiSummary: `AI Diagnosis report completed for ${category} issue.`,
      safetyWarning: urgency === 'High' ? 'Safety recommendation: Caution is advised. Power down any dangerous circuits/valves.' : 'No immediate safety hazard. Standard caution recommended.',
      checklist: [`Safety inspection: verify overall safety of ${category} setup.`, `Inspect components related to diagnosis: "${diagnosis}".`, 'Install and test suggested parts/tools.']
    });
  } catch (error) {
    console.error('Error in AI image diagnosis:', error);
    res.status(500).json({ error: 'Server error during visual diagnostics' });
  }
});

// GET /api/requests/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const provider = await Provider.findOne({ userId });

    let requestsList = [];
    if (provider) {
      requestsList = await Request.find({ providerId: provider._id.toString() }).sort({ createdAt: -1 });
    } else {
      requestsList = await Request.find({ customerId: userId }).sort({ createdAt: -1 });
    }

    const enrichedList = await Promise.all(requestsList.map(async (reqItem) => {
      let counterpartyName = 'Service Partner';

      if (provider) {
        const customer = await User.findById(reqItem.customerId).catch(() => null);
        counterpartyName = customer ? customer.name : 'Emergency Customer';
      } else if (reqItem.providerId) {
        const pProfile = await Provider.findById(reqItem.providerId).catch(() => null);
        const pUser = pProfile ? await User.findById(pProfile.userId).catch(() => null) : null;
        counterpartyName = pUser ? pUser.name : 'Service Partner';
      }

      return {
        ...reqItem.toObject(),
        id: reqItem._id.toString(),
        counterpartyName,
        rating: reqItem.rating || null,
        review: reqItem.review || null
      };
    }));

    res.json(enrichedList);
  } catch (error) {
    console.error('Error fetching request history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests/pay
router.post('/pay', async (req, res) => {
  try {
    const { requestId, customerId } = req.body;
    if (!requestId || !customerId) {
      return res.status(400).json({ error: 'Request ID and Customer ID are required' });
    }

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request session not found' });

    if (request.status === 'paid' || request.isPaid) {
      return res.status(400).json({ error: 'This invoice has already been paid.' });
    }

    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const totalBill = request.price || 0;
    const customerBalance = customer.walletBalance !== undefined ? customer.walletBalance : 5000;
    if (customerBalance < totalBill) {
      return res.status(400).json({ error: `Insufficient wallet balance. Total bill is ${totalBill} PKR but your balance is ${customerBalance} PKR.` });
    }

    const newCustomerBalance = customerBalance - totalBill;
    await User.findByIdAndUpdate(customerId, { walletBalance: newCustomerBalance });

    let providerUserId = null;
    if (request.providerId) {
      const providerProfile = await Provider.findById(request.providerId).catch(() => null);
      if (providerProfile) {
        providerUserId = providerProfile.userId;
        const providerUser = await User.findById(providerUserId).catch(() => null);
        if (providerUser) {
          const providerBalance = providerUser.walletBalance !== undefined ? providerUser.walletBalance : 0;
          await User.findByIdAndUpdate(providerUserId, { walletBalance: providerBalance + totalBill });
        }
      }
    }

    await Request.findByIdAndUpdate(requestId, { isPaid: true, paidAt: new Date() });

    await Transaction.create({ userId: customerId, type: 'debit', amount: totalBill, requestId, description: `Payment for request #${requestId}`, date: new Date() });
    if (providerUserId) {
      await Transaction.create({ userId: providerUserId, type: 'credit', amount: totalBill, requestId, description: `Earnings for request #${requestId}`, date: new Date() });
    }

    res.json({ success: true, walletBalance: newCustomerBalance, message: 'Invoice paid successfully via simulated wallet.' });
  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({ error: 'Server error processing wallet payment' });
  }
});

// GET /api/requests/admin/metrics
router.get('/admin/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalRequests = await Request.countDocuments();
    const completedRequests = await Request.find({ status: 'completed' });
    const allRequests = await Request.find().sort({ createdAt: -1 });
    const allTransactions = await Transaction.find().sort({ createdAt: -1 });

    const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);

    res.json({
      totalUsers,
      totalProviders,
      totalRequests,
      completedRequestsCount: completedRequests.length,
      totalEarnings,
      requestsList: allRequests.map(r => ({ ...r.toObject(), id: r._id.toString() })),
      transactions: allTransactions.map(t => ({ ...t.toObject(), id: t._id.toString() }))
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Server error fetching admin metrics' });
  }
});

// POST /api/requests/admin/cancel
router.post('/admin/cancel', async (req, res) => {
  try {
    const { requestId } = req.body;
    const reqItem = await Request.findById(requestId);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    await Request.findByIdAndUpdate(requestId, { status: 'cancelled' });
    if (reqItem.providerId) {
      await Provider.findByIdAndUpdate(reqItem.providerId, { isAvailable: true });
    }

    res.json({ success: true, message: 'Request successfully cancelled by administrator.' });
  } catch (error) {
    console.error('Admin cancel request error:', error);
    res.status(500).json({ error: 'Server error overriding request' });
  }
});

// DELETE /api/requests/:requestId
router.delete('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const deleted = await Request.findByIdAndDelete(requestId);
    if (deleted) {
      res.json({ success: true, message: 'Request record successfully deleted.' });
    } else {
      res.status(404).json({ error: 'Request record not found.' });
    }
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Server error deleting request log' });
  }
});

// DELETE /api/requests/clear-all/:userId
router.delete('/clear-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const provider = await Provider.findOne({ userId });
    
    if (provider) {
      await Request.deleteMany({ providerId: provider._id.toString() });
    } else {
      await Request.deleteMany({ customerId: userId });
    }

    res.json({ success: true, message: 'All request history cleared successfully.' });
  } catch (error) {
    console.error('Clear requests history error:', error);
    res.status(500).json({ error: 'Server error clearing requests history' });
  }
});

export default router;
