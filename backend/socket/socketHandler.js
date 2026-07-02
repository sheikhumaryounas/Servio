import { db } from '../config/db.js';

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
    socket.on('request:create', ({ customerId, serviceType, description, coordinates, image, voiceAudio, aiDiagnosis, isEmergency, sosMatchRadius }) => {
      console.log(`New request from customer ${customerId} for ${serviceType}. Emergency: ${isEmergency}, Custom Radius: ${sosMatchRadius}`);
      
      // Create request in database
      const newRequest = db.requests.create({
        customerId,
        serviceType,
        description,
        status: 'pending',
        customerLocation: {
          type: 'Point',
          coordinates: coordinates // [lng, lat]
        },
        providerId: null,
        image: image || null,
        voiceAudio: voiceAudio || null,
        aiDiagnosis: aiDiagnosis || null,
        isEmergency: isEmergency || false,
        urgency: isEmergency ? 'High' : (aiDiagnosis?.urgency || 'Normal')
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

    // End active job
    socket.on('request:complete', ({ requestId, providerId }) => {
      console.log(`Completing job for request ${requestId}`);
      db.requests.findByIdAndUpdate(requestId, { status: 'completed' });
      
      // Make provider available again
      db.providers.findByIdAndUpdate(providerId, { isAvailable: true });

      const request = db.requests.findById(requestId);
      
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
