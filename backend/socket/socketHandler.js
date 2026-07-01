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
          io.to(receiverSocketId).emit('chat:receive_message', message);
        }
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
