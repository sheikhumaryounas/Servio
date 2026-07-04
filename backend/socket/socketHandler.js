import { db } from '../config/db.js';
import { callAI } from '../config/aiService.js';

// Map of userId -> socketId
const userSockets = new Map();
// Map of socketId -> userId (to reverse lookup on disconnect)
const socketUsers = new Map();

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user socket mapping
    socket.on('user:register', ({ userId, role }) => {
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`Registered user ${userId} (${role}) on socket ${socket.id}`);
      
      // Send current available providers list to the newly registered customer immediately
      if (role === 'customer') {
        const activeProviders = db.providers.find({ isAvailable: true });
        socket.emit('providers:list', activeProviders);
      }
    });

    // Provider toggling active status
    socket.on('provider:toggle_status', ({ providerId, isAvailable, coordinates }) => {
      console.log(`Provider ${providerId} toggling availability to ${isAvailable}`);
      
      const updateData = { isAvailable };
      if (coordinates) {
        updateData.location = {
          type: 'Point',
          coordinates: coordinates // [lng, lat]
        };
      }

      db.providers.findByIdAndUpdate(providerId, updateData);
      
      // Broadcast update to all connected customers
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Provider location updates (from live tracker or simulation)
    socket.on('provider:location_update', ({ providerId, coordinates }) => {
      if (!coordinates || coordinates.length !== 2) return;
      
      db.providers.findByIdAndUpdate(providerId, {
        location: {
          type: 'Point',
          coordinates: coordinates
        },
        lastActive: new Date().toISOString()
      });

      // Broadcast the updated list of all active providers
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Start simulation: register mock providers in backend DB
    socket.on('simulation:start_providers', (providers) => {
      console.log(`[Simulation] Registering ${providers.length} mock providers in backend database.`);
      
      // Clean up any existing simulated providers to avoid duplicates
      const allProviders = db.providers.find();
      allProviders.forEach(p => {
        if (p.id && p.id.startsWith('sim-prov-')) {
          db.providers.data = db.providers.data.filter(prov => prov.id !== p.id);
          db.users.data = db.users.data.filter(u => u.id !== p.userId);
        }
      });
      db.providers.save();
      db.users.save();

      // Register the new mock providers and users
      providers.forEach(p => {
        db.users.create({
          id: p.userId,
          name: p.name,
          phone: p.phone,
          email: `${p.name.replace(/\s+/g, '').toLowerCase()}@simulation.com`,
          password: 'mockpassword',
          role: 'provider',
          profilePic: null
        });

        db.providers.create({
          id: p.id,
          userId: p.userId,
          serviceType: p.serviceType,
          isAvailable: p.isAvailable,
          location: p.location,
          rating: p.rating,
          totalJobs: p.totalJobs,
          experience: p.experience,
          lastActive: new Date().toISOString()
        });
      });

      // Broadcast active provider list update
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Update simulated provider locations in backend as they drift/move
    socket.on('simulation:update_locations', (providers) => {
      providers.forEach(p => {
        db.providers.findByIdAndUpdate(p.id, {
          location: p.location,
          lastActive: new Date().toISOString()
        });
      });
      // Broadcast updated list
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Stop simulation: clean up mock providers in backend DB
    socket.on('simulation:stop_providers', () => {
      console.log(`[Simulation] Cleaning up mock providers in backend database.`);
      
      const allProviders = db.providers.find();
      allProviders.forEach(p => {
        if (p.id && p.id.startsWith('sim-prov-')) {
          db.providers.data = db.providers.data.filter(prov => prov.id !== p.id);
          db.users.data = db.users.data.filter(u => u.id !== p.userId);
        }
      });
      db.providers.save();
      db.users.save();

      // Broadcast active provider list update
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Customer requesting a new service (emergency match)
    socket.on('request:create', async ({ customerId, serviceType, description, coordinates, image, voiceAudio, aiDiagnosis, isEmergency, sosMatchRadius }) => {
      console.log(`New request from customer ${customerId} for ${serviceType}. Emergency: ${isEmergency}, Custom Radius: ${sosMatchRadius}`);
      
      let finalDescription = description;
      let finalServiceType = serviceType;
      let finalUrgency = isEmergency ? 'High' : (aiDiagnosis?.urgency || 'Normal');
      let finalAiDiagnosis = aiDiagnosis || null;

      // Real-time audio analysis with Gemini if key is active and voice note is attached
      if (voiceAudio && process.env.GEMINI_API_KEY) {
        try {
          const base64Data = voiceAudio.includes(',') ? voiceAudio.split(',')[1] : voiceAudio;
          const mimeType = voiceAudio.includes('data:') ? voiceAudio.split(';')[0].split(':')[1] : 'audio/wav';

          const prompt = `
            You are the voice note transcriber and dispatcher for "Servio" (real-time service concierge).
            Analyze the attached audio clip describing a home emergency/issue.
            1. Transcribe the audio exactly.
            2. Classify the service category.
            3. Estimate the urgency.

            Respond ONLY with a valid JSON object matching this schema:
            {
              "transcription": "The precise transcribed text of the user's speech in English or Urdu",
              "serviceType": "electrician" | "plumber" | "AC mechanic" | "painter" | "mason" | "appliance repair" | "carpenter" | "car mechanic" | "cleaner" | "cctv installer" | "solar technician",
              "urgency": "Normal" | "Medium" | "High",
              "safetyWarning": "A critical safety warning for the customer under 15 words. If no immediate hazard, return 'No immediate safety hazard. Standard caution recommended.'",
              "checklist": ["Technician check 1", "Technician check 2", "Technician check 3"]
            }
          `;

          const voiceResult = await callAI([
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

          if (voiceResult && voiceResult.transcription) {
            finalDescription = voiceResult.transcription + (description ? `\n(Text description: ${description})` : '');
            if (!serviceType || serviceType === 'appliance repair') {
              finalServiceType = voiceResult.serviceType;
            }
            if (!isEmergency) {
              finalUrgency = voiceResult.urgency;
            }
            finalAiDiagnosis = {
              success: true,
              serviceType: finalServiceType,
              urgency: finalUrgency,
              confidence: 0.95,
              diagnosis: `Audio Transcription: "${voiceResult.transcription}"`,
              partsRequired: ['Standard inspection kit'],
              priceRange: '1,000 - 2,500 PKR',
              aiSummary: voiceResult.transcription,
              safetyWarning: voiceResult.safetyWarning || 'No immediate safety hazard. Standard caution recommended.',
              checklist: voiceResult.checklist && voiceResult.checklist.length > 0 ? voiceResult.checklist : [
                'Inspect components related to audio request.',
                'Verify the reported issue on-site.',
                'Perform standard repairs and test setup.'
              ]
            };
          }
        } catch (err) {
          console.error('[Socket] Voice note transcription failed:', err.message);
        }
      }

      // If no AI diagnosis report was set by visual or voice analysis, build a smart fallback diagnosis
      if (!finalAiDiagnosis) {
        finalAiDiagnosis = {
          success: false,
          serviceType: finalServiceType,
          urgency: finalUrgency,
          confidence: 0.70,
          diagnosis: `Standard request for ${finalServiceType} service.`,
          partsRequired: ['Standard diagnostic tools'],
          priceRange: '1,000 - 2,500 PKR',
          aiSummary: finalDescription || `Booking request for ${finalServiceType}.`,
          safetyWarning: finalUrgency === 'High' ? 'Safety recommendation: Caution is advised. Power down any dangerous systems.' : 'No immediate safety hazard. Standard caution recommended.',
          checklist: [
            `Verify the reported problem: "${(finalDescription || '').substring(0, 30)}..."`,
            'Check related connections and power/water supply',
            'Restore normal operations and test thoroughly'
          ]
        };
      }

      // Create request in database
      const newRequest = db.requests.create({
        customerId,
        serviceType: finalServiceType,
        description: finalDescription,
        status: 'pending',
        customerLocation: {
          type: 'Point',
          coordinates: coordinates // [lng, lat]
        },
        providerId: null,
        image: image || null,
        voiceAudio: voiceAudio || null,
        aiDiagnosis: finalAiDiagnosis,
        isEmergency: isEmergency || false,
        urgency: finalUrgency,
        price: 0,
        negotiation: {
          proposedPrice: 0,
          proposedBy: null,
          status: 'idle'
        },
        partsList: [],
        partsTotal: 0
      });

      // Get user detail
      const customer = db.users.findById(customerId);
      const requestData = {
        ...newRequest,
        customerName: customer ? customer.name : 'Emergency Customer',
        customerPhone: customer ? customer.phone : '',
        customerProfilePic: customer ? customer.profilePic : null
      };

      // Query nearby available providers
      let nearbyProviders = [];
      if (isEmergency) {
        const radiusMeters = (sosMatchRadius || 15) * 1000;
        // Query providers of this service type first
        nearbyProviders = db.providers.find({
          serviceType: serviceType,
          isAvailable: true,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: coordinates },
              $maxDistance: radiusMeters
            }
          }
        });
        
        // If none of that specific service type are available, broadcast to all available providers within radius
        if (nearbyProviders.length === 0) {
          nearbyProviders = db.providers.find({
            isAvailable: true,
            location: {
              $near: {
                $geometry: { type: 'Point', coordinates: coordinates },
                $maxDistance: radiusMeters
              }
            }
          });
        }
      } else {
        // Standard matching (within 10km)
        nearbyProviders = db.providers.find({
          serviceType: serviceType,
          isAvailable: true,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: coordinates },
              $maxDistance: 10000
            }
          }
        });
      }

      console.log(`Found ${nearbyProviders.length} matching providers nearby.`);

      // Send incoming request to all matching nearby providers
      let sentCount = 0;
      nearbyProviders.forEach(provider => {
        const providerSocketId = userSockets.get(provider.userId);
        if (providerSocketId) {
          io.to(providerSocketId).emit('request:incoming', requestData);
          sentCount++;
        }
      });

      // Confirm to customer that request is created and sent to providers
      socket.emit('request:created', { request: requestData, sentToCount: sentCount });

      // Check for simulated provider to auto-accept the request (for simulation mode)
      const simProvider = nearbyProviders.find(p => p.id && p.id.startsWith('sim-prov-'));
      if (simProvider) {
        setTimeout(() => {
          const req = db.requests.findById(newRequest.id);
          if (req && req.status === 'pending') {
            console.log(`[Simulation] Auto-accepting request ${req.id} on behalf of simulated provider ${simProvider.id}`);
            
            const updatedRequest = db.requests.findByIdAndUpdate(req.id, {
              status: 'accepted',
              providerId: simProvider.id
            });
            db.providers.findByIdAndUpdate(simProvider.id, { isAvailable: false });
            
            const providerUser = db.users.findById(simProvider.userId);
            const matchDetails = {
              request: updatedRequest,
              provider: {
                id: simProvider.id,
                name: providerUser ? providerUser.name : 'Simulated Partner',
                phone: providerUser ? providerUser.phone : '0300-1234567',
                serviceType: simProvider.serviceType,
                coordinates: simProvider.location?.coordinates,
                profilePic: providerUser ? providerUser.profilePic : null
              }
            };
            
            const customerSocketId = userSockets.get(req.customerId);
            if (customerSocketId) {
              io.to(customerSocketId).emit('request:matched', matchDetails);
            }
            
            const allActiveProviders = db.providers.find({ isAvailable: true });
            io.emit('providers:update', allActiveProviders);
          }
        }, 3000);
      }
    });

    // Provider responding to a request (accept / reject)
    socket.on('request:respond', ({ requestId, providerId, action }) => {
      console.log(`Provider ${providerId} responded with action: ${action} to request ${requestId}`);
      
      const request = db.requests.findById(requestId);
      if (!request) {
        socket.emit('request:error', { message: 'Request not found' });
        return;
      }

      if (request.status !== 'pending' && action === 'accept') {
        socket.emit('request:error', { message: 'This request has already been accepted by another provider.' });
        return;
      }

      if (action === 'accept') {
        // Update request database status
        const updatedRequest = db.requests.findByIdAndUpdate(requestId, {
          status: 'accepted',
          providerId: providerId
        });

        // Set provider status to busy/not available for other jobs
        db.providers.findByIdAndUpdate(providerId, { isAvailable: false });

        // Retrieve customer user socket and provider profile
        const providerUser = db.users.findById(db.providers.findById(providerId).userId);
        const providerProfile = db.providers.findById(providerId);

        const matchDetails = {
          request: updatedRequest,
          provider: {
            id: providerId,
            name: providerUser ? providerUser.name : 'Service Partner',
            phone: providerUser ? providerUser.phone : '',
            serviceType: providerProfile.serviceType,
            coordinates: providerProfile.location?.coordinates,
            profilePic: providerUser ? providerUser.profilePic : null
          }
        };

        // Notify customer
        const customerSocketId = userSockets.get(request.customerId);
        if (customerSocketId) {
          io.to(customerSocketId).emit('request:matched', matchDetails);
        }

        // Notify provider
        socket.emit('request:confirmed', matchDetails);

        // Broadcast active provider list update since this provider is now busy
        const allActiveProviders = db.providers.find({ isAvailable: true });
        io.emit('providers:update', allActiveProviders);

      } else {
        // Handle reject (can notify customer if needed, or simply log it)
        console.log(`Provider ${providerId} rejected request ${requestId}`);
      }
    });

    // Chat messaging
    socket.on('chat:send_message', ({ requestId, senderId, text }) => {
      const request = db.requests.findById(requestId);
      if (!request) return;

      const message = {
        senderId,
        text,
        timestamp: new Date().toISOString()
      };

      // Append message to requests document (simple message log)
      const messages = request.messages || [];
      messages.push(message);
      db.requests.findByIdAndUpdate(requestId, { messages });

      // Identify receiver
      let receiverId = null;
      if (senderId === request.customerId) {
        const providerProfile = db.providers.findById(request.providerId);
        receiverId = providerProfile?.userId;
      } else {
        receiverId = request.customerId;
      }

      if (receiverId) {
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('chat:receive_message', { ...message, requestId });
        }
      }

      // If the receiver is a simulated provider, auto-reply to the customer
      if (senderId === request.customerId && request.providerId && request.providerId.startsWith('sim-prov-')) {
        setTimeout(() => {
          const mockReplies = [
            "Bilkul, main raste mein hoon aur jaldi pahunch raha hoon.",
            "Main GPS location follow kar raha hoon, bas 5 minute mein pahunch jaunga.",
            "Ji main aa raha hoon, kindly exact house number share kar dein.",
            "Ghabraen nahi, main emergency equipment ke sath aa raha hoon.",
            "Main location par bas pahunchne wala hoon."
          ];
          const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
          const replyMessage = {
            senderId: request.providerId,
            text: randomReply,
            timestamp: new Date().toISOString()
          };

          const currentRequest = db.requests.findById(requestId);
          if (currentRequest) {
            const updatedMessages = currentRequest.messages || [];
            updatedMessages.push(replyMessage);
            db.requests.findByIdAndUpdate(requestId, { messages: updatedMessages });
          }

          socket.emit('chat:receive_message', { ...replyMessage, requestId });
        }, 2000);
      }
    });

    // Live Bidding Price Proposal
    socket.on('request:propose_price', ({ requestId, proposedPrice, proposedBy }) => {
      console.log(`Price proposed for request ${requestId}: ${proposedPrice} PKR by ${proposedBy}`);
      
      const req = db.requests.findById(requestId);
      if (!req) return;

      const negotiation = {
        proposedPrice: Number(proposedPrice),
        proposedBy,
        status: 'pending'
      };

      db.requests.findByIdAndUpdate(requestId, { negotiation });

      // Notify the counterparty
      let targetUserId = null;
      if (proposedBy === 'provider') {
        targetUserId = req.customerId;
      } else {
        const providerProfile = db.providers.findById(req.providerId);
        targetUserId = providerProfile?.userId;
      }

      if (targetUserId) {
        const targetSocketId = userSockets.get(targetUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('request:price_proposed', { requestId, negotiation });
        }
      }

      // Asynchronous AI Negotiation Copilot analysis
      if (process.env.GEMINI_API_KEY) {
        (async () => {
          try {
            const prompt = `
              You are the "Servio AI Fair-Price Copilot". 
              A service request has been made for:
              - Service: ${req.serviceType}
              - Description: ${req.description}
              - Visual/AI Diagnosis: ${req.aiDiagnosis?.diagnosis || 'N/A'}
              - Est. Price Range: ${req.aiDiagnosis?.priceRange || '1,000 - 2,500 PKR'}

              The ${proposedBy === 'provider' ? 'service provider' : 'customer'} has proposed a rate of ${proposedPrice} PKR.

              Evaluate if this is a fair rate. Respond ONLY with a valid JSON object matching this schema:
              {
                "status": "fair" | "high" | "low",
                "advice": "A short, professional, single-sentence advice (under 15 words) in English."
              }
            `;
            
            const copilotResult = await callAI([
              { parts: [{ text: prompt }] }
            ]);

            if (copilotResult && copilotResult.status) {
              const updatedReq = db.requests.findById(requestId);
              if (updatedReq) {
                const updatedNegotiation = {
                  ...updatedReq.negotiation,
                  copilotAnalysis: {
                    status: copilotResult.status,
                    advice: copilotResult.advice
                  }
                };
                db.requests.findByIdAndUpdate(requestId, { negotiation: updatedNegotiation });
                
                // Emit to both Customer and Provider
                const customerSocketId = userSockets.get(updatedReq.customerId);
                if (customerSocketId) {
                  io.to(customerSocketId).emit('request:copilot_analysis', { 
                    requestId, 
                    copilotAnalysis: copilotResult 
                  });
                }
                
                if (updatedReq.providerId) {
                  const provProfile = db.providers.findById(updatedReq.providerId);
                  if (provProfile) {
                    const providerSocketId = userSockets.get(provProfile.userId);
                    if (providerSocketId) {
                      io.to(providerSocketId).emit('request:copilot_analysis', { 
                        requestId, 
                        copilotAnalysis: copilotResult 
                      });
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error('[Socket] AI Negotiation Copilot failed:', err.message);
          }
        })();
      } else {
        // Fallback analysis if Gemini is not configured
        setTimeout(() => {
          const priceRangeStr = req.aiDiagnosis?.priceRange || '1,000 - 2,500 PKR';
          const match = priceRangeStr.replace(/,/g, '').match(/\b\d+\b/g);
          let min = 1000;
          let max = 2500;
          if (match && match.length >= 2) {
            min = Number(match[0]);
            max = Number(match[1]);
          }
          
          let status = 'fair';
          let advice = 'Rate matches standard market average for this service.';
          const proposed = Number(proposedPrice);
          
          if (proposed > max * 1.1) {
            status = 'high';
            advice = `Rate is a bit high. Standard average is ${priceRangeStr}.`;
          } else if (proposed < min * 0.9) {
            status = 'low';
            advice = 'Rate is very low and competitive. Recommended to accept.';
          }
          
          const updatedReq = db.requests.findById(requestId);
          if (updatedReq) {
            const updatedNegotiation = {
              ...updatedReq.negotiation,
              copilotAnalysis: { status, advice }
            };
            db.requests.findByIdAndUpdate(requestId, { negotiation: updatedNegotiation });
            
            // Emit to both
            const customerSocketId = userSockets.get(updatedReq.customerId);
            if (customerSocketId) {
              io.to(customerSocketId).emit('request:copilot_analysis', { 
                requestId, 
                copilotAnalysis: { status, advice } 
              });
            }
            if (updatedReq.providerId) {
              const provProfile = db.providers.findById(updatedReq.providerId);
              if (provProfile) {
                const providerSocketId = userSockets.get(provProfile.userId);
                if (providerSocketId) {
                  io.to(providerSocketId).emit('request:copilot_analysis', { 
                    requestId, 
                    copilotAnalysis: { status, advice } 
                  });
                }
              }
            }
          }
        }, 1200);
      }
    });

    // Live Bidding Price Response (Accept / Reject)
    socket.on('request:respond_price', ({ requestId, action }) => {
      console.log(`Price response for request ${requestId}: ${action}`);
      const req = db.requests.findById(requestId);
      if (!req) return;

      let negotiation = { ...req.negotiation };
      let finalPrice = req.price || 0;

      if (action === 'accept') {
        negotiation.status = 'accepted';
        finalPrice = negotiation.proposedPrice;
      } else {
        negotiation.status = 'rejected';
      }

      db.requests.findByIdAndUpdate(requestId, { 
        negotiation, 
        price: finalPrice 
      });

      // Send update to both customer and provider
      const customerSocketId = userSockets.get(req.customerId);
      if (customerSocketId) {
        io.to(customerSocketId).emit('request:price_locked', { 
          requestId, 
          negotiation, 
          price: finalPrice 
        });
      }

      const providerProfile = db.providers.findById(req.providerId);
      if (providerProfile) {
        const providerSocketId = userSockets.get(providerProfile.userId);
        if (providerSocketId) {
          io.to(providerSocketId).emit('request:price_locked', { 
            requestId, 
            negotiation, 
            price: finalPrice 
          });
        }
      }
    });

    // Parts Invoice Request
    socket.on('parts:request', ({ requestId, parts }) => {
      console.log(`Parts requested for request ${requestId}:`, parts);
      const req = db.requests.findById(requestId);
      if (!req) return;

      const newParts = parts.map(p => ({
        name: p.name,
        price: Number(p.price),
        status: 'pending'
      }));

      const existingPartsList = req.partsList || [];
      const updatedPartsList = [...existingPartsList, ...newParts];

      db.requests.findByIdAndUpdate(requestId, {
        partsList: updatedPartsList
      });

      // Notify customer
      const customerSocketId = userSockets.get(req.customerId);
      if (customerSocketId) {
        io.to(customerSocketId).emit('parts:incoming', {
          requestId,
          partsList: updatedPartsList
        });
      }
    });

    // Parts Invoice Response (Approve / Reject)
    socket.on('parts:respond', ({ requestId, action }) => {
      console.log(`Parts response for request ${requestId}: ${action}`);
      const req = db.requests.findById(requestId);
      if (!req) return;

      const updatedPartsList = (req.partsList || []).map(p => {
        if (p.status === 'pending') {
          return { ...p, status: action === 'approve' ? 'approved' : 'rejected' };
        }
        return p;
      });

      const approvedPartsSum = updatedPartsList
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.price, 0);

      const partsTotal = approvedPartsSum;
      const currentPrice = req.price || 0;
      
      const newPrice = currentPrice + (action === 'approve' ? updatedPartsList.filter(p => p.status === 'approved' && !(req.partsList || []).find(oldP => oldP.name === p.name && oldP.status === 'approved')).reduce((sum, p) => sum + p.price, 0) : 0);

      db.requests.findByIdAndUpdate(requestId, {
        partsList: updatedPartsList,
        partsTotal,
        price: newPrice
      });

      // Notify both customer and provider
      const customerSocketId = userSockets.get(req.customerId);
      if (customerSocketId) {
        io.to(customerSocketId).emit('parts:updated', {
          requestId,
          partsList: updatedPartsList,
          partsTotal,
          price: newPrice
        });
      }

      const providerProfile = db.providers.findById(req.providerId);
      if (providerProfile) {
        const providerSocketId = userSockets.get(providerProfile.userId);
        if (providerSocketId) {
          io.to(providerSocketId).emit('parts:updated', {
            requestId,
            partsList: updatedPartsList,
            partsTotal,
            price: newPrice
          });
        }
      }
    });

    // End active job
    socket.on('request:complete', ({ requestId, providerId }) => {
      console.log(`Completing job for request ${requestId}`);
      
      const request = db.requests.findById(requestId);
      db.requests.findByIdAndUpdate(requestId, { status: 'completed' });
      
      // Make provider available again
      db.providers.findByIdAndUpdate(providerId, { isAvailable: true });

      // Award XP & Levelups
      const provider = db.providers.findById(providerId);
      if (provider) {
        const oldXp = provider.xp || 0;
        const oldLevel = provider.level || 1;
        const newXp = oldXp + 150; // +150 XP
        const newLevel = Math.floor(newXp / 500) + 1;
        
        let newBadge = provider.badge || 'Rookie';
        if (newLevel >= 7) newBadge = 'Golden Legend';
        else if (newLevel >= 4) newBadge = 'Silver Expert';
        else if (newLevel >= 2) newBadge = 'Bronze Pro';

        db.providers.findByIdAndUpdate(providerId, {
          xp: newXp,
          level: newLevel,
          badge: newBadge,
          totalJobs: (provider.totalJobs || 0) + 1
        });

        // Trigger level up socket notify
        const providerSocketId = userSockets.get(provider.userId);
        if (providerSocketId && newLevel > oldLevel) {
          io.to(providerSocketId).emit('provider:levelup', {
            level: newLevel,
            badge: newBadge,
            xp: newXp
          });
        }

        console.log(`Provider ${providerId} rewarded +150 XP. New XP: ${newXp}, Level: ${newLevel}, Badge: ${newBadge}`);
      }

      // Notify customer
      if (request) {
        const customerSocketId = userSockets.get(request.customerId);
        if (customerSocketId) {
          io.to(customerSocketId).emit('request:completed', { requestId });
        }
      }

      // Notify provider
      socket.emit('request:completed', { requestId });

      // Broadcast available providers update
      const allActiveProviders = db.providers.find({ isAvailable: true });
      io.emit('providers:update', allActiveProviders);
    });

    // Cancel request/job
    socket.on('request:cancel', ({ requestId, role }) => {
      console.log(`Request ${requestId} cancelled by ${role}`);
      const req = db.requests.findById(requestId);
      if (req) {
        db.requests.findByIdAndUpdate(requestId, { status: 'cancelled' });
        if (req.providerId) {
          db.providers.findByIdAndUpdate(req.providerId, { isAvailable: true });
        }

        // Notify customer
        const customerSocketId = userSockets.get(req.customerId);
        if (customerSocketId) {
          io.to(customerSocketId).emit('request:cancelled', { requestId });
        }

        // Notify provider
        if (req.providerId) {
          const providerProfile = db.providers.findById(req.providerId);
          if (providerProfile) {
            const providerSocketId = userSockets.get(providerProfile.userId);
            if (providerSocketId) {
              io.to(providerSocketId).emit('request:cancelled', { requestId });
            }
          }
        }

        // Broadcast available providers update since provider is now available
        const allActiveProviders = db.providers.find({ isAvailable: true });
        io.emit('providers:update', allActiveProviders);
      }
    });

    // Disconnection clean up
    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        console.log(`User ${userId} disconnected. Socket: ${socket.id}`);
        userSockets.delete(userId);
        socketUsers.delete(socket.id);

        // Check if user is a provider. If yes, auto-toggle offline
        const provider = db.providers.findOne({ userId });
        if (provider) {
          console.log(`Auto-toggling provider ${provider.id} offline due to socket disconnect.`);
          db.providers.findByIdAndUpdate(provider.id, { isAvailable: false });
          
          // Broadcast update to all customers
          const allActiveProviders = db.providers.find({ isAvailable: true });
          io.emit('providers:update', allActiveProviders);
        }
      } else {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });
};
