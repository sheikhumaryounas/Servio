import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Wrench, 
  Droplet, 
  Zap, 
  MapPin, 
  Phone, 
  Star, 
  Send, 
  LogOut, 
  User, 
  Play, 
  Pause, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Header from './components/Header';
import ProfileModal from './components/ProfileModal';
import CameraModal from './components/CameraModal';
import SimulationPanel from './components/SimulationPanel';

// --- CUSTOM MAP ICONS (Vite-compatible SVG pins) ---
const createCustomIcon = (color, svgPath, isPulse = false) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
        ${isPulse ? `
          <div style="
            position: absolute;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background-color: ${color};
            opacity: 0.3;
            animation: ${color.includes('346') ? 'pulse-red' : 'pulse-green'} 2s infinite ease-in-out;
          "></div>
        ` : ''}
        <div style="
          position: relative;
          z-index: 10;
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          color: white;
        ">
          ${svgPath}
        </div>
      </div>
    `,
    className: 'custom-map-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

const icons = {
  customer: createCustomIcon('hsl(217, 91%, 60%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'),
  electrician: createCustomIcon('hsl(45, 100%, 50%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', true),
  plumber: createCustomIcon('hsl(197, 90%, 50%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>', true),
  'AC mechanic': createCustomIcon('hsl(180, 100%, 45%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/></svg>', true),
  painter: createCustomIcon('hsl(280, 80%, 60%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14 6-4-4L4 8v4h4l6-6z"/><path d="m18 10-4-4L6 14v4h4l8-8z"/><path d="M12 21h9"/></svg>', true),
  mason: createCustomIcon('hsl(20, 60%, 50%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="15" y1="3" x2="15" y2="9"/><line x1="15" y1="15" x2="15" y2="21"/><line x1="9" y1="3" x2="9" y2="9"/><line x1="9" y1="15" x2="9" y2="21"/></svg>', true),
  'appliance repair': createCustomIcon('hsl(320, 70%, 50%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="9" x2="12" y2="15"/></svg>', true),
  carpenter: createCustomIcon('hsl(28, 75%, 45%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6h-4Z"/></svg>', true),
  'car mechanic': createCustomIcon('hsl(0, 75%, 50%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>', true),
  cleaner: createCustomIcon('hsl(160, 60%, 45%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3 6 15"/><path d="M9 12a3 3 0 0 0-3-3h12a3 3 0 0 0-3 3Z"/><path d="M14 14a3 3 0 0 1-3 3H3a3 3 0 0 1 3-3h8Z"/></svg>', true),
  'cctv installer': createCustomIcon('hsl(200, 70%, 45%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>', true),
  'solar technician': createCustomIcon('hsl(40, 95%, 45%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4 12H2"/><path d="M22 12h-2"/><path d="m19.07 4.93-1.41 1.41"/><path d="m7.76 16.24-1.41 1.41"/><path d="m5.24 6.34 1.41-1.41"/><path d="m16.24 17.76 1.41-1.41"/></svg>', true),
  emergency: createCustomIcon('hsl(346, 84%, 61%)', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', true)
};

// Map helper to handle fly-to centering transitions
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

function MainApp({ theme, setTheme }) {
  const { user, providerProfile, logout, updateProviderProfile } = useAuth();
  const socket = useSocket();

  // Coordinates state: Default to Karachi center (Gulshan/Johar area)
  const [customerLocation, setCustomerLocation] = useState([24.9012, 67.0782]);
  const [providerLocation, setProviderLocation] = useState([24.8988, 67.0725]);
  const [mapCenter, setMapCenter] = useState([24.9012, 67.0782]);
  const [mapZoom, setMapZoom] = useState(14);

  const PAKISTAN_CITIES = [
    { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
    { name: 'Rawalpindi', lat: 33.5984, lng: 73.0441 },
    { name: 'Faisalabad', lat: 31.4504, lng: 73.1350 },
    { name: 'Multan', lat: 30.1575, lng: 71.5249 },
    { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
    { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
    { name: 'Sialkot', lat: 32.4972, lng: 74.5361 },
    { name: 'Gujranwala', lat: 32.1877, lng: 74.1945 }
  ];

  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [locationStatus, setLocationStatus] = useState('');

  const updateLocation = (newLat, newLng, statusMsg = '') => {
    if (activeTab === 'customer') {
      setCustomerLocation([newLat, newLng]);
      setMapCenter([newLat, newLng]);
    } else {
      setProviderLocation([newLat, newLng]);
      setMapCenter([newLat, newLng]);
      if (providerProfile && socket) {
        socket.emit('provider:location_update', {
          providerId: providerProfile.id,
          coordinates: [newLng, newLat]
        });
      }
    }
    if (statusMsg) {
      setLocationStatus(statusMsg);
    } else {
      setLocationStatus(`Coords: ${newLat.toFixed(4)}, ${newLng.toFixed(4)}`);
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    const cityObj = PAKISTAN_CITIES.find(c => c.name === cityName);
    if (cityObj) {
      updateLocation(cityObj.lat, cityObj.lng, `Centered on ${cityName}`);
      setMapZoom(13);
    }
  };

  const handleGetCurrentLocation = () => {
    setLocationStatus('Accessing device GPS...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedCity('');
          updateLocation(latitude, longitude, 'Precise location obtained via GPS');
          setMapZoom(16);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          let errorMsg = 'Could not access location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied by user/browser.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          setLocationStatus(errorMsg);
          alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('GPS Geolocation is not supported by your browser.');
      alert('GPS Geolocation is not supported by your browser.');
    }
  };

  // General state
  const [activeTab, setActiveTab] = useState('customer'); // For demo, can switch roles instantly!
  const [providersList, setProvidersList] = useState([]);
  
  // Customer specific states
  const [requestDescription, setRequestDescription] = useState('');
  const [selectedService, setSelectedService] = useState('AC mechanic');
  const [requestImage, setRequestImage] = useState(null);
  const [parsedCategory, setParsedCategory] = useState(null);
  const [parsedUrgency, setParsedUrgency] = useState('Normal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [requestState, setRequestState] = useState('idle'); // idle | searching | matched | completed
  const [activeRequest, setActiveRequest] = useState(null);
  const [matchedProvider, setMatchedProvider] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please upload an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRequestImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Profile settings states
  const { updateUserProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editProfilePic, setEditProfilePic] = useState(user?.profilePic || null);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [profileCameraActive, setProfileCameraActive] = useState(false);

  // Sync edits when user details change
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditProfilePic(user.profilePic || null);
    }
  }, [user]);

  const startCamera = async () => {
    setIsCameraActive(true);
    // Wait a brief tick for the video element ref to bind to DOM
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } // Use user facing camera for profile, environment for issue
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please check permissions or select a file instead.");
        setIsCameraActive(false);
        setProfileCameraActive(false);
      }
    }, 100);
  };

  const startProfileCamera = () => {
    setProfileCameraActive(true);
    startCamera();
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (profileCameraActive) {
        setEditProfilePic(dataUrl);
      } else {
        setRequestImage(dataUrl);
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setProfileCameraActive(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please upload an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      alert("Name and Phone are required.");
      return;
    }
    setIsEditSaving(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/update-profile', {
        userId: user.id,
        name: editName,
        phone: editPhone,
        profilePic: editProfilePic
      });
      updateUserProfile(res.data.user);
      setIsProfileModalOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update profile settings.");
    } finally {
      setIsEditSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Provider specific states
  const [isAvailable, setIsAvailable] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [countdown, setCountdown] = useState(30);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const chatEndRef = useRef(null);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProviders, setSimulatedProviders] = useState([]);
  const simulationIntervalRef = useRef(null);

  // Sync active roles based on auth user
  useEffect(() => {
    if (user) {
      setActiveTab(user.role);
      if (user.role === 'provider' && providerProfile) {
        setIsAvailable(providerProfile.isAvailable);
        if (providerProfile.location?.coordinates) {
          const [lng, lat] = providerProfile.location.coordinates;
          setProviderLocation([lat, lng]);
          setMapCenter([lat, lng]);
        }
      }
    }
  }, [user, providerProfile]);

  // Sync active jobs on initial load
  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:5000/api/requests/active-job/${user.id}`)
        .then(res => {
          if (res.data.job) {
            const job = res.data.job;
            if (user.role === 'customer') {
              setActiveRequest(job);
              if (job.status === 'pending') {
                setRequestState('searching');
              } else if (job.status === 'accepted') {
                setRequestState('matched');
                setMatchedProvider(job.provider);
                setChatMessages(job.messages || []);
              }
            } else {
              // Provider role
              setActiveJob(job);
              setChatMessages(job.messages || []);
            }
          }
        })
        .catch(err => console.error('Error fetching active job status:', err));
    }
  }, [user]);

  // Real-time Socket.io listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for available providers updates
    socket.on('providers:list', (list) => {
      setProvidersList(list);
    });

    socket.on('providers:update', (list) => {
      setProvidersList(list);
    });

    // Customer receives notification when a provider accepts
    socket.on('request:matched', (details) => {
      setActiveRequest(details.request);
      setMatchedProvider(details.provider);
      setRequestState('matched');
      setChatMessages(details.request.messages || []);
      
      // Focus map on provider
      if (details.provider.coordinates) {
        const [lng, lat] = details.provider.coordinates;
        setMapCenter([lat, lng]);
        setMapZoom(15);
      }
    });

    // Provider receives an incoming request alert
    socket.on('request:incoming', (request) => {
      if (user?.role === 'provider' && isAvailable && !activeJob) {
        setIncomingRequest(request);
        setCountdown(30);
      }
    });

    // Provider gets match confirmation
    socket.on('request:confirmed', (details) => {
      setActiveJob(details.request);
      setIncomingRequest(null);
      setChatMessages(details.request.messages || []);
    });

    // Receive chat message
    socket.on('chat:receive_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Job completed
    socket.on('request:completed', () => {
      if (user?.role === 'customer') {
        setRequestState('completed');
        setActiveRequest(null);
        setMatchedProvider(null);
        setRequestDescription('');
        setRequestImage(null);
      } else {
        setActiveJob(null);
        setIncomingRequest(null);
      }
      setChatMessages([]);
    });

    socket.on('request:error', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('providers:list');
      socket.off('providers:update');
      socket.off('request:matched');
      socket.off('request:incoming');
      socket.off('request:confirmed');
      socket.off('chat:receive_message');
      socket.off('request:completed');
      socket.off('request:error');
    };
  }, [socket, user, isAvailable, activeJob]);

  // Chat auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Live incoming request countdown timer
  useEffect(() => {
    let timer;
    if (incomingRequest && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && incomingRequest) {
      setIncomingRequest(null); // Auto decay request
    }
    return () => clearTimeout(timer);
  }, [incomingRequest, countdown]);

  // Smart Parser typing handler
  const typingTimeoutRef = useRef(null);
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setRequestDescription(text);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (!text.trim()) {
      setParsedCategory(null);
      return;
    }

    setIsAnalyzing(true);
    typingTimeoutRef.current = setTimeout(() => {
      axios.post('http://localhost:5000/api/requests/analyze', { description: text })
        .then(res => {
          setParsedCategory(res.data.serviceType);
          setParsedUrgency(res.data.urgency);
          setSelectedService(res.data.serviceType);
          setIsAnalyzing(false);
        })
        .catch(err => {
          console.error(err);
          setIsAnalyzing(false);
        });
    }, 800);
  };

  // Toggle Provider Availability
  const handleAvailabilityToggle = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (providerProfile) {
      const updated = { ...providerProfile, isAvailable: nextVal };
      updateProviderProfile(updated);
    }
    socket.emit('provider:toggle_status', {
      providerId: providerProfile?.id,
      isAvailable: nextVal,
      coordinates: [providerLocation[1], providerLocation[0]] // [lng, lat]
    });
  };

  // Send request (Customer side)
  const handleSendRequest = () => {
    if (!requestDescription.trim()) return;
    setRequestState('searching');
    socket.emit('request:create', {
      customerId: user.id,
      serviceType: selectedService,
      description: requestDescription,
      coordinates: [customerLocation[1], customerLocation[0]], // [lng, lat]
      image: requestImage
    });
  };

  // Accept request (Provider side)
  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    socket.emit('request:respond', {
      requestId: incomingRequest.id,
      providerId: providerProfile.id,
      action: 'accept'
    });
  };

  // Decline request (Provider side)
  const handleDeclineRequest = () => {
    setIncomingRequest(null);
  };

  // Send chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const reqId = user.role === 'customer' ? activeRequest?.id : activeJob?.id;
    if (!reqId) return;

    const payload = {
      requestId: reqId,
      senderId: user.id,
      text: messageText
    };

    socket.emit('chat:send_message', payload);
    setChatMessages(prev => [...prev, {
      senderId: user.id,
      text: messageText,
      timestamp: new Date().toISOString()
    }]);
    setMessageText('');
  };

  // Mark job as completed
  const handleCompleteJob = () => {
    const reqId = user.role === 'customer' ? activeRequest?.id : activeJob?.id;
    const provId = user.role === 'customer' ? matchedProvider?.id : providerProfile?.id;
    socket.emit('request:complete', {
      requestId: reqId,
      providerId: provId
    });
  };

  // --- SIMULATION LOGIC ---
  const handleStartSimulation = () => {
    if (isSimulating) {
      // Stop simulation
      setIsSimulating(false);
      clearInterval(simulationIntervalRef.current);
      setSimulatedProviders([]);
      return;
    }

    setIsSimulating(true);

    // Create 11 mock providers around Karachi center coordinates representing all trades
    const mockServices = [
      'electrician', 'plumber', 'AC mechanic', 'painter', 'mason', 
      'appliance repair', 'carpenter', 'car mechanic', 'cleaner', 
      'cctv installer', 'solar technician'
    ];
    const mockNames = [
      'Aslam Electrician', 'Kamran Plumber', 'Sajid AC Expert', 'Zafar Painter',
      'Bilal Masonry', 'Tariq Fridge Repair', 'Jamil Woodworks', 'Noman Car Mechanic',
      'Saad Cleaners', 'Hassan CCTV Security', 'Raza Solar Solutions'
    ];
    const mockPhones = [
      '0300-1234567', '0321-9876543', '0333-5556667', '0345-4443322',
      '0312-7778899', '0336-1122334', '0301-4455667', '0322-8899001',
      '0344-9988776', '0315-6677889', '0323-5544332'
    ];

    const items = Array.from({ length: mockServices.length }).map((_, idx) => {
      const angle = (idx * Math.PI) / 2; // Distribute in directions
      const offsetLat = 0.008 * Math.sin(angle) + (Math.random() - 0.5) * 0.003;
      const offsetLng = 0.008 * Math.cos(angle) + (Math.random() - 0.5) * 0.003;
      const targetLat = customerLocation[0] + offsetLat;
      const targetLng = customerLocation[1] + offsetLng;

      return {
        id: `sim-prov-${idx}`,
        userId: `sim-user-${idx}`,
        name: mockNames[idx],
        phone: mockPhones[idx],
        serviceType: [mockServices[idx % mockServices.length]],
        location: {
          type: 'Point',
          coordinates: [targetLng, targetLat]
        },
        rating: (4.2 + Math.random() * 0.7).toFixed(1),
        isAvailable: true,
        totalJobs: Math.floor(Math.random() * 50)
      };
    });

    setSimulatedProviders(items);

    // Set interval to simulate movement
    simulationIntervalRef.current = setInterval(() => {
      setSimulatedProviders(prev => {
        const updated = prev.map((p, idx) => {
          // Drifts slowly towards customer coordinates to simulate vehicle approaching
          const deltaLat = (customerLocation[0] - p.location.coordinates[1]) * 0.05 + (Math.random() - 0.5) * 0.001;
          const deltaLng = (customerLocation[1] - p.location.coordinates[0]) * 0.05 + (Math.random() - 0.5) * 0.001;

          const newLat = p.location.coordinates[1] + deltaLat;
          const newLng = p.location.coordinates[0] + deltaLng;

          return {
            ...p,
            location: {
              ...p.location,
              coordinates: [newLng, newLat]
            }
          };
        });

        return updated;
      });
    }, 2500);
  };

  useEffect(() => {
    return () => clearInterval(simulationIntervalRef.current);
  }, []);

  // Combine real database active providers with simulated ones
  const displayedProviders = [...providersList, ...simulatedProviders];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Camera Live Capture Modal Overlay */}
      <CameraModal 
        isOpen={isCameraActive} 
        onClose={stopCamera} 
        videoRef={videoRef} 
        capturePhoto={capturePhoto} 
        title={profileCameraActive ? "📷 Capture Profile Photo" : "📷 Capture Issue Photo"} 
      />

      {/* Edit Profile Modal Overlay */}
      {/* Edit Profile Modal Overlay */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        editName={editName}
        setEditName={setEditName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editProfilePic={editProfilePic}
        setEditProfilePic={setEditProfilePic}
        handleProfileImageChange={handleProfileImageChange}
        startProfileCamera={startProfileCamera}
        handleSaveProfile={handleSaveProfile}
        isEditSaving={isEditSaving}
      />

      {/* --- PREMIUM NAVBAR --- */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        setIsProfileModalOpen={setIsProfileModalOpen}
        logout={logout}
      />

      {/* --- DASHBOARD & MAP LAYOUT --- */}
      <main className="app-layout">
        
        {/* --- LEFT HAND SIDE: CONTROLLER & ACTIONS --- */}
        <section className="glass sidebar-section">
          
          {/* ========================================================= */}
          {/* ================= LOCATION SELECTOR SECTION ============== */}
          {/* ========================================================= */}
          <div className="glass" style={{ 
            padding: '14px', 
            borderRadius: '10px', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)', 
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} className="text-green-400" />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Set Your Current Location</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '4px' }}>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                style={{ 
                  padding: '8px 10px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose custom coordinates...</option>
                {PAKISTAN_CITIES.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="glass"
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-primary-glow)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background-color 0.2s'
                }}
              >
                📍 GPS Location
              </button>
            </div>
            {locationStatus && (
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--color-primary)', 
                marginTop: '4px',
                fontWeight: '500',
                display: 'block'
              }}>
                {locationStatus}
              </span>
            )}
          </div>
          
          {/* ========================================================= */}
          {/* ================= CUSTOMER SIDEBOARD =================== */}
          {/* ========================================================= */}
          {activeTab === 'customer' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {requestState === 'idle' && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Need an Emergency Fix? 🛠️</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Describe what went wrong in plain Urdu/English. Our AI maps the urgency.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Describe your emergency</label>
                      <textarea
                        value={requestDescription}
                        onChange={handleDescriptionChange}
                        placeholder="e.g. AC se cooling nahi ho rhi aur ajeeb awaz aa rhi hai..."
                        rows={3}
                        style={{ resize: 'none' }}
                      />
                    </div>

                    {/* Image Upload Option */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Attach Photo of the Issue (Optional)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {/* Option 1: File Choose */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="issue-image-upload"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="issue-image-upload"
                          className="glass"
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}
                        >
                          📁 Choose File
                        </label>

                        {/* Option 2: Live Camera Capture */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="glass"
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}
                        >
                          📷 Take Photo
                        </button>

                        {requestImage && (
                          <button
                            type="button"
                            onClick={() => setRequestImage(null)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'var(--color-danger)',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {requestImage && (
                        <div style={{ 
                          marginTop: '8px', 
                          position: 'relative', 
                          width: '120px', 
                          height: '90px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <img src={requestImage} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    {/* Smart Analyzer UI */}
                    {requestDescription && (
                      <div className="glass" style={{
                        padding: '12px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: parsedUrgency === 'High' ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>AI PARSING PREVIEW</span>
                          {isAnalyzing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              backgroundColor: parsedUrgency === 'High' ? 'var(--color-danger)' : 'var(--color-secondary)',
                              color: 'white'
                            }}>{parsedUrgency} Urgency</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          {parsedCategory === 'electrician' && <Zap size={16} className="text-yellow-400" />}
                          {parsedCategory === 'plumber' && <Droplet size={16} className="text-blue-400" />}
                          {parsedCategory === 'AC mechanic' && <Wrench size={16} className="text-cyan-400" />}
                          {parsedCategory && !['electrician', 'plumber', 'AC mechanic'].includes(parsedCategory) && <Wrench size={16} />}
                          <span style={{ fontSize: '14px', textTransform: 'capitalize', fontWeight: '600' }}>
                            {parsedCategory ? `${parsedCategory} Required` : 'Analyzing text...'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Service Category</label>
                      <select 
                        value={selectedService} 
                        onChange={(e) => setSelectedService(e.target.value)}
                      >
                        <option value="AC mechanic">AC Mechanic</option>
                        <option value="electrician">Electrician</option>
                        <option value="plumber">Plumber</option>
                        <option value="painter">Painter</option>
                        <option value="mason">Mason/Tile work</option>
                        <option value="appliance repair">Appliance Repair</option>
                        <option value="carpenter">Carpenter</option>
                        <option value="car mechanic">Car Mechanic (Mobile)</option>
                        <option value="cleaner">Home Cleaning</option>
                        <option value="cctv installer">CCTV Installer</option>
                        <option value="solar technician">Solar Panel Tech</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleSendRequest}
                      disabled={!requestDescription.trim()}
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        opacity: requestDescription.trim() ? 1 : 0.6
                      }}
                    >
                      Find Available Now
                    </button>
                  </div>

                  <div className="glass" style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px' }}>
                    <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>Available Nearby Now</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {displayedProviders.filter(p => p.serviceType.includes(selectedService)).length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No live {selectedService}s around. Try simulation!</p>
                      ) : (
                        displayedProviders.filter(p => p.serviceType.includes(selectedService)).map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>{p.name}</span>
                            <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></span>
                              Available
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* SEARCHING LOADER PANEL */}
              {requestState === 'searching' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="live-pulse" style={{ width: '80px', height: '80px', position: 'absolute', top: -10, left: -10, opacity: 0.3 }}></div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed var(--color-secondary)'
                    }}>
                      <Loader2 size={24} className="animate-spin text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Searching Online Responders...</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Sending ping to available {selectedService}s within 5km radius.
                    </p>
                  </div>
                  {requestImage && (
                    <div style={{ marginTop: '4px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100px', height: '100px', boxShadow: 'var(--shadow-sm)' }}>
                      <img src={requestImage} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <button 
                    onClick={() => { setRequestState('idle'); setRequestImage(null); }}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-danger)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >Cancel Request</button>
                </div>
              )}

              {/* MATCHED CONCIERGE PANEL */}
              {requestState === 'matched' && matchedProvider && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="glass-glow-green" style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px' }}>Provider Accepted!</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Heading to your coordinates.</p>
                    </div>
                  </div>

                  {/* Provider Info Card */}
                  <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {matchedProvider.profilePic ? (
                          <img 
                            src={matchedProvider.profilePic} 
                            alt="Provider" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>👤</div>
                        )}
                        <div>
                          <h3 style={{ fontSize: '16px' }}>{matchedProvider.name}</h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedService}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                        <Star size={12} fill="amber" className="text-yellow-400" />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{matchedProvider.rating || '4.8'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} className="text-blue-400" />
                        <span>{matchedProvider.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} className="text-green-400" />
                        <span>Distance: Approaching...</span>
                      </div>
                    </div>
                  </div>

                  {/* Issue Photo preview if uploaded */}
                  {activeRequest?.image && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>ATTACHED ISSUE PHOTO</span>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '140px' }}>
                        <img src={activeRequest.image} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(activeRequest.image, '_blank')} />
                      </div>
                    </div>
                  )}

                  {/* Real-time chat box */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MessageSquare size={14} />
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>IN-APP CHAT</span>
                    </div>
                    
                    <div style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      overflowY: 'auto',
                      marginBottom: '8px',
                      maxHeight: '250px'
                    }}>
                      {chatMessages.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Ask details, share exact street number here.</p>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              maxWidth: '80%',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              backgroundColor: msg.senderId === user.id ? 'var(--color-secondary)' : 'var(--bg-card-hover)',
                              color: 'white'
                            }}>
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={messageText} 
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message..."
                        style={{ flex: 1 }}
                      />
                      <button type="submit" style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px'
                      }}>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>

                  <button 
                    onClick={handleCompleteJob}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'var(--color-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 'bold',
                      marginTop: '16px'
                    }}
                  >Job Finished / Close Session</button>
                </div>
              )}

              {/* COMPLETED FEEDBACK SCREEN */}
              {requestState === 'completed' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-glow)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Job Completed successfully!</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thank you for using Abhi Kaun Free Hai.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '20px', cursor: 'pointer' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={24} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <button 
                    onClick={() => setRequestState('idle')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'var(--color-secondary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >Go Back</button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ================= PROVIDER SIDEBOARD =================== */}
          {/* ========================================================= */}
          {activeTab === 'provider' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Profile card & Status controller */}
              <div className="glass" style={{ padding: '16px', marginBottom: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px' }}>{user?.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {providerProfile?.serviceType?.join(', ') || 'Service Partner'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Duty Status</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: isAvailable ? 'var(--color-primary)' : 'var(--text-muted)'
                    }}>{isAvailable ? 'AVAILABLE NOW' : 'OFFLINE'}</span>
                    
                    {/* Toggle Button */}
                    <button 
                      onClick={handleAvailabilityToggle}
                      style={{
                        width: '46px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: isAvailable ? 'var(--color-primary)' : 'var(--border-color)',
                        position: 'relative',
                        border: 'none',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: isAvailable ? '25px' : '3px',
                        transition: '0.2s'
                      }}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Offline warning */}
              {!isAvailable && !activeJob && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', gap: '14px' }}>
                  <AlertTriangle size={36} className="text-yellow-400" />
                  <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>You are Offline</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Toggle "Duty Status" above to make yourself visible on customer map and receive incoming jobs.
                    </p>
                  </div>
                </div>
              )}

              {/* Waiting for incoming request view */}
              {isAvailable && !incomingRequest && !activeJob && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', gap: '18px' }}>
                  <div className="live-pulse" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '50%' }}></div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Waiting for Emergency Requests...</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Keep the screen active. We will notify you instantly when someone matches.
                    </p>
                  </div>
                </div>
              )}

              {/* Incoming matching alert card */}
              {incomingRequest && !activeJob && (
                <div className="glass-glow-red fade-in" style={{
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.03)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '800', letterSpacing: '0.05em' }}>INCOMING EMERGENCY REQUEST</span>
                    <span style={{
                      backgroundColor: 'var(--color-danger)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>{countdown}s</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {incomingRequest.customerProfilePic ? (
                      <img 
                        src={incomingRequest.customerProfilePic} 
                        alt="Customer" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>👤</div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '16px', marginBottom: '2px' }}>{incomingRequest.customerName}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location: Gulshan-e-Iqbal (approx 1.2km)</p>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', fontStyle: 'italic', fontSize: '13px' }}>
                    "{incomingRequest.description}"
                  </div>

                  {incomingRequest.image && (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '140px' }}>
                      <img src={incomingRequest.image} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(incomingRequest.image, '_blank')} />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                    <button 
                      onClick={handleDeclineRequest}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        borderRadius: '8px'
                      }}
                    >Decline</button>
                    <button 
                      onClick={handleAcceptRequest}
                      style={{
                        padding: '12px',
                        border: 'none',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: '8px'
                      }}
                    >Accept & Go</button>
                  </div>
                </div>
              )}

              {/* Active matching console */}
              {activeJob && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {activeJob.customerProfilePic ? (
                        <img 
                          src={activeJob.customerProfilePic} 
                          alt="Customer" 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>👤</div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>ACTIVE JOB</h4>
                        <h3 style={{ fontSize: '16px', margin: 0 }}>{activeJob.customerName}</h3>
                      </div>
                    </div>
                    <a 
                      href={`tel:${activeJob.customerPhone}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-secondary-glow)',
                        color: 'var(--color-secondary)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={14} /> Call
                    </a>
                  </div>

                  <div className="glass" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-secondary)', marginBottom: '16px' }}>
                    <strong>Problem:</strong> "{activeJob.description}"
                  </div>

                  {activeJob.image && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>CUSTOMER UPLOADED PHOTO</span>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '150px' }}>
                        <img src={activeJob.image} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(activeJob.image, '_blank')} />
                      </div>
                    </div>
                  )}

                  {/* Message center */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MessageSquare size={14} />
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>CUSTOMER CHAT</span>
                    </div>

                    <div style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      overflowY: 'auto',
                      marginBottom: '8px',
                      maxHeight: '250px'
                    }}>
                      {chatMessages.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Send a message to tell them you are on your way.</p>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              maxWidth: '80%',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              backgroundColor: msg.senderId === user.id ? 'var(--color-primary)' : 'var(--bg-card-hover)',
                              color: 'white'
                            }}>
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        value={messageText} 
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message..."
                        style={{ flex: 1 }}
                      />
                      <button type="submit" style={{
                        padding: '10px 14px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px'
                      }}>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>

                  <button 
                    onClick={handleCompleteJob}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'var(--color-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 'bold',
                      marginTop: '16px'
                    }}
                  >Mark Job Completed / Done</button>
                </div>
              )}
            </div>
          )}

        </section>

        {/* --- RIGHT HAND SIDE: INTERACTIVE MAP & CONTROL --- */}
        <section className="map-section">
          
          {/* MAP */}
          <div style={{ flex: 1, minHeight: '300px', borderRadius: '16px', overflow: 'hidden' }}>
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              />
              
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              {/* Render User Pin based on active role */}
              {activeTab === 'customer' ? (
                <Marker 
                  position={customerLocation} 
                  icon={icons.customer}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      if (marker != null) {
                        const position = marker.getLatLng();
                        setSelectedCity('');
                        updateLocation(position.lat, position.lng);
                      }
                    }
                  }}
                >
                  <Popup>Your Location (Drag to move)</Popup>
                </Marker>
              ) : (
                <Marker 
                  position={providerLocation} 
                  icon={providerProfile ? (icons[providerProfile.serviceType[0]] || icons.electrician) : icons.customer}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      if (marker != null) {
                        const position = marker.getLatLng();
                        setSelectedCity('');
                        updateLocation(position.lat, position.lng);
                      }
                    }
                  }}
                >
                  <Popup>Your Provider Location (Drag to move)</Popup>
                </Marker>
              )}

              {/* Render Providers */}
              {displayedProviders.filter(p => !providerProfile || p.id !== providerProfile.id).map((p) => {
                const coords = p.location?.coordinates;
                if (!coords || coords.length !== 2) return null;

                const isMatchedMarker = matchedProvider && matchedProvider.id === p.id;
                const isUrgent = activeRequest?.urgency === 'High' && isMatchedMarker;
                const mainService = p.serviceType[0];
                
                const pinIcon = isUrgent ? icons.emergency : (icons[mainService] || icons.electrician);

                return (
                  <Marker 
                    key={p.id} 
                    position={[coords[1], coords[0]]} 
                    icon={pinIcon}
                  >
                    <Popup>
                      <div style={{ fontSize: '13px' }}>
                        <strong style={{ display: 'block', color: 'white' }}>{p.name}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>Category: {p.serviceType.join(', ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Star size={10} className="text-yellow-400" fill="yellow" />
                          <span style={{ color: 'white' }}>{p.rating} ({p.totalJobs} jobs)</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* ========================================================= */}
          {/* =============== SIMULATION CONTROL PANEL =============== */}
          {/* ========================================================= */}
          {/* ========================================================= */}
          {/* =============== SIMULATION CONTROL PANEL =============== */}
          {/* ========================================================= */}
          <SimulationPanel 
            isSimulating={isSimulating} 
            handleStartSimulation={handleStartSimulation} 
          />

        </section>

      </main>
    </div>
  );
}

// Wrapper with Auth and Socket contexts
export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('servio_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('servio_theme', theme);
    const handleThemeApply = (targetTheme) => {
      if (targetTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (targetTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        // System Default
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemIsDark ? 'dark' : 'light');
      }
    };

    handleThemeApply(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const [authView, setAuthView] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // customer | provider
  const [serviceTypes, setServiceTypes] = useState(['AC mechanic']); // for provider signup

  return (
    <AuthProvider>
      <SocketProvider>
        <AuthWrapper 
          theme={theme}
          setTheme={setTheme}
          authView={authView}
          setAuthView={setAuthView}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          phone={phone}
          setPhone={setPhone}
          role={role}
          setRole={setRole}
          serviceTypes={serviceTypes}
          setServiceTypes={setServiceTypes}
        />
      </SocketProvider>
    </AuthProvider>
  );
}

// Sub-component to pull contexts inside AuthWrapper
function AuthWrapper(props) {
  const { token, login, register, error } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (props.authView === 'register') {
      const hasNumber = /[0-9]/.test(props.password);
      const hasSpecial = /[^A-Za-z0-9]/.test(props.password);
      if (!hasNumber || !hasSpecial) {
        alert("Password must contain at least 1 numeric character and 1 special character (e.g. @, #, $, %, etc.).");
        return;
      }
    }

    setLoading(true);
    if (props.authView === 'login') {
      await login(props.email, props.password);
    } else {
      await register(props.name, props.email, props.phone, props.password, props.role, props.serviceTypes);
    }
    setLoading(false);
  };

  // If token is present, render the main dashboard
  if (token) {
    return <MainApp theme={props.theme} setTheme={props.setTheme} />;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Floating Theme Selector on login/signup */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <select
          value={props.theme}
          onChange={(e) => props.setTheme(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: 'var(--text-main)',
            outline: 'none'
          }}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="system">💻 System</option>
        </select>
      </div>
      <div className="glass fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '30px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '24px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
          }}>⚡</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>Servio</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Real-Time Local Service Concierge</p>
        </div>

        {error && (
          <div className="glass-glow-red" style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {props.authView === 'register' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  value={props.name} 
                  onChange={(e) => props.setName(e.target.value)}
                  placeholder="e.g. Ali Ahmed" 
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={props.phone} 
                  onChange={(e) => props.setPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567" 
                  required
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" 
              value={props.email} 
              onChange={(e) => props.setEmail(e.target.value)}
              placeholder="name@service.com" 
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              value={props.password} 
              onChange={(e) => props.setPassword(e.target.value)}
              placeholder="••••••••" 
              required
            />
          </div>

          {props.authView === 'register' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Sign up as</label>
                <select 
                  value={props.role} 
                  onChange={(e) => props.setRole(e.target.value)}
                >
                  <option value="customer">Customer (Needs Service)</option>
                  <option value="provider">Provider (Offers Service)</option>
                </select>
              </div>

              {props.role === 'provider' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Select Main Skill</label>
                  <select 
                    value={props.serviceTypes[0]} 
                    onChange={(e) => props.setServiceTypes([e.target.value])}
                  >
                    <option value="AC mechanic">AC Mechanic</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="painter">Painter</option>
                    <option value="mason">Mason/Tile work</option>
                    <option value="appliance repair">Appliance Repair</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="car mechanic">Car Mechanic (Mobile)</option>
                    <option value="cleaner">Home Cleaning</option>
                    <option value="cctv installer">CCTV Installer</option>
                    <option value="solar technician">Solar Panel Tech</option>
                  </select>
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '12px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {props.authView === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {props.authView === 'login' ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => props.setAuthView('register')}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px' }}
              >Sign Up</button>
            </p>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button 
                onClick={() => props.setAuthView('login')}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px' }}
              >Log In</button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
