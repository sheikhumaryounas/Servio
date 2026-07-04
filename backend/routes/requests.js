import express from 'express';
import { db } from '../config/db.js';
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
            "aiSummary": "A concise one-sentence summary of the user's issue in English."
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

// AI Multimodal visual diagnostics simulator
router.post('/diagnose', async (req, res) => {
  try {
    const { image, serviceType, description } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    // Try Gemini classification if key is present
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
            "partsRequired": ["Part name 1", "Part name 2", ...],
            "priceRange": "Est. price range in PKR (e.g. 1,500 - 3,000 PKR)",
            "aiSummary": "A concise diagnostic summary of the visual and text inputs."
          }
        `;
        const geminiResult = await callAI([
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]);
        return res.json({
          success: true,
          ...geminiResult
        });
      } catch (geminiError) {
        console.warn('[Requests API] Gemini diagnose failed, falling back to local simulation:', geminiError.message);
      }
    }

    // Determine category based on serviceType or description
    let category = serviceType || 'electrician';
    let diagnosis = 'General appliance anomaly detected';
    let confidence = 0.88;
    let partsRequired = ['Standard repair kit'];
    let priceRange = '1,000 - 2,500 PKR';
    let urgency = 'Normal';

    const descLower = (description || '').toLowerCase();
    
    // Customize diagnostics based on common terms
    if (category === 'AC mechanic' || descLower.includes('ac') || descLower.includes('cooling')) {
      category = 'AC mechanic';
      diagnosis = 'AC Compressor start capacitor failure (leaking fluid)';
      partsRequired = ['AC Running Capacitor 45uF', 'Electrical insulation tape'];
      priceRange = '1,800 - 3,000 PKR';
      confidence = 0.92;
      urgency = 'Medium';
    } else if (category === 'electrician' || descLower.includes('spark') || descLower.includes('board') || descLower.includes('light') || descLower.includes('bijli')) {
      category = 'electrician';
      diagnosis = 'Terminal short-circuit in switchboard due to high resistance';
      partsRequired = ['Single-pole 10A breaker', '1.5mm copper wiring', '5-pin piano switch socket'];
      priceRange = '800 - 1,500 PKR';
      confidence = 0.95;
      urgency = 'High';
    } else if (category === 'plumber' || descLower.includes('leak') || descLower.includes('pani') || descLower.includes('tap') || descLower.includes('pipe')) {
      category = 'plumber';
      diagnosis = 'PPR connector joint fracture under washbasin';
      partsRequired = ['PPR Pipe Connector (25mm)', 'Thread seal tape', 'PVC Solvent cement'];
      priceRange = '1,200 - 2,000 PKR';
      confidence = 0.89;
      urgency = 'Medium';
    } else if (category === 'appliance repair' || descLower.includes('fridge') || descLower.includes('machine') || descLower.includes('oven')) {
      category = 'appliance repair';
      diagnosis = 'Appliance motor relay coil burned / open circuit';
      partsRequired = ['Overload protector relay', 'Bi-metal thermostat switch'];
      priceRange = '1,500 - 3,500 PKR';
      confidence = 0.90;
      urgency = 'Normal';
    } else if (category === 'car mechanic' || descLower.includes('car') || descLower.includes('engine')) {
      category = 'car mechanic';
      diagnosis = 'Lead-acid battery low-voltage discharge (sulfation)';
      partsRequired = ['Jumper cables charge', 'Battery terminal grease'];
      priceRange = '1,000 - 1,800 PKR';
      confidence = 0.87;
      urgency = 'High';
    }

    // Add a small artificial delay to simulate AI compute
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({
      success: true,
      serviceType: category,
      urgency,
      confidence,
      diagnosis,
      partsRequired,
      priceRange,
      aiSummary: `AI Diagnosis report completed for ${category} issue.`
    });
  } catch (error) {
    console.error('Error in AI image diagnosis:', error);
    res.status(500).json({ error: 'Server error during visual diagnostics' });
  }
});

// GET /api/requests/history/:userId - Fetch request history for a customer or provider
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is a provider
    const provider = db.providers.findOne({ userId });

    let requestsList = [];
    if (provider) {
      // Find all completed or cancelled requests for this provider
      requestsList = db.requests.find({ providerId: provider.id });
    } else {
      // Find all completed or cancelled requests for this customer
      requestsList = db.requests.find({ customerId: userId });
    }

    // Enrich requests with user/provider names
    const enrichedList = requestsList.map(reqItem => {
      let counterpartyName = 'Service Partner';
      let ratingVal = reqItem.rating || null;
      let reviewVal = reqItem.review || null;

      if (provider) {
        const customer = db.users.findById(reqItem.customerId);
        counterpartyName = customer ? customer.name : 'Emergency Customer';
      } else if (reqItem.providerId) {
        const pProfile = db.providers.findById(reqItem.providerId);
        const pUser = pProfile ? db.users.findById(pProfile.userId) : null;
        counterpartyName = pUser ? pUser.name : 'Service Partner';
      }

      return {
        ...reqItem,
        counterpartyName,
        rating: ratingVal,
        review: reviewVal
      };
    });

    // Sort by createdAt descending
    enrichedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(enrichedList);
  } catch (error) {
    console.error('Error fetching request history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/requests/pay - Deduct from customer, credit provider, log transaction
router.post('/pay', (req, res) => {
  try {
    const { requestId, customerId } = req.body;
    if (!requestId || !customerId) {
      return res.status(400).json({ error: 'Request ID and Customer ID are required' });
    }

    const request = db.requests.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request session not found' });
    }

    if (request.status === 'paid' || request.isPaid) {
      return res.status(400).json({ error: 'This invoice has already been paid.' });
    }

    const customer = db.users.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const totalBill = (request.price || 0);
    const customerBalance = customer.walletBalance !== undefined ? customer.walletBalance : 5000;
    if (customerBalance < totalBill) {
      return res.status(400).json({ error: `Insufficient wallet balance. Total bill is ${totalBill} PKR but your balance is ${customerBalance} PKR.` });
    }

    // Deduct from customer
    const newCustomerBalance = customerBalance - totalBill;
    db.users.findByIdAndUpdate(customerId, { walletBalance: newCustomerBalance });

    // Credit to provider if provider exists
    let providerUserId = null;
    if (request.providerId) {
      const providerProfile = db.providers.findById(request.providerId);
      if (providerProfile) {
        providerUserId = providerProfile.userId;
        const providerUser = db.users.findById(providerUserId);
        if (providerUser) {
          const providerBalance = providerUser.walletBalance !== undefined ? providerUser.walletBalance : 0;
          db.users.findByIdAndUpdate(providerUserId, { walletBalance: providerBalance + totalBill });
        }
      }
    }

    // Mark request as paid
    db.requests.findByIdAndUpdate(requestId, { isPaid: true, paidAt: new Date().toISOString() });

    // Record Transaction Log (debit for customer)
    db.transactions.create({
      userId: customerId,
      type: 'debit',
      amount: totalBill,
      requestId,
      description: `Payment for request #${requestId}`,
      date: new Date().toISOString()
    });

    // Record Transaction Log (credit for provider)
    if (providerUserId) {
      db.transactions.create({
        userId: providerUserId,
        type: 'credit',
        amount: totalBill,
        requestId,
        description: `Earnings for request #${requestId}`,
        date: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      walletBalance: newCustomerBalance,
      message: 'Invoice paid successfully via simulated wallet.'
    });
  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({ error: 'Server error processing wallet payment' });
  }
});

// GET /api/requests/admin/metrics - Fetch aggregate metrics for admin dashboard
router.get('/admin/metrics', (req, res) => {
  try {
    const allUsers = db.users.find();
    const allProviders = db.providers.find();
    const allRequests = db.requests.find();
    const allTransactions = db.transactions.find() || [];

    const totalUsers = allUsers.length;
    const totalProviders = allProviders.length;
    const totalRequests = allRequests.length;
    
    const completedRequests = allRequests.filter(r => r.status === 'completed');
    const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.price || 0), 0);

    res.json({
      totalUsers,
      totalProviders,
      totalRequests,
      completedRequestsCount: completedRequests.length,
      totalEarnings,
      requestsList: allRequests,
      transactions: allTransactions
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Server error fetching admin metrics' });
  }
});

// POST /api/requests/admin/cancel - Admin override to force cancel any request
router.post('/admin/cancel', (req, res) => {
  try {
    const { requestId } = req.body;
    const reqItem = db.requests.findById(requestId);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }

    db.requests.findByIdAndUpdate(requestId, { status: 'cancelled' });
    if (reqItem.providerId) {
      db.providers.findByIdAndUpdate(reqItem.providerId, { isAvailable: true });
    }

    res.json({ success: true, message: 'Request successfully cancelled by administrator.' });
  } catch (error) {
    console.error('Admin cancel request error:', error);
    res.status(500).json({ error: 'Server error overriding request' });
  }
});

export default router;
