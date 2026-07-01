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

const playEmergencySiren = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    
    // Frequency sweeping siren
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.8);
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 1.2);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.6);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  } catch (e) {
    console.error("Audio Context is blocked or not supported:", e);
  }
};

// Map helper to handle fly-to centering transitions
// Only triggers when flyTarget changes (explicit user actions), NOT on every coordinate update
function ChangeMapView({ flyTarget, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, zoom, { animate: true, duration: 1.5 });
    }
  }, [flyTarget, zoom, map]);
  return null;
}

const ESTIMATED_SERVICES = [
  { id: 'ac_gas', category: 'AC mechanic', name: 'AC Gas Refilling', price: 4500, duration: 60, icon: '❄️' },
  { id: 'ac_service', category: 'AC mechanic', name: 'Master Servicing', price: 1500, duration: 45, icon: '🧼' },
  { id: 'ac_cap', category: 'AC mechanic', name: 'Capacitor Replacement', price: 1800, duration: 30, icon: '🔌' },
  { id: 'ac_comp', category: 'AC mechanic', name: 'Compressor Repair/Install', price: 12000, duration: 120, icon: '⚙️' },
  
  { id: 'elec_fan', category: 'electrician', name: 'Ceiling Fan Installation', price: 600, duration: 30, icon: '🪭' },
  { id: 'elec_short', category: 'electrician', name: 'Short Circuit Fault Finding', price: 1500, duration: 60, icon: '💥' },
  { id: 'elec_board', category: 'electrician', name: 'Switchboard Repair', price: 800, duration: 45, icon: '🎛️' },
  { id: 'elec_break', category: 'electrician', name: 'Circuit Breaker Replacement', price: 1000, duration: 30, icon: '⚡' },
  
  { id: 'plum_leak', category: 'plumber', name: 'Water Pipe Leakage Repair', price: 1200, duration: 45, icon: '💧' },
  { id: 'plum_tap', category: 'plumber', name: 'Water Mixer / Tap Install', price: 700, duration: 30, icon: '🚰' },
  { id: 'plum_wc', category: 'plumber', name: 'Commode / WC Repair', price: 3500, duration: 90, icon: '🚽' },
  { id: 'plum_pump', category: 'plumber', name: 'Water Pump Donkey Motor Install', price: 3000, duration: 60, icon: '🛢️' }
];

function MainApp({ theme, setTheme }) {
  const { user, providerProfile, logout } = useAuth();
  const socket = useSocket();

  // Page selection for redesigned UI
  const [activePage, setActivePage] = useState('dashboard');

  // Coordinates state: Default to Karachi center (Gulshan/Johar area)
  const [customerLocation, setCustomerLocation] = useState([24.9012, 67.0782]);
  const [providerLocation, setProviderLocation] = useState([24.8988, 67.0725]);
  // flyTarget: only updated on explicit user actions (city select / GPS click)
  // This prevents the map from auto-jumping on every pin drag or socket update
  const [flyTarget, setFlyTarget] = useState([24.9012, 67.0782]);
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

  // updateLocation: updates pin coordinates only — does NOT auto-fly map
  const updateLocation = (newLat, newLng, statusMsg = '', shouldFly = false) => {
    if (activeTab === 'customer') {
      setCustomerLocation([newLat, newLng]);
      if (shouldFly) setFlyTarget([newLat, newLng]);
    } else {
      setProviderLocation([newLat, newLng]);
      if (shouldFly) setFlyTarget([newLat, newLng]);
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
      // shouldFly = true: explicit user action, map should re-center
      updateLocation(cityObj.lat, cityObj.lng, `Centered on ${cityName}`, true);
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
          // shouldFly = true: explicit GPS request, map should re-center
          updateLocation(latitude, longitude, 'Precise location obtained via GPS', true);
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
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocationStatus('GPS Geolocation is not supported by your browser.');
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
  const [requestState, setRequestState] = useState('idle'); // idle | searching | matched | completed | rating
  const [customerRequests, setCustomerRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const selectedRequestIdRef = useRef(null);
  useEffect(() => {
    selectedRequestIdRef.current = selectedRequestId;
  }, [selectedRequestId]);
  const activeRequest = customerRequests.find(r => r.id === selectedRequestId) || null;
  const [matchedProvider, setMatchedProvider] = useState(null);

  // Rating & Review state
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Cost Estimator state
  const [estimatorCategory, setEstimatorCategory] = useState('AC mechanic');
  const [selectedEstimatorItems, setSelectedEstimatorItems] = useState([]);

  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceAudio, setVoiceAudio] = useState(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // AI Diagnostics state
  const [aiDiagnosisReport, setAiDiagnosisReport] = useState(null);
  const [isDiagnosingImage, setIsDiagnosingImage] = useState(false);
  const [showScannerAnimation, setShowScannerAnimation] = useState(false);

  // Emergency SOS state
  const [showSOSSelector, setShowSOSSelector] = useState(false);

  // App Settings states
  const [language, setLanguage] = useState('en');
  const [enableAudioAlerts, setEnableAudioAlerts] = useState(true);
  const [sosMatchRadius, setSosMatchRadius] = useState(15);
  const [simulationSpeed, setSimulationSpeed] = useState(5);

  const handleEmergencySOS = (category, alarmDescription) => {
    setSelectedService(category);
    const desc = `🚨 [SOS EMERGENCY] ${alarmDescription}`;
    setRequestDescription(desc);
    setRequestState('searching');
    setShowSOSSelector(false);
    
    socket.emit('request:create', {
      customerId: user.id,
      serviceType: category,
      description: desc,
      coordinates: [customerLocation[1], customerLocation[0]], // [lng, lat]
      image: null,
      voiceAudio: null,
      aiDiagnosis: null,
      isEmergency: true,
      sosMatchRadius: sosMatchRadius
    });
  };

  const handleAIDiagnosis = async () => {
    if (!requestImage) return;
    setIsDiagnosingImage(true);
    setShowScannerAnimation(true);
    try {
      const response = await axios.post('http://localhost:5000/api/requests/diagnose', {
        image: requestImage,
        serviceType: selectedService,
        description: requestDescription
      });
      if (response.data && response.data.success) {
        setAiDiagnosisReport(response.data);
        if (response.data.serviceType) {
          setSelectedService(response.data.serviceType);
        }
      }
    } catch (err) {
      console.error('AI visual diagnosis error:', err);
    } finally {
      setTimeout(() => {
        setIsDiagnosingImage(false);
        setShowScannerAnimation(false);
      }, 1500);
    }
  };

  const startVoiceRecording = async () => {
    // 1. Start Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ur-PK';
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setRequestDescription(prev => prev ? prev + ' ' + transcript : transcript);
        }
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }

    // 2. Start Audio Recording (MediaRecorder)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceAudio(reader.result); // Base64 representation of voice note
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log(err);
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.log(err);
      }
    }
    setIsRecordingVoice(false);
  };

  const handleBookSelectedEstimatorItems = () => {
    if (selectedEstimatorItems.length === 0) return;
    const category = selectedEstimatorItems[0].category;
    const listNames = selectedEstimatorItems.map(item => item.name).join(', ');
    const totalPrice = selectedEstimatorItems.reduce((sum, item) => sum + item.price, 0);
    const totalDuration = selectedEstimatorItems.reduce((sum, item) => sum + item.duration, 0);
    
    setSelectedService(category);
    setRequestDescription(`Booking quote estimate for: ${listNames}.\nEstimated duration: ${totalDuration} mins.\nStandard Market Rate Quote: ${totalPrice} PKR.\n\nPlease confirm this request.`);
    setSelectedEstimatorItems([]);
    setActivePage('requests');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("Please upload an image smaller than 15MB.");
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
  const { updateUserProfile, updateProviderProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editProfilePic, setEditProfilePic] = useState(user?.profilePic || null);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'customer');
  const [providerServiceType, setProviderServiceType] = useState(providerProfile?.serviceType?.[0] || 'AC mechanic');
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
      if (file.size > 15 * 1024 * 1024) {
        alert("Please upload an image smaller than 15MB.");
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
        profilePic: editProfilePic,
        role: selectedRole,
        serviceType: selectedRole === 'provider' ? [providerServiceType] : undefined
      });
      updateUserProfile(res.data.user);
      if (res.data.providerProfile) {
        updateProviderProfile(res.data.providerProfile);
      } else if (res.data.user.role !== 'provider') {
        updateProviderProfile(null);
      }
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
          // Fly map to provider's saved location once on login
          setFlyTarget([lat, lng]);
        }
      }
    }
  }, [user, providerProfile]);

  // Pre-load active providers from REST API so they appear on map immediately
  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/api/providers/active')
        .then(res => {
          setProvidersList(res.data);
        })
        .catch(err => console.error('Error pre-loading providers:', err));
    }
  }, [user]);

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

    // Customer receives request creation confirmation
    socket.on('request:created', (data) => {
      const newReq = {
        id: data.request.id,
        serviceType: data.request.serviceType,
        description: data.request.description,
        status: 'searching',
        image: data.request.image,
        voiceAudio: data.request.voiceAudio,
        aiDiagnosis: data.request.aiDiagnosis,
        messages: []
      };
      setCustomerRequests(prev => [...prev, newReq]);
      setSelectedRequestId(newReq.id);
      setRequestState('searching');
      
      // Reset inputs
      setRequestDescription('');
      setRequestImage(null);
      setAiDiagnosisReport(null);
      setVoiceAudio(null);
    });

    // Customer receives notification when a provider accepts
    socket.on('request:matched', (details) => {
      setCustomerRequests(prev => prev.map(r => r.id === details.request.id ? { ...r, status: 'matched', provider: details.provider } : r));
      
      if (selectedRequestIdRef.current === details.request.id) {
        setMatchedProvider(details.provider);
        setRequestState('matched');
        setChatMessages(details.request.messages || []);
      }

      // Focus map on matched provider's location
      if (details.provider.coordinates) {
        const [lng, lat] = details.provider.coordinates;
        setFlyTarget([lat, lng]);
        setMapZoom(15);
      }
    });

    // Provider receives an incoming request alert
    socket.on('request:incoming', (request) => {
      if (user?.role === 'provider' && isAvailable && !activeJob) {
        setIncomingRequest(request);
        setCountdown(30);
        if (request.isEmergency && enableAudioAlerts) {
          playEmergencySiren();
        }
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
      setCustomerRequests(prev => prev.map(r => {
        if (r.id === msg.requestId) {
          return {
            ...r,
            messages: [...(r.messages || []), msg]
          };
        }
        return r;
      }));

      if (selectedRequestIdRef.current === msg.requestId) {
        setChatMessages(prev => [...prev, msg]);
      }
    });

    // Job completed
    socket.on('request:completed', ({ requestId }) => {
      if (user?.role === 'customer') {
        setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rating' } : r));
        if (selectedRequestIdRef.current === requestId) {
          setRequestState('rating');
          setSelectedRating(0);
          setReviewText('');
          setRatingSubmitted(false);
        }
      } else {
        setActiveJob(null);
        setIncomingRequest(null);
        setChatMessages([]);
      }
    });

    socket.on('request:error', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('providers:list');
      socket.off('providers:update');
      socket.off('request:created');
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
      image: requestImage,
      voiceAudio: voiceAudio,
      aiDiagnosis: aiDiagnosisReport,
      isEmergency: false,
      sosMatchRadius: sosMatchRadius
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
    const localMsg = {
      senderId: user.id,
      text: messageText,
      timestamp: new Date().toISOString()
    };
    if (user.role === 'customer') {
      setCustomerRequests(prev => prev.map(r => r.id === reqId ? { ...r, messages: [...(r.messages || []), localMsg] } : r));
    }
    setChatMessages(prev => [...prev, localMsg]);
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

  // Submit rating & review for the matched provider
  const handleSubmitRating = async () => {
    if (selectedRating === 0) return;
    if (!matchedProvider?.id) {
      setRequestState('completed');
      setMatchedProvider(null);
      return;
    }
    setIsSubmittingRating(true);
    try {
      await axios.post(`http://localhost:5000/api/providers/${matchedProvider.id}/rate`, {
        rating: selectedRating,
        review: reviewText.trim(),
        customerId: user.id,
        customerName: user.name
      });
      setRatingSubmitted(true);
      // After a brief pause show the final thank-you screen
      setTimeout(() => {
        setRequestState('completed');
        setMatchedProvider(null);
        setSelectedRating(0);
        setReviewText('');
      }, 1800);
    } catch (err) {
      console.error('Rating submission error:', err);
    // Even on error, proceed to completed screen
      setRequestState('completed');
      setMatchedProvider(null);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // --- TRANSLATIONS DICTIONARY ---
  const TRANSLATIONS = {
    en: {
      needEmergencyFix: "Need an Emergency Fix? 🛠️",
      describeSub: "Describe what went wrong in plain Urdu/English. Our AI maps the urgency.",
      describeLabel: "Describe your emergency",
      voiceRecord: "Record Voice Note",
      chooseFile: "Choose File",
      takePhoto: "Take Photo",
      diagnoseAI: "Diagnose with AI",
      oneTapSOS: "1-TAP EMERGENCY SOS",
      popularCategories: "Popular Service Categories",
      findAvailable: "Find Available Now",
      recentHistory: "Recent request history",
      incomingRequestAlert: "INCOMING EMERGENCY REQUEST",
      decline: "Decline",
      acceptAndGo: "Accept & Go",
      dutyStatus: "Duty Status",
      availableNow: "AVAILABLE NOW",
      offline: "OFFLINE",
      activeJobConsole: "Active Job Console",
      problemText: "Problem",
      customerChat: "CUSTOMER CHAT",
      typeMessage: "Write a message...",
      send: "Send",
      callCustomer: "Call Customer",
      completeJob: "Complete Job"
    },
    ur: {
      needEmergencyFix: "ہنگامی مرمت کی ضرورت ہے؟ 🛠️",
      describeSub: "اپنے مسئلے کی تفصیل اردو یا انگریزی میں لکھیں۔ ہماری AI شدت کا اندازہ لگائے گی۔",
      describeLabel: "اپنے ہنگامی مسئلے کی وضاحت کریں",
      voiceRecord: "وائس نوٹ ریکارڈ کریں",
      chooseFile: "فائل منتخب کریں",
      takePhoto: "تصویر اتاریں",
      diagnoseAI: "AI سے تشخیص کریں",
      oneTapSOS: "🚨 فوری ہنگامی SOS",
      popularCategories: "مقبول سروس کیٹیگریز",
      findAvailable: "ابھی دستیاب تلاش کریں",
      recentHistory: "حالیہ درخواستوں کی تاریخ",
      incomingRequestAlert: "🚨 آنے والی ہنگامی درخواست",
      decline: "مسترد کریں",
      acceptAndGo: "قبول کریں اور جائیں",
      dutyStatus: "ڈیوٹی کی حالت",
      availableNow: "ابھی دستیاب ہے",
      offline: "آف لائن",
      activeJobConsole: "سرگرم کام کا کنسول",
      problemText: "مسئلہ",
      customerChat: "گاہک کے ساتھ بات چیت",
      typeMessage: "پیغام لکھیں...",
      send: "بھیجیں",
      callCustomer: "گاہک کو کال کریں",
      completeJob: "کام مکمل کریں"
    },
    roman: {
      needEmergencyFix: "Emergency Fix ki Zaroorat Hai? 🛠️",
      describeSub: "Apne maslay ki tafseel Urdu/English mein likhein. AI urgency check karega.",
      describeLabel: "Apne emergency maslay ki tafseel likhein",
      voiceRecord: "Voice Note Record Karein",
      chooseFile: "File Select Karein",
      takePhoto: "Photo Kheinchein",
      diagnoseAI: "AI Se Diagnose Karein",
      oneTapSOS: "1-TAP EMERGENCY SOS",
      popularCategories: "Popular Service Categories",
      findAvailable: "Available Specialists Dhoondein",
      recentHistory: "Halia requests ki history",
      incomingRequestAlert: "INCOMING EMERGENCY REQUEST",
      decline: "Decline",
      acceptAndGo: "Accept & Go",
      dutyStatus: "Duty Status",
      availableNow: "AVAILABLE NOW",
      offline: "OFFLINE",
      activeJobConsole: "Active Job Console",
      problemText: "Masla",
      customerChat: "CUSTOMER SE CHAT",
      typeMessage: "Message likhein...",
      send: "Send",
      callCustomer: "Customer ko Call Karein",
      completeJob: "Job Khatam Karein"
    }
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

      const seedReviewsList = [
        [
          { customerName: "Zainab Ahmed", rating: 5, review: "Bohot achi service thi! Saaf kaam kia bilkul.", createdAt: "2026-06-30" },
          { customerName: "Usman Ali", rating: 4, review: "Time pe aaye aur standard rates pe kaam kia.", createdAt: "2026-06-29" }
        ],
        [
          { customerName: "Ayesha Khan", rating: 5, review: "Excellent work, very polite and professional.", createdAt: "2026-06-28" }
        ],
        [
          { customerName: "Bilal Malik", rating: 4, review: "Kaam sahi ho gaya, price reasonable thi.", createdAt: "2026-06-27" },
          { customerName: "Mariam Jameel", rating: 5, review: "Highly recommended plumber! Best leak fixing.", createdAt: "2026-06-25" }
        ],
        [
          { customerName: "Hamza Siddiqui", rating: 3, review: "A bit late due to traffic but did excellent work.", createdAt: "2026-06-24" }
        ]
      ];

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
        totalJobs: Math.floor(Math.random() * 50) + 5,
        reviews: seedReviewsList[idx % seedReviewsList.length]
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
    }, simulationSpeed * 1000);
  };

  useEffect(() => {
    if (isSimulating) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = setInterval(() => {
        setSimulatedProviders(prev => {
          const updated = prev.map((p, idx) => {
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
      }, simulationSpeed * 1000);
    }
  }, [simulationSpeed]);

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
        providerProfile={providerProfile}
        editName={editName}
        setEditName={setEditName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editProfilePic={editProfilePic}
        setEditProfilePic={setEditProfilePic}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        providerServiceType={providerServiceType}
        setProviderServiceType={setProviderServiceType}
        handleProfileImageChange={handleProfileImageChange}
        startProfileCamera={startProfileCamera}
        handleSaveProfile={handleSaveProfile}
        isEditSaving={isEditSaving}
      />

      {/* --- PREMIUM NAVBAR --- */}
      <Header
        user={user}
        providerProfile={providerProfile}
        activePage={activePage}
        setActivePage={setActivePage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        setIsProfileModalOpen={setIsProfileModalOpen}
        logout={logout}
      />

      <main className="app-layout">
        {activePage === 'home' ? (
          <section className="glass page-section home-section">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ maxWidth: '540px' }}>
                <span className="eyebrow">New Look — Elevated Workflow</span>
                <h2>Smart local service management for customers and providers.</h2>
                <p className="hero-copy">A modern command center for booking trusted professionals, monitoring service requests, and staying connected with verified local providers.</p>
                <div className="hero-actions">
                  <button onClick={() => setActivePage('dashboard')} className="btn-primary">Go to Dashboard</button>
                  <button onClick={() => setActivePage('requests')} className="btn-secondary">Open Requests</button>
                </div>
              </div>
              <div className="hero-card">
                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Active Providers</span>
                    <h3>{displayedProviders.length}</h3>
                  </div>
                  <div className="stat-card">
                    <span>Matched Jobs</span>
                    <h3>{matchedProvider ? '1 active' : 'No matches'}</h3>
                  </div>
                  <div className="stat-card">
                    <span>Service Types</span>
                    <h3>10+</h3>
                  </div>
                  <div className="stat-card">
                    <span>Live Requests</span>
                    <h3>{requestState === 'searching' ? 'Processing' : requestState === 'matched' ? 'Matched' : 'Idle'}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <h4>Instant Matching</h4>
                <p>Submit a request and get matched with the nearest available qualified provider instantly.</p>
              </div>
              <div className="feature-card">
                <h4>Verified Professionals</h4>
                <p>All provider profiles include service specialization, contact details, and active status.</p>
              </div>
              <div className="feature-card">
                <h4>Smart Request Tracking</h4>
                <p>Follow request progress, accept offers, and complete jobs from a unified dashboard.</p>
              </div>
            </div>

            <div className="service-showcase">
              <div className="showcase-header">
                <h3>{TRANSLATIONS[language].popularCategories}</h3>
                <span>Tap any category to explore services</span>
              </div>
              <div className="category-grid">
                {['AC Mechanic', 'Electrician', 'Plumber', 'Painter', 'Car Mechanic', 'CCTV Installer', 'Home Cleaning', 'Solar Tech'].map((category) => (
                  <div key={category} className="category-chip">{category}</div>
                ))}
              </div>
            </div>
          </section>
        ) : activePage === 'dashboard' ? (
          <section className="glass page-section dashboard-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Dashboard Overview</span>
                <h2>Review your service history, performance metrics, and records.</h2>
              </div>
              <button onClick={() => setActivePage('requests')} className="btn-secondary">Open Requests</button>
            </div>

            <div className="dashboard-summary-grid">
              <div className="stat-card">
                <span>Active Providers</span>
                <h3>{displayedProviders.length}</h3>
              </div>
              <div className="stat-card">
                <span>Open Requests</span>
                <h3>{requestState === 'idle' ? 0 : requestState === 'searching' ? 1 : requestState === 'matched' ? 1 : 0}</h3>
              </div>
              <div className="stat-card">
                <span>Matched Providers</span>
                <h3>{matchedProvider ? 1 : 0}</h3>
              </div>
              <div className="stat-card">
                <span>Completed Jobs</span>
                <h3>{providerProfile?.totalJobs || 12}</h3>
              </div>
            </div>

            <div className="dashboard-history">
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h3>{TRANSLATIONS[language].recentHistory}</h3>
                    <p className="hero-copy">Recent service interactions and the latest provider assignments.</p>
                  </div>
                  <button onClick={() => setActivePage('requests')} className="btn-primary">View Live Requests</button>
                </div>

                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Provider</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AC repair follow-up</td>
                      <td>{matchedProvider?.name || 'Pending match'}</td>
                      <td>{matchedProvider?.serviceType?.[0] || selectedService || 'AC Mechanic'}</td>
                      <td>{requestState === 'searching' ? 'Processing' : requestState === 'matched' ? 'Matched' : requestState === 'idle' ? 'Idle' : 'Completed'}</td>
                      <td>{matchedProvider ? matchedProvider.rating : '—'}</td>
                    </tr>
                    <tr>
                      <td>Routine plumbing check</td>
                      <td>Muhammad Khan</td>
                      <td>Plumber</td>
                      <td>Completed</td>
                      <td>4.9</td>
                    </tr>
                    <tr>
                      <td>Power outage diagnostics</td>
                      <td>Ali Tech</td>
                      <td>Electrician</td>
                      <td>Completed</td>
                      <td>4.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : activePage === 'estimator' ? (
          <section className="glass page-section estimator-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Interactive Pricing & Calculator</span>
                <h2>Get instant cost quotes and duration estimates for standard repairs.</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px', alignItems: 'start' }} className="estimator-grid">
              
              {/* Left Column: Category selector and service list */}
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  {['AC mechanic', 'electrician', 'plumber'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setEstimatorCategory(cat);
                        // Clear selected items from other categories to maintain single category booking
                        setSelectedEstimatorItems([]);
                      }}
                      className={`nav-pill ${estimatorCategory === cat ? 'active' : ''}`}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ESTIMATED_SERVICES.filter(s => s.category === estimatorCategory).map(item => {
                    const isSelected = selectedEstimatorItems.some(i => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedEstimatorItems(prev => prev.filter(i => i.id !== item.id));
                          } else {
                            setSelectedEstimatorItems(prev => [...prev, item]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: '0.2s',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '20px' }}>{item.icon}</span>
                          <div>
                            <strong style={{ display: 'block', fontSize: '14px' }}>{item.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ Est. Duration: {item.duration} mins</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--color-primary)' }}>{item.price} PKR</span>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            color: 'white',
                            fontSize: '12px'
                          }}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Quote Summary */}
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'sticky', top: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  📋 Service Estimate Summary
                </h3>
                
                {selectedEstimatorItems.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '13px' }}>Select services on the left to build your custom repair quote.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {selectedEstimatorItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '4px', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.name}</span>
                          <span style={{ fontWeight: 'bold' }}>{item.price} PKR</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>Estimated Work Time:</span>
                        <span style={{ fontWeight: '500' }}>
                          {selectedEstimatorItems.reduce((sum, item) => sum + item.duration, 0)} mins
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}>
                        <span>Total Quote:</span>
                        <span style={{ color: 'var(--color-secondary)' }}>
                          {selectedEstimatorItems.reduce((sum, item) => sum + item.price, 0)} PKR
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleBookSelectedEstimatorItems}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      ⚡ Book this Quote
                    </button>
                    
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}>
                      Rates are standard diagnostic estimates. Final pricing subject to repair complexity.
                    </span>
                  </div>
                )}
              </div>

            </div>
          </section>
        ) : activePage === 'settings' ? (
          <section className="glass page-section settings-section" style={{ minHeight: '80vh' }}>
            <div className="section-header">
              <div>
                <span className="eyebrow">SYSTEM SETTINGS & PROFILE</span>
                <h2>Configure your profile preferences, local app behavior, and theme.</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', marginTop: '24px', alignItems: 'start' }} className="settings-grid">
              
              {/* Left Column: Navigation / Category Menu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Unified profile card selector */}
                <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px auto', border: '2px solid var(--color-primary)' }}>
                    {editProfilePic ? (
                      <img src={editProfilePic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--text-muted)' }}>👤</div>
                    )}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{editName}</h3>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'white',
                    backgroundColor: user?.role === 'provider' ? 'var(--color-primary)' : 'var(--color-secondary)',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    textTransform: 'capitalize'
                  }}>{user?.role}</span>
                </div>

                {/* Info and stats summary */}
                <div className="glass" style={{ padding: '16px', borderRadius: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Account Status:</strong> Active</p>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Current Language:</strong> {language === 'en' ? 'English' : language === 'ur' ? 'Urdu' : 'Roman Urdu'}</p>
                  <p style={{ margin: 0 }}><strong>Current Theme:</strong> {theme.toUpperCase()}</p>
                </div>
              </div>

              {/* Right Column: Settings Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Profile Settings Form */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👤 Profile Settings
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    {/* Profile Picture Upload & Camera Capture */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Profile Picture</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          id="settings-profile-image-upload"
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="settings-profile-image-upload"
                          className="glass"
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          📁 Choose File
                        </label>
                        <button
                          type="button"
                          onClick={startProfileCamera}
                          className="glass"
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600',
                            minHeight: 'unset',
                            boxShadow: 'none'
                          }}
                        >
                          📷 Capture Photo
                        </button>
                      </div>
                    </div>

                    {/* Role Specific settings */}
                    {user?.role === 'provider' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Offered Specialist Services</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                          {['AC mechanic', 'electrician', 'plumber', 'painter', 'mason', 'appliance repair', 'carpenter', 'car mechanic', 'cleaner', 'cctv installer', 'solar technician'].map(trade => {
                            const active = providerServiceType.includes(trade);
                            return (
                              <button
                                key={trade}
                                type="button"
                                onClick={() => {
                                  if (active) {
                                    setProviderServiceType(prev => prev.filter(t => t !== trade));
                                  } else {
                                    setProviderServiceType(prev => [...prev, trade]);
                                  }
                                }}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  borderRadius: '6px',
                                  border: active ? 'none' : '1px solid var(--border-color)',
                                  backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                                  color: 'white',
                                  cursor: 'pointer',
                                  minHeight: 'unset',
                                  boxShadow: 'none'
                                }}
                              >
                                {trade.charAt(0).toUpperCase() + trade.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isEditSaving}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: isEditSaving ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {isEditSaving ? <Loader2 size={14} className="animate-spin" /> : '✓'} Save Profile Details
                    </button>
                  </div>
                </div>

                {/* 2. Appearance & Language */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🎨 Appearance & Language</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Theme Selector */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        Choose App Theme
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'light', label: '☀️ Light Theme' },
                          { id: 'dark', label: '🌙 Dark Theme' },
                          { id: 'system', label: '💻 System Default' }
                        ].map(tOpt => {
                          const active = theme === tOpt.id;
                          return (
                            <button
                              key={tOpt.id}
                              type="button"
                              onClick={() => setTheme(tOpt.id)}
                              style={{
                                padding: '12px 6px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: active ? 'bold' : 'normal',
                                border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                                background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--bg-secondary)',
                                color: active ? '#ffffff' : 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minHeight: 'unset',
                                boxShadow: 'none'
                              }}
                            >
                              {tOpt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language Selector */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        Select App Language
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'en', label: '🇬🇧 English' },
                          { id: 'ur', label: '🇵🇰 اردو (Urdu)' },
                          { id: 'roman', label: '🗣️ Roman Urdu' }
                        ].map(lOpt => {
                          const active = language === lOpt.id;
                          return (
                            <button
                              key={lOpt.id}
                              type="button"
                              onClick={() => setLanguage(lOpt.id)}
                              style={{
                                padding: '12px 6px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: active ? 'bold' : 'normal',
                                border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                                background: active ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--bg-secondary)',
                                color: active ? '#ffffff' : 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minHeight: 'unset',
                                boxShadow: 'none'
                              }}
                            >
                              {lOpt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. App Settings / General Preferences */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>⚙️ App Preferences</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Audio Alert synthesiser config */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'white' }}>Emergency Audio Alerts</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Synthesize sweep sirens programmatically on SOS match.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableAudioAlerts(!enableAudioAlerts)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          backgroundColor: enableAudioAlerts ? 'var(--color-secondary)' : 'var(--border-color)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          minHeight: 'unset',
                          boxShadow: 'none'
                        }}
                      >
                        {enableAudioAlerts ? '✓ ACTIVE' : 'MUTED'}
                      </button>
                    </div>

                    {/* SOS Match Radius */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'white' }}>Emergency SOS Radius</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maximum distance coverage to broadcast emergency SOS alerts.</span>
                      </div>
                      <select
                        value={sosMatchRadius}
                        onChange={(e) => setSosMatchRadius(parseInt(e.target.value))}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                          outline: 'none'
                        }}
                      >
                        <option value={10}>10 Kilometers</option>
                        <option value={15}>15 Kilometers (Recommended)</option>
                        <option value={20}>20 Kilometers</option>
                        <option value={25}>25 Kilometers</option>
                      </select>
                    </div>

                    {/* Simulation Map speed */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'white' }}>Map Simulation Update Frequency</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Map coordinates interval for simulated vehicle drift.</span>
                      </div>
                      <select
                        value={simulationSpeed}
                        onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          color: 'var(--text-main)',
                          outline: 'none'
                        }}
                      >
                        <option value={2}>2 Seconds (High Precision)</option>
                        <option value={5}>5 Seconds (Recommended)</option>
                        <option value={10}>10 Seconds (Battery Saver)</option>
                      </select>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </section>
        ) : activePage === 'about' ? (
          <section className="glass page-section about-section">
            <div className="about-grid-top">
              <div className="about-copy">
                <span className="eyebrow">About Servio</span>
                <h2>A smarter local service concierge for every home and business.</h2>
                <p className="hero-copy">Servio brings together customers and nearby trusted providers with modern booking, tracking, and communication tools — all inside one premium dashboard.</p>
                <div className="about-grid" style={{ marginTop: '26px' }}>
                  <div className="about-card"><h4>Our Mission</h4><p>Make local service delivery fast, transparent, and reliable.</p></div>
                  <div className="about-card"><h4>Our Vision</h4><p>Empower every user to manage requests with confidence and clarity.</p></div>
                  <div className="about-card"><h4>For Providers</h4><p>Tools to stay visible, accept work quickly, and manage availability live.</p></div>
                </div>
              </div>

              <div className="about-cta-card">
                <h4>Why customers choose Servio</h4>
                <ul>
                  <li>Verified nearby professionals</li>
                  <li>Smart routing and request tracking</li>
                  <li>Slick mobile-friendly interaction</li>
                  <li>Quick status notifications</li>
                </ul>
              </div>
            </div>

            <div className="work-steps">
              <h3>How it works</h3>
              <div className="steps-grid">
                <div className="step-card"><span>1</span><h4>Submit Your Request</h4><p>Describe your issue and select a service category.</p></div>
                <div className="step-card"><span>2</span><h4>Match with Providers</h4><p>We locate nearby qualified providers instantly.</p></div>
                <div className="step-card"><span>3</span><h4>Confirm & Track</h4><p>See request progress, chat with providers, and complete the job.</p></div>
              </div>
            </div>
          </section>
        ) : (
          <>
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
              {/* Concurrent Active Bookings Tab Bar */}
              {customerRequests.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  {/* Tab button for booking form */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequestId(null);
                      setRequestState('idle');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: selectedRequestId === null ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedRequestId === null ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: selectedRequestId === null ? 'var(--color-primary)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minHeight: 'unset',
                      boxShadow: 'none'
                    }}
                  >
                    ➕ New Booking
                  </button>

                  {/* Tab button for each active request */}
                  {customerRequests.map((req) => {
                    const active = selectedRequestId === req.id;
                    const statusEmoji = req.status === 'searching' ? '🔍' : req.status === 'matched' ? '🤝' : req.status === 'rating' ? '⭐' : '✓';
                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => {
                          setSelectedRequestId(req.id);
                          setRequestState(req.status);
                          if (req.status === 'matched' && req.provider) {
                            setMatchedProvider(req.provider);
                            setChatMessages(req.messages || []);
                          } else {
                            setMatchedProvider(null);
                            setChatMessages([]);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: active ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          color: active ? 'var(--color-primary)' : 'var(--text-main)',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          minHeight: 'unset',
                          boxShadow: 'none'
                        }}
                      >
                        {statusEmoji} {req.serviceType.charAt(0).toUpperCase() + req.serviceType.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
              {requestState === 'idle' && (
                <>
                  {/* Pulse Animation styling */}
                  <style>{`
                    @keyframes sos-pulse {
                      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                    }
                  `}</style>
                  
                  {/* Pulsing Emergency SOS Button Banner */}
                  <div className="glass" style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-danger)', margin: '0 0 4px 0' }}>🚨 Critical Emergency Situation?</h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Skip typing and immediately match with nearby specialists.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowSOSSelector(true)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '24px',
                        border: 'none',
                        backgroundColor: 'var(--color-danger)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        animation: 'sos-pulse 1.6s infinite',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: 'unset',
                        boxShadow: 'none'
                      }}
                    >
                      🚨 1-TAP EMERGENCY SOS
                    </button>
                  </div>

                  {/* SOS Category Selector Modal Overlay */}
                  {showSOSSelector && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      zIndex: 99999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px'
                    }}>
                      <div className="glass" style={{
                        width: '100%',
                        maxWidth: '420px',
                        padding: '24px',
                        borderRadius: '20px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'var(--bg-card)',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}>
                        <h2 style={{ fontSize: '20px', color: 'var(--color-danger)', fontWeight: 'bold', marginBottom: '8px' }}>Select SOS Emergency</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Which critical situation requires immediate matching?</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleEmergencySOS('electrician', 'SHORT CIRCUIT FAULT / ELECTRIC SPARKING - IMMEDIATE RESPONDER NEEDED!')}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(250, 204, 21, 0.1)',
                              color: '#facc15',
                              border: '1px solid #facc15',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '8px',
                              minHeight: 'unset',
                              boxShadow: 'none'
                            }}
                          >
                            ⚡ Sparking & Short Circuit
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleEmergencySOS('plumber', 'PIPE BURST / WATER LEAK FLOODING - IMMEDIATE RESPONDER NEEDED!')}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#60a5fa',
                              border: '1px solid #60a5fa',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '8px',
                              minHeight: 'unset',
                              boxShadow: 'none'
                            }}
                          >
                            🌊 Pipe Burst & Flooding
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEmergencySOS('appliance repair', 'APPLIANCE SMOKE / GAS LEAK / THREAT - IMMEDIATE RESPONDER NEEDED!')}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--color-danger)',
                              border: '1px solid var(--color-danger)',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '8px',
                              minHeight: 'unset',
                              boxShadow: 'none'
                            }}
                          >
                            🔥 Appliance Smoke & Hazard
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowSOSSelector(false)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '12px',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-muted)',
                              fontWeight: 'bold',
                              fontSize: '13px',
                              cursor: 'pointer',
                              marginTop: '10px',
                              minHeight: 'unset',
                              boxShadow: 'none'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{TRANSLATIONS[language].needEmergencyFix}</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {TRANSLATIONS[language].describeSub}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].describeLabel}</label>
                        <button
                          type="button"
                          onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: isRecordingVoice ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
                            backgroundColor: isRecordingVoice ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                            color: isRecordingVoice ? 'var(--color-danger)' : 'var(--color-primary)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            minHeight: 'unset',
                            boxShadow: 'none'
                          }}
                        >
                          {isRecordingVoice ? (
                            <>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: 'var(--color-danger)',
                                borderRadius: '50%',
                                display: 'inline-block',
                                animation: 'pulse-red 1s infinite'
                              }}></span>
                              Stop Recording
                            </>
                          ) : (
                            <>🎙️ {TRANSLATIONS[language].voiceRecord}</>
                          )}
                        </button>
                      </div>
                      
                      <textarea
                        value={requestDescription}
                        onChange={handleDescriptionChange}
                        placeholder="e.g. AC se cooling nahi ho rhi aur ajeeb awaz aa rhi hai..."
                        rows={3}
                        style={{ resize: 'none' }}
                      />

                      {voiceAudio && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid var(--border-color)',
                          marginTop: '4px'
                        }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🎙️ Voice request captured!</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const audio = new Audio(voiceAudio);
                                audio.play();
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                minHeight: 'unset',
                                cursor: 'pointer',
                                boxShadow: 'none'
                              }}
                            >
                              ▶️ Play
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceAudio(null)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'var(--color-danger)',
                                minHeight: 'unset',
                                cursor: 'pointer',
                                boxShadow: 'none'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
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
                          📁 {TRANSLATIONS[language].chooseFile}
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
                          📷 {TRANSLATIONS[language].takePhoto}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          <style>{`
                            @keyframes laser-sweep {
                              0% { top: 0%; }
                              50% { top: 100%; }
                              100% { top: 0%; }
                            }
                          `}</style>
                          <div style={{
                            position: 'relative',
                            width: '180px',
                            height: '135px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            backgroundColor: '#000'
                          }}>
                            <img src={requestImage} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            
                            {/* Scanning Laser Overlay */}
                            {showScannerAnimation && (
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                width: '100%',
                                height: '3px',
                                backgroundColor: '#22c55e',
                                boxShadow: '0 0 8px #22c55e, 0 0 15px #22c55e',
                                animation: 'laser-sweep 1.8s infinite ease-in-out',
                                zIndex: 5
                              }} />
                            )}
                            {showScannerAnimation && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                zIndex: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#22c55e',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                textShadow: '0 1px 3px black'
                              }}>
                                AI SCANNING...
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={handleAIDiagnosis}
                              disabled={isDiagnosingImage}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: aiDiagnosisReport ? 'rgba(34, 197, 94, 0.15)' : 'var(--color-primary)',
                                color: aiDiagnosisReport ? '#22c55e' : 'white',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: isDiagnosingImage ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minHeight: 'unset',
                                boxShadow: 'none'
                              }}
                            >
                              {isDiagnosingImage ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  Analyzing...
                                </>
                              ) : aiDiagnosisReport ? (
                                <>✓ Rediagnose with AI</>
                              ) : (
                                <>🔍 Diagnose with AI</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI Diagnostics Report Card */}
                      {aiDiagnosisReport && (
                        <div className="glass" style={{
                          padding: '14px',
                          backgroundColor: 'rgba(34, 197, 94, 0.04)',
                          borderRadius: '12px',
                          border: '1px dashed #22c55e',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          marginTop: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '800' }}>⚡ SERVIO AI DIAGNOSTICS</span>
                            <span style={{
                              backgroundColor: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}>
                              {Math.round(aiDiagnosisReport.confidence * 100)}% Match
                            </span>
                          </div>

                          <div>
                            <strong style={{ display: 'block', fontSize: '13px', color: 'white', marginBottom: '2px' }}>
                              Detected Issue:
                            </strong>
                            <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0 }}>
                              {aiDiagnosisReport.diagnosis}
                            </p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Est. Cost:</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                                {aiDiagnosisReport.priceRange}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Urgency Level:</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15' }}>
                                {aiDiagnosisReport.urgency}
                              </span>
                            </div>
                          </div>

                          {aiDiagnosisReport.partsRequired && aiDiagnosisReport.partsRequired.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Suggested Parts/Tools:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {aiDiagnosisReport.partsRequired.map((part, idx) => (
                                  <span key={idx} style={{
                                    fontSize: '10px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    color: 'var(--text-main)'
                                  }}>
                                    🛠️ {part}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                      {TRANSLATIONS[language].findAvailable}
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

                  {/* Issue Voice Request player */}
                  {activeRequest?.voiceAudio && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>🎙️ YOUR VOICE REQUEST</span>
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio(activeRequest.voiceAudio);
                          audio.play();
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
                          minHeight: 'unset',
                          boxShadow: 'none'
                        }}
                      >
                        ▶️ Play voice note
                      </button>
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

              {/* ⭐ RATING & REVIEW SCREEN - shown right after job completion */}
              {requestState === 'rating' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px', padding: '10px' }}>

                  {ratingSubmitted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '70px', height: '70px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                      }}>✅</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>Review Submitted!</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thank you for your feedback.</p>
                    </div>
                  ) : (
                    <>
                      {/* Provider Avatar */}
                      <div style={{ position: 'relative' }}>
                        {matchedProvider?.profilePic ? (
                          <img src={matchedProvider.profilePic} alt="Provider" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }} />
                        ) : (
                          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white', fontWeight: 'bold', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                            {matchedProvider?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: '20px' }}>⭐</span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Rate your Experience</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          How was <strong style={{ color: 'var(--text-main)' }}>{matchedProvider?.name || 'your provider'}</strong>?
                        </p>
                        <span style={{
                          fontSize: '10px', fontWeight: '700', color: 'white',
                          backgroundColor: 'var(--color-primary)', padding: '2px 10px',
                          borderRadius: '20px', display: 'inline-block', marginTop: '6px', textTransform: 'capitalize'
                        }}>
                          {matchedProvider?.serviceType?.join(' / ') || selectedService}
                        </span>
                      </div>

                      {/* Interactive Star Row */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => {
                          const isActive = star <= (hoveredRating || selectedRating);
                          return (
                            <Star
                              key={star}
                              size={36}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setSelectedRating(star)}
                              fill={isActive ? '#facc15' : 'transparent'}
                              stroke={isActive ? '#facc15' : 'var(--text-muted)'}
                              style={{ cursor: 'pointer', transition: 'all 0.15s', transform: isActive ? 'scale(1.2)' : 'scale(1)' }}
                            />
                          );
                        })}
                      </div>

                      {/* Rating label */}
                      {(hoveredRating || selectedRating) > 0 && (
                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-secondary)', marginTop: '-10px' }}>
                          {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😊', 'Excellent! 🌟'][hoveredRating || selectedRating]}
                        </p>
                      )}

                      {/* Text review area */}
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'left' }}>
                          Add a review (optional)
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="e.g. Bahut acha kaam kiya, time pe aaye aur professional tha..."
                          rows={3}
                          style={{ resize: 'none', width: '100%', fontSize: '13px' }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                          onClick={() => { setRequestState('completed'); setMatchedProvider(null); }}
                          style={{
                            flex: 1, padding: '11px', borderRadius: '8px',
                            border: '1px solid var(--border-color)', backgroundColor: 'transparent',
                            color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer'
                          }}
                        >
                          Skip
                        </button>
                        <button
                          onClick={handleSubmitRating}
                          disabled={selectedRating === 0 || isSubmittingRating}
                          style={{
                            flex: 2, padding: '11px', borderRadius: '8px', border: 'none',
                            background: selectedRating > 0 ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--border-color)',
                            color: 'white', fontWeight: '700', fontSize: '14px',
                            cursor: selectedRating === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isSubmittingRating ? <Loader2 size={16} className="animate-spin" /> : '⭐'} Submit Rating
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ✅ COMPLETED THANK-YOU SCREEN */}
              {requestState === 'completed' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
                    boxShadow: '0 0 30px rgba(34,197,94,0.4)'
                  }}>
                    🎉
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>All Done! 🙌</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Thank you for using Servio. Your feedback helps the community.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={22} fill="#facc15" stroke="#facc15" />
                    ))}
                  </div>
                  <button
                    onClick={() => setRequestState('idle')}
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    Book Another Service
                  </button>
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
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                    />
                  ) : (
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', color: 'white', fontWeight: 'bold'
                    }}>
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>{user?.name}</h3>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', color: 'white',
                      backgroundColor: 'var(--color-primary)',
                      padding: '2px 10px', borderRadius: '20px',
                      display: 'inline-block', textTransform: 'capitalize'
                    }}>
                      {providerProfile?.serviceType?.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ') || 'Service Partner'}
                    </span>
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
                        width: '40px',
                        height: '22px',
                        minHeight: 'unset',
                        padding: 0,
                        boxShadow: 'none',
                        borderRadius: '11px',
                        background: isAvailable ? 'var(--color-primary)' : 'var(--border-color)',
                        position: 'relative',
                        border: 'none',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: isAvailable ? '21px' : '3px',
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
                incomingRequest.isEmergency ? (
                  /* Fullscreen Flashing Emergency Siren Alarm Overlay */
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.95)',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <style>{`
                      @keyframes siren-flash {
                        0% { background-color: rgba(239, 68, 68, 0.95); }
                        50% { background-color: rgba(17, 24, 39, 0.98); }
                        100% { background-color: rgba(239, 68, 68, 0.95); }
                      }
                      .siren-flasher {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        animation: siren-flash 1.2s infinite ease-in-out;
                        z-index: 1;
                      }
                      .emergency-card {
                        position: relative;
                        z-index: 10;
                        width: 100%;
                        max-width: 500px;
                        padding: 30px;
                        borderRadius: 24px;
                        background: var(--bg-card);
                        border: 2px solid var(--color-danger);
                        box-shadow: 0 0 50px rgba(239,68,68,0.5);
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                      }
                    `}</style>
                    
                    <div className="siren-flasher" />
                    
                    <div className="emergency-card glass">
                      <div>
                        <div style={{ fontSize: '40px', marginBottom: '8px', animation: 'pulse 1s infinite' }}>🚨</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-danger)', letterSpacing: '0.05em', margin: 0 }}>
                          CRITICAL SOS EMERGENCY
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nearest responder matched for immediate dispatch</span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'left'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-danger)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {incomingRequest.customerName.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '16px', margin: 0 }}>{incomingRequest.customerName}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Req. Specialization: {incomingRequest.serviceType}</span>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(239,68,68,0.08)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(239,68,68,0.2)',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        color: 'white',
                        lineHeight: 1.4
                      }}>
                        "{incomingRequest.description}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Auto-decline Countdown:</span>
                        <strong style={{ fontSize: '18px', color: 'var(--color-danger)' }}>{countdown} seconds</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '10px' }}>
                        <button
                          onClick={handleDeclineRequest}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '13px',
                            minHeight: 'unset',
                            boxShadow: 'none'
                          }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={handleAcceptRequest}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            fontWeight: '900',
                            cursor: 'pointer',
                            fontSize: '15px',
                            boxShadow: '0 0 20px rgba(239,68,68,0.4)',
                            minHeight: 'unset',
                            boxShadow: 'none',
                            animation: 'sos-pulse 1.2s infinite'
                          }}
                        >
                          ACCEPT SOS EMERGENCY
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Incoming request card */
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

                    {incomingRequest.voiceAudio && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🎙️ Voice message:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const audio = new Audio(incomingRequest.voiceAudio);
                            audio.play();
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '11px',
                            minHeight: 'unset',
                            boxShadow: 'none'
                          }}
                        >
                          ▶️ Listen
                        </button>
                      </div>
                    )}

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
                )
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

                  {activeJob.voiceAudio && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>🎙️ CUSTOMER VOICE NOTE</span>
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio(activeJob.voiceAudio);
                          audio.play();
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
                          minHeight: 'unset',
                          boxShadow: 'none'
                        }}
                      >
                        ▶️ Play voice note
                      </button>
                    </div>
                  )}

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
              center={flyTarget}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              />

              {/* flyTarget only changes on explicit user actions - no auto-jump on pin drag */}
              <ChangeMapView flyTarget={flyTarget} zoom={mapZoom} />

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
                        // shouldFly = false: pin drag should NOT re-center map
                        updateLocation(position.lat, position.lng, '', false);
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
                        // shouldFly = false: pin drag should NOT re-center map
                        updateLocation(position.lat, position.lng, '', false);
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
                      <div style={{ fontSize: '13px', width: '220px' }}>
                        <strong style={{ display: 'block', color: 'white', fontSize: '14px', marginBottom: '2px' }}>{p.name}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Category: {p.serviceType.join(', ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                          <Star size={10} className="text-yellow-400" fill="yellow" />
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{p.rating} ({p.totalJobs} jobs)</span>
                        </div>
                        
                        {p.reviews && p.reviews.length > 0 && (
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '6px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Customer Feedback:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                              {p.reviews.map((rev, rIdx) => (
                                <div key={rIdx} style={{ fontSize: '11px', lineHeight: '1.2', borderBottom: rIdx < p.reviews.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none', paddingBottom: '4px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '9px', marginBottom: '2px' }}>
                                    <span>👤 {rev.customerName}</span>
                                    <span>{'⭐'.repeat(rev.rating)}</span>
                                  </div>
                                  <p style={{ margin: 0, color: 'white', fontStyle: 'italic' }}>"{rev.review}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
      </>)}

      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <p className="footer-brand">Servio</p>
            <p className="footer-text">A polished service marketplace for customers and local providers — all in one connected console.</p>
          </div>

          <div className="footer-links">
            <a href="#home" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>Home</a>
            <a href="#dashboard" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }}>Dashboard</a>
            <a href="#requests" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('requests'); }}>Requests</a>
            <a href="#about" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('about'); }}>About</a>
          </div>

          <div>
            <p className="footer-text footer-text-small">Need help?</p>
            <p className="footer-contact">support@servio.com</p>
          </div>
        </div>
        <div className="footer-copy">© 2026 Servio. All rights reserved.</div>
      </footer>
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
  const { token, login, register, error, loading: authLoading } = useAuth();
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

  // Wait for AuthContext to finish loading user from localStorage
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--color-primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading Servio...</p>
        </div>
      </div>
    );
  }

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
