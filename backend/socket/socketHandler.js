import Provider from '../models/Provider.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import { callAI } from '../config/aiService.js';

// Map of userId -> socketId
const userSockets = new Map();
// Map of socketId -> userId (to reverse lookup on disconnect)
const socketUsers = new Map();

// Helper: Haversine distance in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper: Filter providers by radius
function filterByRadius(providers, coordinates, maxDistanceMeters) {
  const [targetLng, targetLat] = coordinates;
  return providers.filter(p => {
    const coords = p.location?.coordinates;
    if (!coords || coords.length !== 2) return false;
    const [pLng, pLat] = coords;
    const dist = getDistance(targetLat, targetLng, pLat, pLng);
    p._distance = dist;
    return dist <= maxDistanceMeters;
  });
}

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user socket mapping
    socket.on('user:register', async ({ userId, role }) => {
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`Registered user ${userId} (${role}) on socket ${socket.id}`);
      
      if (role === 'customer') {
        try {
          const activeProviders = await Provider.find({ isAvailable: true });
          const enriched = await Promise.all(activeProviders.map(async (p) => {
            const user = await User.findById(p.userId).catch(() => null);
            return { ...p.toObject(), id: p._id.toString(), name: user?.name || 'Service Partner', phone: user?.phone || '' };
          }));
          socket.emit('providers:list', enriched);
        } catch (err) {
          console.error('[Socket] Error fetching providers for new customer:', err.message);
        }
      }
    });

    // Provider toggling active status
    socket.on('provider:toggle_status', async ({ providerId, isAvailable, coordinates }) => {
      console.log(`Provider ${providerId} toggling availability to ${isAvailable}`);
      
      try {
        const updateData = { isAvailable };
        if (coordinates) {
          updateData.location = { type: 'Point', coordinates };
        }
        await Provider.findByIdAndUpdate(providerId, updateData);

        const allActiveProviders = await Provider.find({ isAvailable: true });
        const enriched = await Promise.all(allActiveProviders.map(async (p) => {
          const user = await User.findById(p.userId).catch(() => null);
          return { ...p.toObject(), id: p._id.toString(), name: user?.name || 'Service Partner', phone: user?.phone || '' };
        }));
        io.emit('providers:update', enriched);
      } catch (err) {
        console.error('[Socket] Error toggling provider status:', err.message);
      }
    });

    // Provider location updates
    socket.on('provider:location_update', async ({ providerId, coordinates }) => {
      if (!coordinates || coordinates.length !== 2) return;
      
      try {
        await Provider.findByIdAndUpdate(providerId, {
          location: { type: 'Point', coordinates },
          lastActive: new Date()
        });

        const allActiveProviders = await Provider.find({ isAvailable: true });
        const enriched = await Promise.all(allActiveProviders.map(async (p) => {
          const user = await User.findById(p.userId).catch(() => null);
          return { ...p.toObject(), id: p._id.toString(), name: user?.name || 'Service Partner', phone: user?.phone || '' };
        }));
        io.emit('providers:update', enriched);
      } catch (err) {
        console.error('[Socket] Error updating provider location:', err.message);
      }
    });

    // Start simulation: register mock providers in DB
    socket.on('simulation:start_providers', async (providers) => {
      console.log(`[Simulation] Registering ${providers.length} mock providers.`);
      
      try {
        // Clean up existing simulated providers
        await Provider.deleteMany({ _id: { $in: providers.map(p => p.id).filter(id => id?.startsWith('sim-prov-')) } });

        for (const p of providers) {
          // Upsert simulated user
          await User.findOneAndUpdate(
            { email: `${p.name.replace(/\s+/g, '').toLowerCase()}@simulation.com` },
            { name: p.name, phone: p.phone, email: `${p.name.replace(/\s+/g, '').toLowerCase()}@simulation.com`, password: 'mockpassword', role: 'provider' },
            { upsert: true, new: true }
          );

          // Upsert simulated provider
          await Provider.findOneAndUpdate(
            { userId: p.userId },
            { userId: p.userId, serviceType: p.serviceType, isAvailable: p.isAvailable, location: p.location, rating: p.rating, totalJobs: p.totalJobs, experience: p.experience, lastActive: new Date() },
            { upsert: true, new: true }
          );
        }

        const allActiveProviders = await Provider.find({ isAvailable: true });
        const enriched = await Promise.all(allActiveProviders.map(async (p) => {
          const user = await User.findById(p.userId).catch(() => null);
          return { ...p.toObject(), id: p._id.toString(), name: user?.name || 'Service Partner', phone: user?.phone || '' };
        }));
        io.emit('providers:update', enriched);
      } catch (err) {
        console.error('[Socket] Error starting simulation:', err.message);
      }
    });

    // Update simulated provider locations
    socket.on('simulation:update_locations', async (providers) => {
      try {
        for (const p of providers) {
          await Provider.findOneAndUpdate(
            { userId: p.userId },
            { location: p.location, lastActive: new Date() }
          );
        }
        const allActiveProviders = await Provider.find({ isAvailable: true });
        const enriched = await Promise.all(allActiveProviders.map(async (p) => {
          const user = await User.findById(p.userId).catch(() => null);
          return { ...p.toObject(), id: p._id.toString(), name: user?.name || 'Service Partner', phone: user?.phone || '' };
        }));
        io.emit('providers:update', enriched);
      } catch (err) {
        console.error('[Socket] Error updating simulation locations:', err.message);
      }
    });

    // Stop simulation: clean up mock providers
    socket.on('simulation:stop_providers', async () => {
      console.log('[Simulation] Cleaning up mock providers.');
      try {
        // Remove providers whose userId ends in simulation marker
        const simUsers = await User.find({ email: /@simulation\.com$/ });
        const simUserIds = simUsers.map(u => u._id.toString());
        await Provider.deleteMany({ userId: { $in: simUserIds } });
        await User.deleteMany({ email: /@simulation\.com$/ });

        const allActiveProviders = await Provider.find({ isAvailable: true });
        io.emit('providers:update', allActiveProviders.map(p => ({ ...p.toObject(), id: p._id.toString() })));
      } catch (err) {
        console.error('[Socket] Error stopping simulation:', err.message);
      }
    });

    // Customer requesting a new service (emergency match)
    socket.on('request:create', async ({ customerId, serviceType, description, coordinates, image, voiceAudio, aiDiagnosis, isEmergency, sosMatchRadius }) => {
      console.log(`New request from customer ${customerId} for ${serviceType}. Emergency: ${isEmergency}`);
      
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
            You are the voice note transcriber and dispatcher for "Servio".
            Analyze the attached audio clip describing a home emergency/issue.
            1. Transcribe the audio exactly.
            2. Classify the service category.
            3. Estimate the urgency.
            Respond ONLY with a valid JSON object:
            {
              "transcription": "...",
              "serviceType": "electrician" | "plumber" | "AC mechanic" | "painter" | "mason" | "appliance repair" | "carpenter" | "car mechanic" | "cleaner" | "cctv installer" | "solar technician",
              "urgency": "Normal" | "Medium" | "High",
              "safetyWarning": "...",
              "checklist": ["...", "...", "..."]
            }
          `;
          const voiceResult = await callAI([{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }]);
          if (voiceResult?.transcription) {
            finalDescription = voiceResult.transcription + (description ? `\n(Text description: ${description})` : '');
            if (!serviceType || serviceType === 'appliance repair') finalServiceType = voiceResult.serviceType;
            if (!isEmergency) finalUrgency = voiceResult.urgency;
            finalAiDiagnosis = {
              success: true, serviceType: finalServiceType, urgency: finalUrgency, confidence: 0.95,
              diagnosis: `Audio Transcription: "${voiceResult.transcription}"`,
              partsRequired: ['Standard inspection kit'], priceRange: '1,000 - 2,500 PKR',
              aiSummary: voiceResult.transcription,
              safetyWarning: voiceResult.safetyWarning || 'No immediate safety hazard. Standard caution recommended.',
              checklist: voiceResult.checklist?.length > 0 ? voiceResult.checklist : ['Inspect components.', 'Verify issue on-site.', 'Perform standard repairs.']
            };
          }
        } catch (err) {
          console.error('[Socket] Voice note transcription failed:', err.message);
        }
      }

      if (!finalAiDiagnosis) {
        finalAiDiagnosis = {
          success: false, serviceType: finalServiceType, urgency: finalUrgency, confidence: 0.70,
          diagnosis: `Standard request for ${finalServiceType} service.`,
          partsRequired: ['Standard diagnostic tools'], priceRange: '1,000 - 2,500 PKR',
          aiSummary: finalDescription || `Booking request for ${finalServiceType}.`,
          safetyWarning: finalUrgency === 'High' ? 'Safety recommendation: Caution is advised.' : 'No immediate safety hazard. Standard caution recommended.',
          checklist: [`Verify: "${(finalDescription || '').substring(0, 30)}..."`, 'Check connections', 'Restore and test']
        };
      }

      try {
        // Create request in MongoDB
        const newRequest = await Request.create({
          customerId,
          serviceType: finalServiceType,
          description: finalDescription,
          status: 'pending',
          location: { type: 'Point', coordinates: coordinates || [0, 0] },
          providerId: null,
          aiDiagnosis: finalAiDiagnosis,
          isEmergency: isEmergency || false,
          urgency: finalUrgency,
          price: 0
        });

        const customer = await User.findById(customerId).catch(() => null);
        const requestData = {
          ...newRequest.toObject(),
          id: newRequest._id.toString(),
          customerName: customer?.name || 'Emergency Customer',
          customerPhone: customer?.phone || '',
          customerProfilePic: customer?.profilePic || null
        };

        // Find nearby available providers
        let nearbyProviders = [];
        const radiusMeters = (sosMatchRadius || (isEmergency ? 15 : 10)) * 1000;
        const allAvailable = await Provider.find({ isAvailable: true });

        if (coordinates) {
          // Filter by service type first
          let filtered = allAvailable.filter(p => !serviceType || p.serviceType.includes(serviceType));
          nearbyProviders = filterByRadius(filtered, coordinates, radiusMeters);

          // If none found, try all service types
          if (nearbyProviders.length === 0) {
            nearbyProviders = filterByRadius(allAvailable, coordinates, radiusMeters);
          }
        } else {
          nearbyProviders = allAvailable;
        }

        console.log(`Found ${nearbyProviders.length} matching providers nearby.`);

        let sentCount = 0;
        nearbyProviders.forEach(provider => {
          const providerSocketId = userSockets.get(provider.userId);
          if (providerSocketId) {
            io.to(providerSocketId).emit('request:incoming', requestData);
            sentCount++;
          }
        });

        socket.emit('request:created', { request: requestData, sentToCount: sentCount });

        // Check for simulated provider to auto-accept
        const simProvider = nearbyProviders.find(p => p.userId?.includes('sim'));
        if (simProvider) {
          setTimeout(async () => {
            try {
              const req = await Request.findById(newRequest._id);
              if (req?.status === 'pending') {
                console.log(`[Simulation] Auto-accepting request ${req._id}`);
                const updatedRequest = await Request.findByIdAndUpdate(req._id, {
                  status: 'accepted',
                  providerId: simProvider._id.toString()
                }, { new: true });
                await Provider.findByIdAndUpdate(simProvider._id, { isAvailable: false });

                const providerUser = await User.findById(simProvider.userId).catch(() => null);
                const matchDetails = {
                  request: { ...updatedRequest.toObject(), id: updatedRequest._id.toString() },
                  provider: {
                    id: simProvider._id.toString(),
                    name: providerUser?.name || 'Simulated Partner',
                    phone: providerUser?.phone || '0300-1234567',
                    serviceType: simProvider.serviceType,
                    coordinates: simProvider.location?.coordinates,
                    profilePic: providerUser?.profilePic || null
                  }
                };

                const customerSocketId = userSockets.get(req.customerId);
                if (customerSocketId) io.to(customerSocketId).emit('request:matched', matchDetails);
                io.emit('providers:update', (await Provider.find({ isAvailable: true })).map(p => ({ ...p.toObject(), id: p._id.toString() })));
              }
            } catch (err) {
              console.error('[Socket] Simulation auto-accept error:', err.message);
            }
          }, 3000);
        }
      } catch (err) {
        console.error('[Socket] Error creating request:', err.message);
        socket.emit('request:error', { message: 'Failed to create request. Please try again.' });
      }
    });

    // Provider responding to a request (accept / reject)
    socket.on('request:respond', async ({ requestId, providerId, action }) => {
      console.log(`Provider ${providerId} responded with action: ${action} to request ${requestId}`);
      
      try {
        const request = await Request.findById(requestId);
        if (!request) {
          socket.emit('request:error', { message: 'Request not found' });
          return;
        }

        if (request.status !== 'pending' && action === 'accept') {
          socket.emit('request:error', { message: 'This request has already been accepted by another provider.' });
          return;
        }

        if (action === 'accept') {
          const updatedRequest = await Request.findByIdAndUpdate(requestId, {
            status: 'accepted',
            providerId: providerId
          }, { new: true });

          await Provider.findByIdAndUpdate(providerId, { isAvailable: false });

          const providerProfile = await Provider.findById(providerId);
          const providerUser = providerProfile ? await User.findById(providerProfile.userId).catch(() => null) : null;

          const matchDetails = {
            request: { ...updatedRequest.toObject(), id: updatedRequest._id.toString() },
            provider: {
              id: providerId,
              name: providerUser?.name || 'Service Partner',
              phone: providerUser?.phone || '',
              serviceType: providerProfile?.serviceType || [],
              coordinates: providerProfile?.location?.coordinates,
              profilePic: providerUser?.profilePic || null
            }
          };

          const customerSocketId = userSockets.get(request.customerId);
          if (customerSocketId) io.to(customerSocketId).emit('request:matched', matchDetails);
          socket.emit('request:confirmed', matchDetails);

          const allActiveProviders = await Provider.find({ isAvailable: true });
          io.emit('providers:update', allActiveProviders.map(p => ({ ...p.toObject(), id: p._id.toString() })));
        } else {
          console.log(`Provider ${providerId} rejected request ${requestId}`);
        }
      } catch (err) {
        console.error('[Socket] Error responding to request:', err.message);
      }
    });

    // Chat messaging
    socket.on('chat:send_message', async ({ requestId, senderId, text }) => {
      try {
        const request = await Request.findById(requestId);
        if (!request) return;

        const message = { senderId, text, timestamp: new Date().toISOString() };
        const messages = request.messages || [];
        messages.push(message);
        await Request.findByIdAndUpdate(requestId, { messages });

        let receiverId = null;
        if (senderId === request.customerId) {
          const providerProfile = await Provider.findById(request.providerId).catch(() => null);
          receiverId = providerProfile?.userId;
        } else {
          receiverId = request.customerId;
        }

        if (receiverId) {
          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) io.to(receiverSocketId).emit('chat:receive_message', { ...message, requestId });
        }

        // Simulated provider auto-reply
        if (senderId === request.customerId && request.providerId) {
          const simProv = await Provider.findById(request.providerId).catch(() => null);
          if (simProv?.userId?.includes('sim')) {
            setTimeout(async () => {
              const mockReplies = [
                "Bilkul, main raste mein hoon aur jaldi pahunch raha hoon.",
                "Main GPS location follow kar raha hoon, bas 5 minute mein pahunch jaunga.",
                "Ji main aa raha hoon, kindly exact house number share kar dein.",
                "Ghabraen nahi, main emergency equipment ke sath aa raha hoon.",
                "Main location par bas pahunchne wala hoon."
              ];
              const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
              const replyMessage = { senderId: request.providerId, text: randomReply, timestamp: new Date().toISOString() };
              try {
                const currentRequest = await Request.findById(requestId);
                if (currentRequest) {
                  const updatedMessages = currentRequest.messages || [];
                  updatedMessages.push(replyMessage);
                  await Request.findByIdAndUpdate(requestId, { messages: updatedMessages });
                }
              } catch (e) { /* ignore */ }
              socket.emit('chat:receive_message', { ...replyMessage, requestId });
            }, 2000);
          }
        }
      } catch (err) {
        console.error('[Socket] Error sending chat message:', err.message);
      }
    });

    // Live Bidding Price Proposal
    socket.on('request:propose_price', async ({ requestId, proposedPrice, proposedBy }) => {
      console.log(`Price proposed for request ${requestId}: ${proposedPrice} PKR by ${proposedBy}`);
      
      try {
        const req = await Request.findById(requestId);
        if (!req) return;

        const negotiation = { proposedPrice: Number(proposedPrice), proposedBy, status: 'pending' };
        await Request.findByIdAndUpdate(requestId, { negotiation });

        let targetUserId = null;
        if (proposedBy === 'provider') {
          targetUserId = req.customerId;
        } else if (req.providerId) {
          const providerProfile = await Provider.findById(req.providerId).catch(() => null);
          targetUserId = providerProfile?.userId;
        }

        if (targetUserId) {
          const targetSocketId = userSockets.get(targetUserId);
          if (targetSocketId) io.to(targetSocketId).emit('request:price_proposed', { requestId, negotiation });
        }

        // Fallback price analysis (no Gemini needed)
        setTimeout(async () => {
          try {
            const priceRangeStr = req.aiDiagnosis?.priceRange || '1,000 - 2,500 PKR';
            const match = priceRangeStr.replace(/,/g, '').match(/\b\d+\b/g);
            let min = 1000, max = 2500;
            if (match?.length >= 2) { min = Number(match[0]); max = Number(match[1]); }
            
            let status = 'fair';
            let advice = 'Rate matches standard market average for this service.';
            const proposed = Number(proposedPrice);
            if (proposed > max * 1.1) { status = 'high'; advice = `Rate is a bit high. Standard average is ${priceRangeStr}.`; }
            else if (proposed < min * 0.9) { status = 'low'; advice = 'Rate is very low and competitive. Recommended to accept.'; }

            const updatedReq = await Request.findById(requestId);
            if (updatedReq) {
              const updatedNegotiation = { ...updatedReq.negotiation?.toObject?.() || updatedReq.negotiation, copilotAnalysis: { status, advice } };
              await Request.findByIdAndUpdate(requestId, { negotiation: updatedNegotiation });

              const customerSocketId = userSockets.get(updatedReq.customerId);
              if (customerSocketId) io.to(customerSocketId).emit('request:copilot_analysis', { requestId, copilotAnalysis: { status, advice } });

              if (updatedReq.providerId) {
                const provProfile = await Provider.findById(updatedReq.providerId).catch(() => null);
                if (provProfile) {
                  const providerSocketId = userSockets.get(provProfile.userId);
                  if (providerSocketId) io.to(providerSocketId).emit('request:copilot_analysis', { requestId, copilotAnalysis: { status, advice } });
                }
              }
            }
          } catch (e) { console.error('[Socket] Copilot analysis error:', e.message); }
        }, 1200);
      } catch (err) {
        console.error('[Socket] Error proposing price:', err.message);
      }
    });

    // Live Bidding Price Response
    socket.on('request:respond_price', async ({ requestId, action }) => {
      console.log(`Price response for request ${requestId}: ${action}`);
      try {
        const req = await Request.findById(requestId);
        if (!req) return;

        let negotiation = req.negotiation ? { ...req.negotiation } : {};
        let finalPrice = req.price || 0;
        if (action === 'accept') { negotiation.status = 'accepted'; finalPrice = negotiation.proposedPrice; }
        else { negotiation.status = 'rejected'; }

        await Request.findByIdAndUpdate(requestId, { negotiation, price: finalPrice });

        const customerSocketId = userSockets.get(req.customerId);
        if (customerSocketId) io.to(customerSocketId).emit('request:price_locked', { requestId, negotiation, price: finalPrice });

        if (req.providerId) {
          const providerProfile = await Provider.findById(req.providerId).catch(() => null);
          if (providerProfile) {
            const providerSocketId = userSockets.get(providerProfile.userId);
            if (providerSocketId) io.to(providerSocketId).emit('request:price_locked', { requestId, negotiation, price: finalPrice });
          }
        }
      } catch (err) {
        console.error('[Socket] Error responding to price:', err.message);
      }
    });

    // Parts Invoice Request
    socket.on('parts:request', async ({ requestId, parts }) => {
      console.log(`Parts requested for request ${requestId}:`, parts);
      try {
        const req = await Request.findById(requestId);
        if (!req) return;

        const newParts = parts.map(p => ({ name: p.name, price: Number(p.price), status: 'pending' }));
        const updatedPartsList = [...(req.partsList || []), ...newParts];
        await Request.findByIdAndUpdate(requestId, { partsList: updatedPartsList });

        const customerSocketId = userSockets.get(req.customerId);
        if (customerSocketId) io.to(customerSocketId).emit('parts:incoming', { requestId, partsList: updatedPartsList });
      } catch (err) {
        console.error('[Socket] Error requesting parts:', err.message);
      }
    });

    // Parts Invoice Response
    socket.on('parts:respond', async ({ requestId, action }) => {
      console.log(`Parts response for request ${requestId}: ${action}`);
      try {
        const req = await Request.findById(requestId);
        if (!req) return;

        const updatedPartsList = (req.partsList || []).map(p => {
          if (p.status === 'pending') return { ...p, status: action === 'approve' ? 'approved' : 'rejected' };
          return p;
        });

        const approvedPartsSum = updatedPartsList.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.price, 0);
        const newPrice = approvedPartsSum + (req.negotiation?.proposedPrice || req.price || 0);

        await Request.findByIdAndUpdate(requestId, { partsList: updatedPartsList, partsTotal: approvedPartsSum, price: newPrice });

        const update = { requestId, partsList: updatedPartsList, partsTotal: approvedPartsSum, price: newPrice };
        const customerSocketId = userSockets.get(req.customerId);
        if (customerSocketId) io.to(customerSocketId).emit('parts:updated', update);

        if (req.providerId) {
          const providerProfile = await Provider.findById(req.providerId).catch(() => null);
          if (providerProfile) {
            const providerSocketId = userSockets.get(providerProfile.userId);
            if (providerSocketId) io.to(providerSocketId).emit('parts:updated', update);
          }
        }
      } catch (err) {
        console.error('[Socket] Error responding to parts:', err.message);
      }
    });

    // End active job
    socket.on('request:complete', async ({ requestId, providerId }) => {
      console.log(`Completing job for request ${requestId}`);
      
      try {
        const request = await Request.findById(requestId);
        await Request.findByIdAndUpdate(requestId, { status: 'completed' });
        await Provider.findByIdAndUpdate(providerId, { isAvailable: true });

        const provider = await Provider.findById(providerId);
        if (provider) {
          const oldXp = provider.xp || 0;
          const oldLevel = provider.level || 1;
          const newXp = oldXp + 150;
          const newLevel = Math.floor(newXp / 500) + 1;
          
          let newBadge = provider.badge || 'Rookie';
          if (newLevel >= 7) newBadge = 'Golden Legend';
          else if (newLevel >= 4) newBadge = 'Silver Expert';
          else if (newLevel >= 2) newBadge = 'Bronze Pro';

          await Provider.findByIdAndUpdate(providerId, { xp: newXp, level: newLevel, badge: newBadge, totalJobs: (provider.totalJobs || 0) + 1 });

          const providerSocketId = userSockets.get(provider.userId);
          if (providerSocketId && newLevel > oldLevel) {
            io.to(providerSocketId).emit('provider:levelup', { level: newLevel, badge: newBadge, xp: newXp });
          }
          console.log(`Provider ${providerId} rewarded +150 XP. New XP: ${newXp}, Level: ${newLevel}, Badge: ${newBadge}`);
        }

        if (request) {
          const customerSocketId = userSockets.get(request.customerId);
          if (customerSocketId) io.to(customerSocketId).emit('request:completed', { requestId });
        }
        socket.emit('request:completed', { requestId });

        const allActiveProviders = await Provider.find({ isAvailable: true });
        io.emit('providers:update', allActiveProviders.map(p => ({ ...p.toObject(), id: p._id.toString() })));
      } catch (err) {
        console.error('[Socket] Error completing request:', err.message);
      }
    });

    // Cancel request/job
    socket.on('request:cancel', async ({ requestId, role }) => {
      console.log(`Request ${requestId} cancelled by ${role}`);
      try {
        const req = await Request.findById(requestId);
        if (req) {
          await Request.findByIdAndUpdate(requestId, { status: 'cancelled' });
          if (req.providerId) await Provider.findByIdAndUpdate(req.providerId, { isAvailable: true });

          const customerSocketId = userSockets.get(req.customerId);
          if (customerSocketId) io.to(customerSocketId).emit('request:cancelled', { requestId });

          if (req.providerId) {
            const providerProfile = await Provider.findById(req.providerId).catch(() => null);
            if (providerProfile) {
              const providerSocketId = userSockets.get(providerProfile.userId);
              if (providerSocketId) io.to(providerSocketId).emit('request:cancelled', { requestId });
            }
          }

          const allActiveProviders = await Provider.find({ isAvailable: true });
          io.emit('providers:update', allActiveProviders.map(p => ({ ...p.toObject(), id: p._id.toString() })));
        }
      } catch (err) {
        console.error('[Socket] Error cancelling request:', err.message);
      }
    });

    // Disconnection clean up
    socket.on('disconnect', async () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        console.log(`User ${userId} disconnected. Socket: ${socket.id}`);
        userSockets.delete(userId);
        socketUsers.delete(socket.id);

        try {
          const provider = await Provider.findOne({ userId });
          if (provider) {
            console.log(`Auto-toggling provider ${provider._id} offline due to socket disconnect.`);
            await Provider.findByIdAndUpdate(provider._id, { isAvailable: false });
            const allActiveProviders = await Provider.find({ isAvailable: true });
            io.emit('providers:update', allActiveProviders.map(p => ({ ...p.toObject(), id: p._id.toString() })));
          }
        } catch (err) {
          console.error('[Socket] Error on disconnect cleanup:', err.message);
        }
      } else {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });
};
