import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
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
  MessageSquare,
  Facebook,
  Linkedin,
  Mic,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Header from './components/Header';
import ProfileModal from './components/ProfileModal';
import CameraModal from './components/CameraModal';
import SimulationPanel from './components/SimulationPanel';

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
      completeJob: "Complete Job",
      navHome: "Home",
      navDashboard: "Dashboard",
      navRequests: "Requests",
      navEstimator: "Estimator",
      navSettings: "Settings",
      navAbout: "About",
      headerTagline: "Classy Local Service Concierge",
      customerView: "Customer View",
      providerView: "Provider View",
      customer: "Customer",
      goDashboard: "Go to Dashboard",
      openRequests: "Open Requests",
      activeProviders: "Active Providers",
      matchedJobs: "Matched Jobs",
      serviceTypes: "Service Types",
      liveRequests: "Live Requests",
      setLocation: "Set Your Current Location",
      chooseCustomCoords: "Choose custom coordinates...",
      gpsLocation: "GPS Location",
      heroEyebrow: "New Look — Elevated Workflow",
      heroTitle: "Smart local service management for customers and providers.",
      heroDesc: "A modern command center for booking trusted professionals, monitoring service requests, and staying connected with verified local providers.",
      instantMatching: "Instant Matching",
      instantMatchingDesc: "Submit a request and get matched with the nearest available qualified provider instantly.",
      verifiedProfessionals: "Verified Professionals",
      verifiedProfessionalsDesc: "All provider profiles include service specialization, contact details, and active status.",
      smartTracking: "Smart Request Tracking",
      smartTrackingDesc: "Follow request progress, accept offers, and complete jobs from a unified dashboard.",
      tapCategoryExplore: "Tap any category to explore services",
      recentHistorySub: "Recent service interactions and the latest provider assignments.",
      emergencyTitle: "🚨 Critical Emergency Situation?",
      emergencySub: "Skip typing and immediately match with nearby specialists.",
      newBooking: "➕ New Booking",
      selectSOSTitle: "Select SOS Emergency",
      selectSOSSub: "Which critical situation requires immediate matching?",
      sparkCircuit: "⚡ Sparking & Short Circuit",
      pipeBurst: "🌊 Pipe Burst & Flooding",
      applianceSmoke: "🔥 Appliance Smoke & Hazard",
      aiVoiceDispatch: "⚡ AI Voice Dispatch",
      aiVoiceDispatchListening: "Listening... Tell Servio your issue (e.g. 'pipe burst in washroom'). Tap to dispatch.",
      aiVoiceDispatchProcessing: "AI is transcribing and matching providers...",
      aiSafetyWarningTitle: "AI Safety Recommendation",
      aiChecklistTitle: "🛠️ AI Procedure Checklist",
      aiCopilotTitle: "✨ AI Negotiation Copilot",
      cancel: "Cancel",
      estimatorTitle: "Interactive Pricing & Calculator",
      estimatorSubtitle: "Get instant cost quotes and duration estimates for standard repairs.",
      estimatorSummaryTitle: "📋 Service Estimate Summary",
      estimatorSummaryEmpty: "Select services on the left to build your custom repair quote.",
      estimatorEstTime: "Estimated Work Time:",
      estimatorTotalQuote: "Total Quote:",
      estimatorBookQuote: "⚡ Book this Quote",
      estimatorNotice: "Rates are standard diagnostic estimates. Final pricing subject to repair complexity.",
      estimatorDurationLabel: "Est. Duration:",
      minsLabel: "mins",
      profileSettings: "Profile Settings",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      profilePicLabel: "Profile Picture",
      saveProfileBtn: "Save Profile Details",
      offeredServices: "Offered Specialist Services",
      dashboardOverview: "Dashboard Overview",
      dashboardOverviewSub: "Review your service history, performance metrics, and records.",
      colRequest: "Request",
      colProvider: "Provider",
      colCategory: "Category",
      colStatus: "Status",
      colRating: "Rating",
      pendingMatch: "Pending match",
      statusProcessing: "Processing",
      statusMatched: "Matched",
      statusIdle: "Idle",
      statusCompleted: "Completed",
      bookService: "Book Service",
      activeConsole: "Active Console",
      adminConsole: "Admin Console",
      stopRecording: "Stop Recording",
      voiceRequestCaptured: "🎙️ Voice request captured!",
      playVoiceNote: "▶️ Play voice note",
      play: "▶️ Play",
      remove: "Remove",
      attachPhotoLabel: "Attach Photo of the Issue (Optional)",
      aiScanning: "AI SCANNING...",
      analyzing: "Analyzing...",
      rediagnoseAI: "✓ Rediagnose with AI",
      diagnoseWithAI: "🔍 Diagnose with AI",
      detectedIssue: "Detected Issue:",
      estCost: "Est. Cost:",
      urgencyLevel: "Urgency Level:",
      suggestedParts: "Suggested Parts/Tools:",
      aiParsingPreview: "AI PARSING PREVIEW",
      requiredText: "Required",
      analyzingText: "Analyzing text...",
      serviceCategory: "Service Category",
      availableNearby: "Available Nearby Now",
      noLiveProvidersAround: "No live {service}s around. Try simulation!",
      available: "Available",
      searchingResponders: "Searching Online Responders...",
      sendingPing: "Sending ping to available {service}s within 5km radius.",
      cancelRequest: "Cancel Request",
      providerAccepted: "Provider Accepted!",
      headingToCoords: "Heading to your coordinates.",
      experienceLabel: "Experience:",
      years: "years",
      distanceApproaching: "Distance: Approaching...",
      attachedPhoto: "ATTACHED ISSUE PHOTO",
      yourVoiceRequest: "🎙️ YOUR VOICE REQUEST",
      rateNegotiation: "💲 RATE NEGOTIATION",
      rateLocked: "✅ Rate Locked at",
      providerProposedRate: "Provider proposed a rate of",
      waitingProviderResponse: "Waiting for provider to respond to counter-offer of",
      counterProposePlaceholder: "Counter-propose rate...",
      sendOffer: "Send Offer",
      partsInvoice: "🛠️ PARTS INVOICE",
      approvalRequired: "APPROVAL REQUIRED",
      partsTotalLabel: "Parts Total:",
      approveAndPay: "Approve & Pay",
      completedJobs: "Completed Jobs",
      avgRating: "Average Rating",
      simulatedEarnings: "Simulated Earnings",
      totalBookings: "Total Bookings",
      avgRatingGiven: "Average Rating Given",
      onlineStatus: "ONLINE",
      offlineStatus: "OFFLINE",
      rankText: "Rank",
      xpToLevel: "XP to Level",
      noHistory: "No service request history found yet.",
      emergencyServiceRequest: "Emergency service request",
      statusAccepted: "Accepted",
      statusCancelled: "Cancelled",
      statusPending: "Pending",
      statusRating: "Rating",
      aboutTitle: "About Servio",
      aboutSubtitle: "A smarter local service concierge for every home and business.",
      aboutDesc: "Servio brings together customers and nearby trusted providers with modern booking, tracking, and communication tools — all inside one premium dashboard.",
      aboutMission: "Our Mission",
      aboutMissionDesc: "Make local service delivery fast, transparent, and reliable.",
      aboutVision: "Our Vision",
      aboutVisionDesc: "Empower every user to manage requests with confidence and clarity.",
      aboutForProviders: "For Providers",
      aboutForProvidersDesc: "Tools to stay visible, accept work quickly, and manage availability live.",
      aboutWhyChoose: "Why customers choose Servio",
      aboutCtaItem1: "Verified nearby professionals",
      aboutCtaItem2: "Smart routing and request tracking",
      aboutCtaItem3: "Slick mobile-friendly interaction",
      aboutCtaItem4: "Quick status notifications",
      aboutHowItWorks: "How it works",
      aboutStep1Title: "Submit Your Request",
      aboutStep1Desc: "Describe your issue and select a service category.",
      aboutStep2Title: "Match with Providers",
      aboutStep2Desc: "We locate nearby qualified providers instantly.",
      aboutStep3Title: "Confirm & Track",
      aboutStep3Desc: "See request progress, chat with providers, and complete the job.",
      requestsTitle: "Service Logs & Portal",
      requestsSubtitle: "Monitor, manage, and inspect all active and historical requests.",
      requestsAllRecords: "All Request Records",
      requestsTotalCount: "Total requests",
      colDate: "Date",
      colUrgency: "Urgency",
      colPrice: "Price",
      colActions: "Actions",
      noRequestsFound: "No requests or bookings found. Click \"Home\" to start a new search.",
      notLocked: "Not locked",
      historical: "Historical",
      goToActiveConsole: "Go to Active Console",
      authHeroDesc: "Real-Time Local Service Concierge",
      authLabelEmail: "Email Address",
      authLabelPassword: "Password",
      authLabelConfirmPassword: "Confirm Password",
      authLabelFullName: "Full Name",
      authLabelPhone: "Phone Number",
      authLabelSignUpAs: "Sign up as",
      authLabelSelectSkill: "Select Main Skill",
      authLabelExperience: "Years of Experience",
      authBtnLogin: "Login",
      authBtnCreateAccount: "Create Account",
      authBtnForgot: "Forgot Password?",
      authBtnBackLogin: "Back to Login",
      authBtnSendOtp: "Send OTP Code",
      authBtnResetPassword: "Reset Password",
      authBtnVerifyOtp: "Verify OTP",
      authBtnCancelBackLogin: "Cancel & Back to Login",
      authTextDontHaveAccount: "Don't have an account?",
      authTextAlreadyHaveAccount: "Already have an account?",
      authLinkSignUp: "Sign Up",
      authLinkLogIn: "Log In",
      authLabel6DigitOtp: "6-Digit OTP Code",
      authLabelNewPassword: "New Password",
      authSimulatedEmailSent: "Simulated Email Sent!",
      authSimulatedOtpNotice: "Since SMTP credentials are not configured in backend/.env, you can view the email online:",
      authSimulatedOtpClick: "Click Here to Open simulated Ethereal Inbox & View OTP",
      authResetPasswordFor: "Resetting password for:",
      authEmailVerifyPrompt: "Please verify your email address to complete registration.",
      authPasswordLengthRule: "Password must be at least 8 characters long and contain at least 1 numeric character and 1 special character (e.g. @, #, $, %, etc.).",
      authPasswordRule: "Password must contain at least 1 numeric character and 1 special character (e.g. @, #, $, %, etc.)."
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
      completeJob: "کام مکمل کریں",
      navHome: "ہوم",
      navDashboard: "ڈیش بورڈ",
      navRequests: "درخواستیں",
      navEstimator: "تخمینہ کار",
      navSettings: "ترتیبات",
      navAbout: "تعارف",
      headerTagline: "بہترین مقامی سروس گائیڈ",
      customerView: "کسٹمر کا منظر",
      providerView: "سروس فراہم کنندہ منظر",
      customer: "گاہک",
      goDashboard: "ڈیش بورڈ پر جائیں",
      openRequests: "درخواستیں کھولیں",
      activeProviders: "فعال فراہم کنندگان",
      matchedJobs: "مماثل نوکریاں",
      serviceTypes: "سروس کی اقسام",
      liveRequests: "براہ راست درخواستیں",
      setLocation: "اپنی موجودہ لوکیشن سیٹ کریں",
      chooseCustomCoords: "اپنی مرضی کے کوآرڈینیٹس منتخب کریں...",
      gpsLocation: "جی پی ایس لوکیشن",
      heroEyebrow: "نیا روپ — بہتر کام کا بہاؤ",
      heroTitle: "صارِفین اور فراہم کنندگان کے لیے اسمارٹ مقامی سروس کا انتظام۔",
      heroDesc: "قابل اعتماد پیشہ ور افراد کی بکنگ، سروس کی درخواستوں کی نگرانی، اور تصدیق شدہ مقامی فراہم کنندگان کے ساتھ رابطے میں رہنے کے لیے ایک جدید کمانڈ سینٹر۔",
      instantMatching: "فوری ملاپ",
      instantMatchingDesc: "درخواست جمع کروائیں اور فوری طور پر قریب ترین دستیاب اہل سروس فراہم کنندہ سے ملیں۔",
      verifiedProfessionals: "تصدیق شدہ پیشہ ور افراد",
      verifiedProfessionalsDesc: "تمام فراہم کنندہ پروفائلز میں سروس کی مہارت، رابطے کی تفصیلات، اور فعال حیثیت شامل ہے۔",
      smartTracking: "اسمارٹ درخواست کی نگرانی",
      smartTrackingDesc: "ایک متحد ڈیش بورڈ سے درخواست کی پیشرفت کا جائزہ لیں، آفرز قبول کریں اور کام مکمل کریں۔",
      tapCategoryExplore: "سروسز تلاش کرنے کے لیے کسی بھی کیٹیگری پر ٹیپ کریں",
      recentHistorySub: "حالیہ سروس کے تعاملات اور تازہ ترین فراہم کنندہ کے کام۔",
      emergencyTitle: "🚨 کیا یہ کوئی سنگین ہنگامی صورتحال ہے؟",
      emergencySub: "ٹائپنگ چھوڑیں اور فوری طور پر قریبی ماہرین سے رابطہ کریں۔",
      newBooking: "➕ نئی بکنگ",
      selectSOSTitle: "ہنگامی SOS منتخب کریں",
      selectSOSSub: "کون سی نازک صورتحال فوری ملاپ کی تقاضا کرتی ہے؟",
      sparkCircuit: "⚡ چنگاری اور شارٹ سرکٹ",
      pipeBurst: "🌊 پائپ پھٹنا اور سیلاب",
      applianceSmoke: "🔥 اپلائنس کا دھواں اور خطرہ",
      aiVoiceDispatch: "⚡ AI وائس ڈسپیچ",
      aiVoiceDispatchListening: "سن رہا ہے... سروس کو اپنا مسئلہ بتائیں (جیسے 'واش روم میں پائپ پھٹ گیا ہے')۔ بند کرنے اور ڈسپیچ کے لیے ٹیپ کریں۔",
      aiVoiceDispatchProcessing: "AI وائس ٹرانسکرائب اور فراہم کنندگان سے ملاپ کر رہا ہے...",
      aiSafetyWarningTitle: "AI حفاظتی سفارشات",
      aiChecklistTitle: "🛠️ AI پروسیجر چیک لسٹ",
      aiCopilotTitle: "✨ AI گفت و شنید کوپائلٹ",
      cancel: "منسوخ کریں",
      estimatorTitle: "لاگت کا تخمینہ اور بکنگ کوٹ",
      estimatorSubtitle: "معیاری مرمت کے لیے فوری لاگت کے کوٹس اور دورانیہ کا تخمینہ حاصل کریں۔",
      estimatorSummaryTitle: "📋 سروس کا تخمینہ خلاصہ",
      estimatorSummaryEmpty: "اپنی مرضی کے مطابق ریپیئر کوٹ تیار کرنے کے لیے بائیں طرف سے سروسز منتخب کریں۔",
      estimatorEstTime: "کام کا تخمینہ وقت:",
      estimatorTotalQuote: "کل کوٹ:",
      estimatorBookQuote: "⚡ یہ کوٹ بک کریں",
      estimatorNotice: "شرحیں معیاری تشخیصی تخمینے ہیں۔ حتمی قیمتوں کا انحصار ریپیئر کی پیچیدگی پر ہے۔",
      estimatorDurationLabel: "تخمینہ دورانیہ:",
      minsLabel: "منٹ",
      profileSettings: "پروفائل کی ترتیبات",
      fullName: "پورا نام",
      phoneNumber: "فون نمبر",
      profilePicLabel: "پروفائل تصویر",
      saveProfileBtn: "پروفائل کی تفصیلات محفوظ کریں",
      offeredServices: "پیش کردہ ماہر خدمات",
      dashboardOverview: "ڈیش بورڈ کا جائزہ",
      dashboardOverviewSub: "اپنی سروس کی تاریخ، کارکردگی کے میٹرکس، اور ریکارڈز کا جائزہ لیں۔",
      colRequest: "درخواست",
      colProvider: "فراہم کنندہ",
      colCategory: "کیٹیگری",
      colStatus: "حیثیت",
      colRating: "درجہ بندی",
      pendingMatch: "ملاپ زیر التوا ہے",
      statusProcessing: "عملدرآمد جاری ہے",
      statusMatched: "ملاپ ہو گیا",
      statusIdle: "بیکار",
      statusCompleted: "مکمل",
      bookService: "سروس بک کریں",
      activeConsole: "سرگرم کنسول",
      adminConsole: "ایڈمن کنسول",
      stopRecording: "ریکارڈنگ روکیں",
      voiceRequestCaptured: "🎙️ آواز کی درخواست ریکارڈ ہو گئی!",
      playVoiceNote: "▶️ آواز سنیں",
      play: "▶️ پلے",
      remove: "ہٹائیں",
      attachPhotoLabel: "مسئلے کی تصویر منسلک کریں (اختیاری)",
      aiScanning: "AI سکیننگ جاری ہے...",
      analyzing: "تجزیہ ہو رہا ہے...",
      rediagnoseAI: "✓ دوبارہ AI سے تشخیص کریں",
      diagnoseWithAI: "🔍 AI سے تشخیص کریں",
      detectedIssue: "تشخیص شدہ مسئلہ:",
      estCost: "تخمینی لاگت:",
      urgencyLevel: "شدت کی سطح:",
      suggestedParts: "تجویز کردہ پرزے/اوزار:",
      aiParsingPreview: "AI تجزیہ کا پیش نظارہ",
      requiredText: "درکار ہے",
      analyzingText: "متن کا تجزیہ ہو رہا ہے...",
      serviceCategory: "سروس کی قسم",
      availableNearby: "ابھی قریبی دستیاب فراہم کنندہ",
      noLiveProvidersAround: "قریب کوئی فعال {service} نہیں ہے۔ سیمولیشن آزمائیں!",
      available: "دستیاب ہے",
      searchingResponders: "آن لائن فراہم کنندگان کی تلاش...",
      sendingPing: "5 کلومیٹر کے دائرے میں دستیاب {service} کو پیغام بھیجا جا رہا ہے۔",
      cancelRequest: "درخواست منسوخ کریں",
      providerAccepted: "فراہم کنندہ نے قبول کر لیا!",
      headingToCoords: "آپ کی لوکیشن کی طرف آ رہے ہیں۔",
      experienceLabel: "تجربہ:",
      years: "سال",
      distanceApproaching: "فاصلہ: پہنچ رہے ہیں...",
      attachedPhoto: "منسلک تصویر",
      yourVoiceRequest: "🎙️ آپ کی وائس ریکارڈنگ",
      rateNegotiation: "💲 ریٹ کی بات چیت",
      rateLocked: "✅ ریٹ لاک ہو گیا:",
      providerProposedRate: "فراہم کنندہ نے ریٹ تجویز کیا:",
      waitingProviderResponse: "فراہم کنندہ کے جواب کا انتظار ہے، جوابی آفر:",
      counterProposePlaceholder: "ریٹ کی جوابی آفر لکھیں...",
      sendOffer: "آفر بھیجیں",
      partsInvoice: "🛠️ پرزوں کا انوائس",
      approvalRequired: "منظوری درکار ہے",
      partsTotalLabel: "کل پرزے:",
      approveAndPay: "منظور کریں اور ادا کریں",
      completedJobs: "مکمل شدہ نوکریاں",
      avgRating: "اوسط درجہ بندی",
      simulatedEarnings: "تخمینی آمدنی",
      totalBookings: "کل بکنگز",
      avgRatingGiven: "دی گئی اوسط درجہ بندی",
      onlineStatus: "آن لائن",
      offlineStatus: "آف لائن",
      rankText: "درجہ",
      xpToLevel: "اگلے لیول کے لیے ایکس پی",
      noHistory: "ابھی تک کوئی سروس ہسٹری نہیں ملی۔",
      emergencyServiceRequest: "ہنگامی سروس کی درخواست",
      statusAccepted: "قبول شدہ",
      statusCancelled: "منسوخ شدہ",
      statusPending: "زیر التوا",
      statusRating: "درجہ بندی",
      aboutTitle: "سرویو کے بارے میں",
      aboutSubtitle: "ہر گھر اور کاروبار کے لیے ایک بہتر مقامی سروس دربان۔",
      aboutDesc: "سرویو صارفین اور قریبی قابل اعتماد فراہم کنندگان کو جدید بکنگ، ٹریکنگ، اور مواصلاتی ٹولز کے ساتھ ایک پریمیم ڈیش بورڈ کے اندر لاتا ہے۔",
      aboutMission: "ہمارا مشن",
      aboutMissionDesc: "مقامی سروس کی فراہمی کو تیز، شفاف اور قابل اعتماد بنائیں۔",
      aboutVision: "ہمارا وژن",
      aboutVisionDesc: "ہر صارف کو اعتماد اور وضاحت کے ساتھ درخواستوں کا انتظام کرنے کے قابل بنائیں۔",
      aboutForProviders: "فراہم کنندگان کے لیے",
      aboutForProvidersDesc: "نمایاں رہنے، تیزی سے کام قبول کرنے، اور لائیو دستیابی کا انتظام کرنے کے ٹولز۔",
      aboutWhyChoose: "صارفین سرویو کا انتخاب کیوں کرتے ہیں",
      aboutCtaItem1: "تصدیق شدہ قریبی پیشہ ور افراد",
      aboutCtaItem2: "سمارٹ روٹنگ اور درخواست کی ٹریکنگ",
      aboutCtaItem3: "آسان موبائل دوستانہ تعامل",
      aboutCtaItem4: "فوری اسٹیٹس اطلاعات",
      aboutHowItWorks: "یہ کیسے کام کرتا ہے",
      aboutStep1Title: "اپنی درخواست جمع کروائیں",
      aboutStep1Desc: "اپنے مسئلے کی وضاحت کریں اور سروس کیٹیگری منتخب کریں۔",
      aboutStep2Title: "فراہم کنندگان سے میچ کریں",
      aboutStep2Desc: "ہم قریبی اہل فراہم کنندگان کو فوری طور پر تلاش کرتے ہیں۔",
      aboutStep3Title: "تصدیق کریں اور ٹریک کریں",
      aboutStep3Desc: "درخواست کی پیشرفت دیکھیں، فراہم کنندگان سے چیٹ کریں، اور کام مکمل کریں۔",
      requestsTitle: "سروس لاگز اور پورٹل",
      requestsSubtitle: "تمام فعال اور تاریخی درخواستوں کی نگرانی، انتظام اور معائنہ کریں۔",
      requestsAllRecords: "درخواست کے تمام ریکارڈز",
      requestsTotalCount: "کل درخواستیں",
      colDate: "تاریخ",
      colUrgency: "سنگینی",
      colPrice: "قیمت",
      colActions: "اقدامات",
      noRequestsFound: "کوئی درخواست یا بکنگ نہیں ملی۔ نیا سرچ شروع کرنے کے لیے \"ہوم\" پر کلک کریں۔",
      notLocked: "لاک نہیں ہوا",
      historical: "تاریخی ریکارڈ",
      goToActiveConsole: "سرگرم کنسول پر جائیں",
      authHeroDesc: "ریئل ٹائم لوکل سروس دربان",
      authLabelEmail: "ای میل ایڈریس",
      authLabelPassword: "پاس ورڈ",
      authLabelConfirmPassword: "پاس ورڈ کی تصدیق کریں",
      authLabelFullName: "پورا نام",
      authLabelPhone: "فون نمبر",
      authLabelSignUpAs: "بطور رجسٹر کریں",
      authLabelSelectSkill: "بنیادی مہارت منتخب کریں",
      authLabelExperience: "تجربے کے سال",
      authBtnLogin: "لاگ ان کریں",
      authBtnCreateAccount: "اکاؤنٹ بنائیں",
      authBtnForgot: "پاس ورڈ بھول گئے؟",
      authBtnBackLogin: "لاگ ان پر واپس جائیں",
      authBtnSendOtp: "او ٹی پی کوڈ بھیجیں",
      authBtnResetPassword: "پاس ورڈ دوبارہ ترتیب دیں",
      authBtnVerifyOtp: "او ٹی پی کی تصدیق کریں",
      authBtnCancelBackLogin: "منسوخ کریں اور واپس لاگ ان پر جائیں",
      authTextDontHaveAccount: "اکاؤنٹ نہیں ہے؟",
      authTextAlreadyHaveAccount: "پہلے سے ہی اکاؤنٹ موجود ہے؟",
      authLinkSignUp: "سائن اپ کریں",
      authLinkLogIn: "لاگ ان",
      authLabel6DigitOtp: "6 ہندسوں کا او ٹی پی کوڈ",
      authLabelNewPassword: "نیا پاس ورڈ",
      authSimulatedEmailSent: "مصنوعی ای میل بھیج دی گئی!",
      authSimulatedOtpNotice: "چونکہ SMTP اسناد backend/.env میں کنفیگر نہیں ہیں، آپ ای میل آن لائن دیکھ سکتے ہیں:",
      authSimulatedOtpClick: "مصنوعی Ethereal ان باکس کھولنے اور OTP دیکھنے کے لیے یہاں کلک کریں",
      authResetPasswordFor: "پاس ورڈ دوبارہ ترتیب دیا جا رہا ہے برائے:",
      authEmailVerifyPrompt: "براہ کرم رجسٹریشن مکمل کرنے کے لیے اپنے ای میل ایڈریس کی تصدیق کریں۔",
      authPasswordLengthRule: "پاس ورڈ کم از کم 8 حروف طویل ہونا چاہیے اور اس میں کم از کم 1 عددی حرف اور 1 خصوصی حرف ہونا چاہیے (جیسے @، #، $، %، وغیرہ)۔",
      authPasswordRule: "پاس ورڈ میں کم از کم 1 عددی حرف اور 1 خصوصی حرف ہونا چاہیے (جیسے @، #، $، %، وغیرہ)۔"
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
      completeJob: "Job Khatam Karein",
      navHome: "Home",
      navDashboard: "Dashboard",
      navRequests: "Requests",
      navEstimator: "Estimator",
      navSettings: "Settings",
      navAbout: "About",
      headerTagline: "Behtareen local service guide",
      customerView: "Customer View",
      providerView: "Provider View",
      customer: "Customer",
      goDashboard: "Go to Dashboard",
      openRequests: "Open Requests",
      activeProviders: "Active Providers",
      matchedJobs: "Matched Jobs",
      serviceTypes: "Service Types",
      liveRequests: "Live Requests",
      setLocation: "Apni location set karein",
      chooseCustomCoords: "Custom coordinates select karein...",
      gpsLocation: "GPS Location",
      heroEyebrow: "Naya Look — Behtar kaam ka bahao",
      heroTitle: "Customers aur providers ke liye smart local service management.",
      heroDesc: "Trusted professionals book karne, service requests monitor karne, aur verified local providers se connect rehne ka modern center.",
      instantMatching: "Instant Matching",
      instantMatchingDesc: "Request submit karein aur foran kareeb tareen available provider se match hojayein.",
      verifiedProfessionals: "Verified Professionals",
      verifiedProfessionalsDesc: "Tamam provider profiles mein specialization, contact info aur active status shamil hoti hai.",
      smartTracking: "Smart Request Tracking",
      smartTrackingDesc: "Aik unified dashboard se request progress follow karein, offers accept karein aur jobs complete karein.",
      tapCategoryExplore: "Services explore karne ke liye kisi bhi category pe tap karein",
      recentHistorySub: "Haalia service interactions aur latest provider assignments.",
      emergencyTitle: "🚨 Kya yeh koi urgent emergency situation hai?",
      emergencySub: "Typing chodein aur foran kareeb tareen specialists se match karein.",
      newBooking: "➕ Nayi Booking",
      selectSOSTitle: "SOS Emergency Select Karein",
      selectSOSSub: "Kaun si urgent situation immediate matching chahti hai?",
      sparkCircuit: "⚡ Sparking & Short Circuit",
      pipeBurst: "🌊 Pipe Burst & Flooding",
      applianceSmoke: "🔥 Appliance Smoke & Gas Leak",
      aiVoiceDispatch: "⚡ AI Voice Dispatch",
      aiVoiceDispatchListening: "Sun rha hai... Servio ko apna masla batayein (e.g. 'pipe burst ho gya'). Tap to stop & dispatch.",
      aiVoiceDispatchProcessing: "AI voice transcribe aur matching providers dhoond rha hai...",
      aiSafetyWarningTitle: "AI Safety Recommendation",
      aiChecklistTitle: "🛠️ AI Procedure Checklist",
      aiCopilotTitle: "✨ AI Negotiation Copilot",
      cancel: "Cancel",
      estimatorTitle: "Interactive Pricing & Calculator",
      estimatorSubtitle: "Get instant cost quotes and duration estimates for standard repairs.",
      estimatorSummaryTitle: "📋 Service Estimate Summary",
      estimatorSummaryEmpty: "Select services on the left to build your custom repair quote.",
      estimatorEstTime: "Estimated Work Time:",
      estimatorTotalQuote: "Total Quote:",
      estimatorBookQuote: "⚡ Book this Quote",
      estimatorNotice: "Rates are standard diagnostic estimates. Final pricing subject to repair complexity.",
      estimatorDurationLabel: "Est. Duration:",
      minsLabel: "mins",
      profileSettings: "Profile Settings",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      profilePicLabel: "Profile Picture",
      saveProfileBtn: "Save Profile Details",
      offeredServices: "Offered Specialist Services",
      dashboardOverview: "Dashboard Overview",
      dashboardOverviewSub: "Review your service history, performance metrics, and records.",
      colRequest: "Request",
      colProvider: "Provider",
      colCategory: "Category",
      colStatus: "Status",
      colRating: "Rating",
      pendingMatch: "Pending match",
      statusProcessing: "Processing",
      statusMatched: "Matched",
      statusIdle: "Idle",
      statusCompleted: "Completed",
      bookService: "Service Book Karein",
      activeConsole: "Active Console",
      adminConsole: "Admin Console",
      stopRecording: "Recording Rokein",
      voiceRequestCaptured: "🎙️ Voice request record hogayi!",
      playVoiceNote: "▶️ Voice note sunein",
      play: "▶️ Play",
      remove: "Hataein",
      attachPhotoLabel: "Maslay ki photo attach karein (Optional)",
      aiScanning: "AI SCANNING...",
      analyzing: "Analyzing...",
      rediagnoseAI: "✓ Re-diagnose karein AI se",
      diagnoseWithAI: "🔍 AI Se Diagnose Karein",
      detectedIssue: "Detected Issue:",
      estCost: "Est. Cost:",
      urgencyLevel: "Urgency Level:",
      suggestedParts: "Suggested Parts/Tools:",
      aiParsingPreview: "AI PARSING PREVIEW",
      requiredText: "Zaroorat",
      analyzingText: "Text analyze ho rha hai...",
      serviceCategory: "Service Category",
      availableNearby: "Kareeb available abhi",
      noLiveProvidersAround: "Kareeb koi active {service} nahi hai. Simulation try karein!",
      available: "Available",
      searchingResponders: "Online responders dhoond rahe hain...",
      sendingPing: "5km radius mein active {service}s ko ping bhej rahe hain.",
      cancelRequest: "Request Cancel Karein",
      providerAccepted: "Provider ne Accept kiya!",
      headingToCoords: "Apki location ki taraf aa rahe hain.",
      experienceLabel: "Experience:",
      years: "saal",
      distanceApproaching: "Distance: Aa rahe hain...",
      attachedPhoto: "ATTACHED ISSUE PHOTO",
      yourVoiceRequest: "🎙️ APKI VOICE REQUEST",
      rateNegotiation: "💲 RATE NEGOTIATION",
      rateLocked: "✅ Rate Lock hogya at",
      providerProposedRate: "Provider ne rate propose kiya:",
      waitingProviderResponse: "Provider ke reply ka wait hai, offer:",
      counterProposePlaceholder: "Apna rate propose karein...",
      sendOffer: "Offer Bhejein",
      partsInvoice: "🛠️ PARTS INVOICE",
      approvalRequired: "APPROVAL REQUIRED",
      partsTotalLabel: "Parts Total:",
      approveAndPay: "Approve & Pay",
      completedJobs: "Completed Jobs",
      avgRating: "Avg Rating",
      simulatedEarnings: "Simulated Earnings",
      totalBookings: "Total Bookings",
      avgRatingGiven: "Avg Rating Diya",
      onlineStatus: "ONLINE",
      offlineStatus: "OFFLINE",
      rankText: "Rank",
      xpToLevel: "XP Level Up ke liye",
      noHistory: "Koi service request history nahi mili.",
      emergencyServiceRequest: "Emergency service request",
      statusAccepted: "Accepted",
      statusCancelled: "Cancelled",
      statusPending: "Pending",
      statusRating: "Rating",
      aboutTitle: "Servio Ke Baare Mein",
      aboutSubtitle: "Har ghar aur karobar ke liye ek behtar local service concierge.",
      aboutDesc: "Servio customers aur kareeb tareen trusted providers ko modern booking, tracking, aur communication tools ke sath ek premium dashboard ke andar lata hai.",
      aboutMission: "Hamara Mission",
      aboutMissionDesc: "Local service delivery ko fast, transparent aur reliable banayein.",
      aboutVision: "Hamara Vision",
      aboutVisionDesc: "Har user ko confidence aur clarity ke sath requests manage karne ke kabil banayein.",
      aboutForProviders: "Providers Ke Liye",
      aboutForProvidersDesc: "Visible rehne, kaam jaldi accept karne, aur live availability manage karne ke tools.",
      aboutWhyChoose: "Customers Servio kyun choose karte hain",
      aboutCtaItem1: "Verified kareeb tareen professionals",
      aboutCtaItem2: "Smart routing aur request tracking",
      aboutCtaItem3: "Asan mobile-friendly interface",
      aboutCtaItem4: "Instant status notifications",
      aboutHowItWorks: "Yeh kaise kaam karta hai",
      aboutStep1Title: "Apni Request Send Karein",
      aboutStep1Desc: "Apne maslay ki details likhein aur service category select karein.",
      aboutStep2Title: "Providers Se Match Karein",
      aboutStep2Desc: "Hum kareeb tareen qualified providers ko foran dhundte hain.",
      aboutStep3Title: "Confirm & Track",
      aboutStep3Desc: "Request ki progress dekhein, providers se chat karein, aur kaam khatam karein.",
      requestsTitle: "Service Logs & Portal",
      requestsSubtitle: "Active aur historical requests ko monitor, manage, aur inspect karein.",
      requestsAllRecords: "All Request Records",
      requestsTotalCount: "Total requests",
      colDate: "Date",
      colUrgency: "Urgency",
      colPrice: "Price",
      colActions: "Actions",
      noRequestsFound: "Koi request ya booking nahi mili. Nayi search start karne ke liye \"Home\" pe click karein.",
      notLocked: "Not locked",
      historical: "Historical",
      goToActiveConsole: "Active Console Pe Jayein",
      authHeroDesc: "Real-Time Local Service Concierge",
      authLabelEmail: "Email Address",
      authLabelPassword: "Password",
      authLabelConfirmPassword: "Confirm Password",
      authLabelFullName: "Full Name",
      authLabelPhone: "Phone Number",
      authLabelSignUpAs: "Sign up as",
      authLabelSelectSkill: "Select Main Skill",
      authLabelExperience: "Years of Experience",
      authBtnLogin: "Login",
      authBtnCreateAccount: "Create Account",
      authBtnForgot: "Forgot Password?",
      authBtnBackLogin: "Back to Login",
      authBtnSendOtp: "Send OTP Code",
      authBtnResetPassword: "Reset Password",
      authBtnVerifyOtp: "Verify OTP",
      authBtnCancelBackLogin: "Cancel & Back to Login",
      authTextDontHaveAccount: "Don't have an account?",
      authTextAlreadyHaveAccount: "Already have an account?",
      authLinkSignUp: "Sign Up",
      authLinkLogIn: "Log In",
      authLabel6DigitOtp: "6-Digit OTP Code",
      authLabelNewPassword: "New Password",
      authSimulatedEmailSent: "Simulated Email Sent!",
      authSimulatedOtpNotice: "Since SMTP credentials are not configured in backend/.env, you can view the email online:",
      authSimulatedOtpClick: "Click Here to Open simulated Ethereal Inbox & View OTP",
      authResetPasswordFor: "Resetting password for:",
      authEmailVerifyPrompt: "Please verify your email address to complete registration.",
      authPasswordLengthRule: "Password must be at least 8 characters long and contain at least 1 numeric character and 1 special character (e.g. @, #, $, % etc.).",
      authPasswordRule: "Password must contain at least 1 numeric character and 1 special character (e.g. @, #, $, % etc.)."
    }
  };

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
  // AC Mechanic
  { id: 'ac_gas', category: 'AC mechanic', name: 'AC Gas Refilling', price: 4500, duration: 60, icon: '❄️' },
  { id: 'ac_service', category: 'AC mechanic', name: 'Master Servicing', price: 1500, duration: 45, icon: '🧼' },
  { id: 'ac_cap', category: 'AC mechanic', name: 'Capacitor Replacement', price: 1800, duration: 30, icon: '🔌' },
  { id: 'ac_comp', category: 'AC mechanic', name: 'Compressor Repair/Install', price: 12000, duration: 120, icon: '⚙️' },
  
  // Electrician
  { id: 'elec_fan', category: 'electrician', name: 'Ceiling Fan Installation', price: 600, duration: 30, icon: '🪭' },
  { id: 'elec_short', category: 'electrician', name: 'Short Circuit Fault Finding', price: 1500, duration: 60, icon: '💥' },
  { id: 'elec_board', category: 'electrician', name: 'Switchboard Repair', price: 800, duration: 45, icon: '🎛️' },
  { id: 'elec_break', category: 'electrician', name: 'Circuit Breaker Replacement', price: 1000, duration: 30, icon: '⚡' },
  
  // Plumber
  { id: 'plum_leak', category: 'plumber', name: 'Water Pipe Leakage Repair', price: 1200, duration: 45, icon: '💧' },
  { id: 'plum_tap', category: 'plumber', name: 'Water Mixer / Tap Install', price: 700, duration: 30, icon: '🚰' },
  { id: 'plum_wc', category: 'plumber', name: 'Commode / WC Repair', price: 3500, duration: 90, icon: '🚽' },
  { id: 'plum_pump', category: 'plumber', name: 'Water Pump Donkey Motor Install', price: 3000, duration: 60, icon: '🛢️' },

  // Painter
  { id: 'paint_room', category: 'painter', name: 'Single Room Paint', price: 8000, duration: 240, icon: '🎨' },
  { id: 'paint_wall', category: 'painter', name: 'Accent Wall / Feature Wall', price: 3500, duration: 120, icon: '🖌️' },
  { id: 'paint_ext', category: 'painter', name: 'Exterior Wall Touch-up', price: 5000, duration: 180, icon: '🏠' },
  { id: 'paint_water', category: 'painter', name: 'Waterproof Coating', price: 6000, duration: 150, icon: '🛡️' },

  // Mason
  { id: 'mason_tile', category: 'mason', name: 'Floor Tile Fixing', price: 2500, duration: 120, icon: '🧱' },
  { id: 'mason_wall', category: 'mason', name: 'Wall Plastering / Repair', price: 3000, duration: 150, icon: '🪨' },
  { id: 'mason_bath', category: 'mason', name: 'Bathroom Renovation', price: 15000, duration: 480, icon: '🚿' },
  { id: 'mason_roof', category: 'mason', name: 'Roof Leak / Crack Repair', price: 4000, duration: 120, icon: '🏗️' },

  // Appliance Repair
  { id: 'app_wash', category: 'appliance repair', name: 'Washing Machine Repair', price: 2500, duration: 60, icon: '🫧' },
  { id: 'app_fridge', category: 'appliance repair', name: 'Refrigerator / Freezer Repair', price: 3000, duration: 90, icon: '🧊' },
  { id: 'app_micro', category: 'appliance repair', name: 'Microwave Oven Repair', price: 1800, duration: 45, icon: '📡' },
  { id: 'app_iron', category: 'appliance repair', name: 'Iron / Geyser Repair', price: 1200, duration: 40, icon: '♨️' },

  // Carpenter
  { id: 'carp_door', category: 'carpenter', name: 'Door Repair / Fitting', price: 2000, duration: 90, icon: '🚪' },
  { id: 'carp_furn', category: 'carpenter', name: 'Furniture Assembly', price: 1500, duration: 60, icon: '🪑' },
  { id: 'carp_cab', category: 'carpenter', name: 'Kitchen Cabinet Fixing', price: 4000, duration: 120, icon: '🗄️' },
  { id: 'carp_shelf', category: 'carpenter', name: 'Wall Shelf / Rack Install', price: 1000, duration: 30, icon: '📦' },

  // Car Mechanic
  { id: 'car_oil', category: 'car mechanic', name: 'Oil Change & Filter', price: 3000, duration: 45, icon: '🛢️' },
  { id: 'car_brake', category: 'car mechanic', name: 'Brake Pad Replacement', price: 4500, duration: 60, icon: '🛞' },
  { id: 'car_batt', category: 'car mechanic', name: 'Battery Jump / Replacement', price: 5000, duration: 30, icon: '🔋' },
  { id: 'car_ac', category: 'car mechanic', name: 'Car AC Servicing', price: 3500, duration: 90, icon: '❄️' },

  // Home Cleaning
  { id: 'clean_deep', category: 'cleaner', name: 'Deep Home Cleaning', price: 5000, duration: 180, icon: '🧹' },
  { id: 'clean_sofa', category: 'cleaner', name: 'Sofa / Carpet Cleaning', price: 3000, duration: 90, icon: '🛋️' },
  { id: 'clean_kitchen', category: 'cleaner', name: 'Kitchen Deep Clean', price: 2500, duration: 120, icon: '🍳' },
  { id: 'clean_bath', category: 'cleaner', name: 'Bathroom Sanitization', price: 1500, duration: 60, icon: '🚿' },

  // CCTV Installer
  { id: 'cctv_install', category: 'cctv installer', name: 'CCTV Camera Installation (per unit)', price: 3500, duration: 60, icon: '📹' },
  { id: 'cctv_dvr', category: 'cctv installer', name: 'DVR / NVR Setup', price: 5000, duration: 90, icon: '💾' },
  { id: 'cctv_wiring', category: 'cctv installer', name: 'Cable Wiring & Routing', price: 2000, duration: 120, icon: '🔗' },
  { id: 'cctv_repair', category: 'cctv installer', name: 'Camera Lens / Night Vision Repair', price: 2500, duration: 45, icon: '🔧' },

  // Solar Technician
  { id: 'solar_panel', category: 'solar technician', name: 'Solar Panel Installation', price: 15000, duration: 240, icon: '☀️' },
  { id: 'solar_inv', category: 'solar technician', name: 'Inverter Setup / Repair', price: 6000, duration: 90, icon: '🔌' },
  { id: 'solar_clean', category: 'solar technician', name: 'Panel Cleaning & Maintenance', price: 2000, duration: 60, icon: '🧽' },
  { id: 'solar_batt', category: 'solar technician', name: 'Battery Bank Wiring', price: 8000, duration: 120, icon: '🔋' }
];

function MainApp({ theme, setTheme, language, setLanguage }) {
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
  const [isPaying, setIsPaying] = useState(false);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [walletFlash, setWalletFlash] = useState(false);
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

  // History state & fetch helper
  const [requestHistory, setRequestHistory] = useState([]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/requests/history/${user.id}`);
      setRequestHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Cost Estimator state
  const [estimatorCategory, setEstimatorCategory] = useState('AC mechanic');
  const [selectedEstimatorItems, setSelectedEstimatorItems] = useState([]);

  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isInstantVoiceDispatching, setIsInstantVoiceDispatching] = useState(false);
  const isInstantVoiceDispatchRef = useRef(false);
  const [voiceAudio, setVoiceAudio] = useState(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mimeTypeRef = useRef('audio/webm');
  
  // Interactive checklist tracking state
  const [checkedChecklistItems, setCheckedChecklistItems] = useState({});
  
  // AI Diagnostics state
  const [aiDiagnosisReport, setAiDiagnosisReport] = useState(null);
  const [isDiagnosingImage, setIsDiagnosingImage] = useState(false);
  const [showScannerAnimation, setShowScannerAnimation] = useState(false);

  // Emergency SOS state
  const [showSOSSelector, setShowSOSSelector] = useState(false);

  // App Settings states

  const [enableAudioAlerts, setEnableAudioAlerts] = useState(() => {
    const stored = localStorage.getItem('enableAudioAlerts');
    return stored !== null ? stored === 'true' : true;
  });
  const [sosMatchRadius, setSosMatchRadius] = useState(() => {
    const stored = localStorage.getItem('sosMatchRadius');
    return stored !== null ? Number(stored) : 15;
  });
  const [simulationSpeed, setSimulationSpeed] = useState(() => {
    const stored = localStorage.getItem('simulationSpeed');
    return stored !== null ? Number(stored) : 5;
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);



  useEffect(() => {
    localStorage.setItem('enableAudioAlerts', String(enableAudioAlerts));
  }, [enableAudioAlerts]);

  useEffect(() => {
    localStorage.setItem('sosMatchRadius', String(sosMatchRadius));
  }, [sosMatchRadius]);

  useEffect(() => {
    localStorage.setItem('simulationSpeed', String(simulationSpeed));
  }, [simulationSpeed]);

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
        console.log('Speech recognition ended.');
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
      
      // Determine cross-browser mimeType support
      let mimeType = 'audio/webm';
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        mimeType = 'audio/aac';
        options = { mimeType: 'audio/aac' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
        options = { mimeType: 'audio/ogg' };
      }
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceAudio(reader.result); // Base64 representation of voice note
          
          if (isInstantVoiceDispatchRef.current) {
            isInstantVoiceDispatchRef.current = false;
            setIsInstantVoiceDispatching(false);
            
            // Auto dispatch booking!
            setRequestState('searching');
            props.showToast(TRANSLATIONS[language].aiVoiceDispatchProcessing || 'AI is transcribing and matching providers...', 'info');
            socket.emit('request:create', {
              customerId: user.id,
              serviceType: 'appliance repair', // Placeholder, backend AI parses the category
              description: 'AI Voice-to-Action Dispatched emergency request.',
              coordinates: [customerLocation[1], customerLocation[0]], // [lng, lat]
              image: null,
              voiceAudio: reader.result, // base64
              aiDiagnosis: null,
              isEmergency: true,
              sosMatchRadius: 15
            });
          }
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
      props.showToast('Microphone access is required to record voice notes.', 'warning');
    }
  };

  const startInstantVoiceDispatch = async () => {
    if (!customerLocation) {
      props.showToast(TRANSLATIONS[language].locationRequired || 'Please set your location first.', 'warning');
      return;
    }
    isInstantVoiceDispatchRef.current = true;
    setIsInstantVoiceDispatching(true);
    await startVoiceRecording();
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

  const handleToggleChecklistItem = (jobId, itemIndex) => {
    const key = `${jobId}-${itemIndex}`;
    setCheckedChecklistItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBookSelectedEstimatorItems = () => {
    if (selectedEstimatorItems.length === 0) return;
    const categories = [...new Set(selectedEstimatorItems.map(item => item.category))];
    const listNames = selectedEstimatorItems.map(item => item.name).join(', ');
    const totalPrice = selectedEstimatorItems.reduce((sum, item) => sum + item.price, 0);
    const totalDuration = selectedEstimatorItems.reduce((sum, item) => sum + item.duration, 0);
    
    setSelectedService(categories[0]);
    setRequestDescription(`Booking quote estimate for: ${listNames}.\nCategories: ${categories.join(', ')}.\nEstimated duration: ${totalDuration} mins.\nStandard Market Rate Quote: ${totalPrice} PKR.\n\nPlease confirm this request.`);
    setSelectedEstimatorItems([]);
    setActivePage('requests');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        props.showToast("Please upload an image smaller than 15MB.", "warning");
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
  const [providerServiceType, setProviderServiceType] = useState(providerProfile?.serviceType || ['AC mechanic']);
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
        props.showToast("Could not access camera. Please check permissions or select a file instead.", "error");
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
        props.showToast("Please upload an image smaller than 15MB.", "warning");
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
      props.showToast("Name and Phone are required.", "warning");
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
        serviceType: selectedRole === 'provider' ? providerServiceType : undefined
      });
      updateUserProfile(res.data.user);
      if (res.data.providerProfile) {
        updateProviderProfile(res.data.providerProfile);
      } else if (res.data.user.role !== 'provider') {
        updateProviderProfile(null);
      }
      setIsProfileModalOpen(false);
      props.showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error(err);
      props.showToast(err.response?.data?.error || "Failed to update profile settings.", "error");
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

  // Bidding & Negotiation state/actions
  const [proposedBid, setProposedBid] = useState('');

  const handleProposePrice = (priceVal) => {
    const val = Number(priceVal || proposedBid);
    if (!val || isNaN(val)) {
      props.showToast("Please enter a valid amount in PKR.", "warning");
      return;
    }
    const reqId = user.role === 'customer' ? activeRequest?.id : activeJob?.id;
    if (!reqId) return;

    socket.emit('request:propose_price', {
      requestId: reqId,
      proposedPrice: val,
      proposedBy: user.role
    });

    if (user.role === 'provider') {
      setActiveJob(prev => prev ? ({
        ...prev,
        negotiation: {
          proposedPrice: val,
          proposedBy: 'provider',
          status: 'pending'
        }
      }) : null);
    } else {
      setCustomerRequests(prev => prev.map(r => r.id === reqId ? {
        ...r,
        negotiation: {
          proposedPrice: val,
          proposedBy: 'customer',
          status: 'pending'
        }
      } : r));
    }

    setProposedBid('');
    props.showToast(`Proposed bid of ${val} PKR sent.`, 'success');
  };

  const handleRespondPrice = (action) => {
    const reqId = user.role === 'customer' ? activeRequest?.id : activeJob?.id;
    if (!reqId) return;

    socket.emit('request:respond_price', {
      requestId: reqId,
      action
    });
  };

  // Parts Invoicing actions
  const [partName, setPartName] = useState('');
  const [partPrice, setPartPrice] = useState('');

  const handleSendPartsInvoice = (partsArray) => {
    const reqId = activeJob?.id;
    if (!reqId) return;

    socket.emit('parts:request', {
      requestId: reqId,
      parts: partsArray
    });

    props.showToast("Parts list submitted to customer.", "success");
  };

  const handleRespondParts = (action) => {
    const reqId = activeRequest?.id;
    if (!reqId) return;

    socket.emit('parts:respond', {
      requestId: reqId,
      action
    });
  };

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
      fetchHistory();
      axios.get(`http://localhost:5000/api/requests/active-job/${user.id}`)
        .then(res => {
          if (res.data.job) {
            const job = res.data.job;
            if (user.role === 'customer') {
              setCustomerRequests(prev => {
                if (!prev.some(r => r.id === job.id)) {
                  return [...prev, job];
                }
                return prev.map(r => r.id === job.id ? job : r);
              });
              setSelectedRequestId(job.id);
              if (job.status === 'pending') {
                setRequestState('searching');
              } else if (job.status === 'accepted') {
                setRequestState('matched');
                setMatchedProvider(job.provider);
                setChatMessages(job.messages || []);
              } else if (job.status === 'checkout') {
                setRequestState('checkout');
                setMatchedProvider(job.provider);
                setChatMessages(job.messages || []);
              } else if (job.status === 'rating') {
                setRequestState('rating');
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

    socket.on('request:completed', ({ requestId }) => {
      fetchHistory();
      if (user?.role === 'customer') {
        setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'checkout' } : r));
        if (selectedRequestIdRef.current === requestId) {
          setRequestState('checkout');
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

    socket.on('request:price_proposed', ({ requestId, negotiation }) => {
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, negotiation } : r));
      if (activeJob && activeJob.id === requestId) {
        setActiveJob(prev => ({ ...prev, negotiation }));
      }
    });

    socket.on('request:price_locked', ({ requestId, negotiation, price }) => {
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, negotiation, price } : r));
      if (activeJob && activeJob.id === requestId) {
        setActiveJob(prev => ({ ...prev, negotiation, price }));
      }
      props.showToast(`Rate locked: ${price} PKR!`, 'success');
    });

    socket.on('request:copilot_analysis', ({ requestId, copilotAnalysis }) => {
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? {
        ...r,
        negotiation: {
          ...r.negotiation,
          copilotAnalysis
        }
      } : r));
      if (activeJob && activeJob.id === requestId) {
        setActiveJob(prev => ({
          ...prev,
          negotiation: {
            ...prev.negotiation,
            copilotAnalysis
          }
        }));
      }
    });

    socket.on('parts:incoming', ({ requestId, partsList }) => {
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, partsList } : r));
      if (activeJob && activeJob.id === requestId) {
        setActiveJob(prev => ({ ...prev, partsList }));
      }
      if (user?.role === 'customer') {
        props.showToast('Technician submitted parts invoice for your approval.', 'info');
      }
    });

    socket.on('parts:updated', ({ requestId, partsList, partsTotal, price }) => {
      setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, partsList, partsTotal, price } : r));
      if (activeJob && activeJob.id === requestId) {
        setActiveJob(prev => ({ ...prev, partsList, partsTotal, price }));
      }
      props.showToast(`Parts invoice updated! New total: ${price} PKR.`, 'success');
    });

    socket.on('provider:levelup', ({ level, badge, xp }) => {
      props.showToast(`🎉 LEVEL UP! You are now Level ${level} (${badge})!`, 'success');
      if (providerProfile) {
        updateProviderProfile({
          ...providerProfile,
          level,
          badge,
          xp
        });
      }
    });

    socket.on('request:cancelled', ({ requestId }) => {
      props.showToast('The request session was cancelled/ended.', 'warning');
      if (user?.role === 'customer') {
        setCustomerRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r));
        if (selectedRequestIdRef.current === requestId) {
          setRequestState('idle');
          setMatchedProvider(null);
          setSelectedRequestId(null);
        }
      } else {
        setActiveJob(null);
        setIncomingRequest(null);
        setChatMessages([]);
      }
    });

    socket.on('request:error', (data) => {
      props.showToast(data.message, 'error');
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
      socket.off('request:price_proposed');
      socket.off('request:price_locked');
      socket.off('request:copilot_analysis');
      socket.off('parts:incoming');
      socket.off('parts:updated');
      socket.off('provider:levelup');
      socket.off('request:cancelled');
    };
  }, [socket, user, isAvailable, activeJob, providerProfile]);

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

  const handleCancelRequest = () => {
    const reqId = user.role === 'customer' ? activeRequest?.id : activeJob?.id;
    if (!reqId) return;

    if (window.confirm("Are you sure you want to cancel this booking and go back to the map?")) {
      socket.emit('request:cancel', { requestId: reqId, role: user.role });
    }
  };

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
        customerName: user.name,
        requestId: selectedRequestId
      });
      setRatingSubmitted(true);
      fetchHistory();
      // After a brief pause show the final thank-you screen
      setTimeout(() => {
        setCustomerRequests(prev => prev.filter(r => r.id !== selectedRequestId));
        setSelectedRequestId(null);
        setRequestState('idle');
        setMatchedProvider(null);
        setSelectedRating(0);
        setReviewText('');
      }, 1800);
    } catch (err) {
      console.error('Rating submission error:', err);
      setCustomerRequests(prev => prev.filter(r => r.id !== selectedRequestId));
      setSelectedRequestId(null);
      setRequestState('idle');
      setMatchedProvider(null);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!activeRequest) return;
    setIsPaying(true);
    try {
      const res = await axios.post('http://localhost:5000/api/requests/pay', {
        requestId: activeRequest.id,
        customerId: user.id
      });
      if (res.data.success) {
        showToast('Payment successful via simulated wallet!', 'success');
        updateUserProfile({ ...user, walletBalance: res.data.walletBalance });
        
        // Advance requestState to rating phase
        setCustomerRequests(prev => prev.map(r => r.id === activeRequest.id ? { ...r, status: 'rating' } : r));
        setRequestState('rating');
        setSelectedRating(0);
        setReviewText('');
        setRatingSubmitted(false);
      }
    } catch (err) {
      console.error('Invoice payment failed:', err);
      showToast(err.response?.data?.error || 'Failed to process payment. Please verify wallet balance.', 'error');
    } finally {
      setIsPaying(false);
    }
  };

  const handleNavigateToWallet = () => {
    setActivePage('settings');
    setWalletFlash(true);
    setTimeout(() => {
      document.getElementById('wallet-card-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    setTimeout(() => {
      setWalletFlash(false);
    }, 2000);
  };

  const fetchAdminMetrics = async () => {
    setIsAdminLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/requests/admin/metrics');
      setAdminMetrics(res.data);
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      showToast('Failed to load admin metrics.', 'error');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await axios.post('http://localhost:5000/api/requests/admin/cancel', { requestId });
      if (res.data.success) {
        showToast('Request successfully cancelled.', 'success');
        fetchAdminMetrics();
      }
    } catch (err) {
      showToast('Failed to cancel request.', 'error');
    }
  };

  useEffect(() => {
    if (activePage === 'admin' && user?.role === 'admin') {
      fetchAdminMetrics();
    }
  }, [activePage, user]);

  const getCategoryName = (cat) => {
    if (!cat) return '';
    const normalizedCat = cat.toLowerCase().trim();
    if (language === 'ur') {
      const urCat = {
        'ac mechanic': 'اے سی مکینک',
        'electrician': 'الیکٹریشن',
        'plumber': 'پلمبر',
        'painter': 'پینٹر',
        'mason': 'معمار (Mason)',
        'mason/tile work': 'معمار (Mason)',
        'appliance repair': 'ایپلائینس ریپیئر',
        'carpenter': 'بڑھئی (Carpenter)',
        'car mechanic': 'کار مکینک',
        'car mechanic (mobile)': 'کار مکینک',
        'cleaner': 'گھر کی صفائی',
        'home cleaning': 'گھر کی صفائی',
        'cctv installer': 'سی سی ٹی وی انسٹالر',
        'solar tech': 'سولر ٹیکنیشن',
        'solar panel tech': 'سولر ٹیکنیشن',
        'solar technician': 'سولر ٹیکنیشن'
      };
      return urCat[normalizedCat] || cat;
    }
    if (language === 'roman') {
      const romCat = {
        'ac mechanic': 'AC Mechanic',
        'electrician': 'Electrician',
        'plumber': 'Plumber',
        'painter': 'Painter',
        'mason': 'Mason',
        'mason/tile work': 'Mason',
        'appliance repair': 'Appliance Repair',
        'carpenter': 'Carpenter',
        'car mechanic': 'Car Mechanic',
        'car mechanic (mobile)': 'Car Mechanic',
        'cleaner': 'Home Cleaning',
        'home cleaning': 'Home Cleaning',
        'cctv installer': 'CCTV Installer',
        'solar tech': 'Solar Tech',
        'solar panel tech': 'Solar Tech',
        'solar technician': 'Solar Technician'
      };
      return romCat[normalizedCat] || cat;
    }
    const prettyMap = {
      'ac mechanic': 'AC Mechanic',
      'electrician': 'Electrician',
      'plumber': 'Plumber',
      'painter': 'Painter',
      'mason': 'Mason/Tile work',
      'mason/tile work': 'Mason/Tile work',
      'appliance repair': 'Appliance Repair',
      'carpenter': 'Carpenter',
      'car mechanic': 'Car Mechanic (Mobile)',
      'car mechanic (mobile)': 'Car Mechanic (Mobile)',
      'cleaner': 'Home Cleaning',
      'home cleaning': 'Home Cleaning',
      'cctv installer': 'CCTV Installer',
      'solar tech': 'Solar Panel Tech',
      'solar panel tech': 'Solar Panel Tech',
      'solar technician': 'Solar Panel Tech'
    };
    return prettyMap[normalizedCat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
  };

  const getServiceName = (name) => {
    if (language === 'ur') {
      const urName = {
        'AC Filter Cleaning': 'اے سی فلٹر کی صفائی',
        'AC Gas Refill': 'اے سی گیس ریفل',
        'AC Installation': 'اے سی کی تنصیب',
        'Ceiling Fan Repair': 'چھت کے پنکھے کی مرمت',
        'Short Circuit Fixing': 'شارٹ سرکٹ کی درستگی',
        'Switchboard Upgrade': 'سوئچ بورڈ اپ گریڈ',
        'Water Tap Replacement': 'پانی کے نل کی تبدیلی',
        'Drain Blockage Removal': 'ڈرین بلاکیج کا خاتمہ',
        'Water Pump Repair': 'پانی کے پمپ کی مرمت'
      };
      return urName[name] || name;
    }
    return name;
  };


  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => {
      setNewsletterSubscribed(false);
    }, 4000);
  };

  // --- SIMULATION LOGIC ---
  const handleStartSimulation = () => {
    if (isSimulating) {
      // Stop simulation
      setIsSimulating(false);
      clearInterval(simulationIntervalRef.current);
      setSimulatedProviders([]);
      if (socket) socket.emit('simulation:stop_providers');
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
        experience: Math.floor(Math.random() * 10) + 2,
        reviews: seedReviewsList[idx % seedReviewsList.length]
      };
    });

    setSimulatedProviders(items);
    if (socket) socket.emit('simulation:start_providers', items);

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

  // Sync simulated provider locations with backend in real-time
  useEffect(() => {
    if (isSimulating && simulatedProviders.length > 0 && socket) {
      socket.emit('simulation:update_locations', simulatedProviders);
    }
  }, [simulatedProviders, isSimulating, socket]);

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
        handleNavigateToWallet={handleNavigateToWallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        setIsProfileModalOpen={setIsProfileModalOpen}
        logout={logout}
        language={language}
        translations={TRANSLATIONS}
      />

      <main className="app-layout">
        {activePage === 'home' ? (
          <section 
            className="glass page-section home-section"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.94)), url("/home_bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ maxWidth: '540px' }}>
                <span className="eyebrow" style={{ color: 'var(--color-primary)' }}>{TRANSLATIONS[language].heroEyebrow || "New Look — Elevated Workflow"}</span>
                <h2 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{TRANSLATIONS[language].heroTitle || "Smart local service management for customers and providers."}</h2>
                <p className="hero-copy" style={{ color: '#cbd5e1' }}>{TRANSLATIONS[language].heroDesc || "A modern command center for booking trusted professionals, monitoring service requests, and staying connected with verified local providers."}</p>
                <div className="hero-actions">
                  <button onClick={() => setActivePage('booking')} className="btn-primary">{user?.role === 'provider' ? 'Open Active Console' : 'Book Service'}</button>
                  <button onClick={() => setActivePage('dashboard')} className="btn-secondary">Go to Dashboard</button>
                </div>
              </div>
              <div className="hero-card" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="stats-grid">
                  <div className="stat-card" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '11px', display: 'block' }}>{TRANSLATIONS[language].activeProviders}</span>
                    <h3 style={{ color: '#ffffff', margin: '4px 0 0 0' }}>{displayedProviders.length}</h3>
                  </div>
                  <div className="stat-card" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '11px', display: 'block' }}>{TRANSLATIONS[language].matchedJobs}</span>
                    <h3 style={{ color: '#ffffff', margin: '4px 0 0 0' }}>{matchedProvider ? '1 active' : 'No matches'}</h3>
                  </div>
                  <div className="stat-card" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '11px', display: 'block' }}>{TRANSLATIONS[language].serviceTypes}</span>
                    <h3 style={{ color: '#ffffff', margin: '4px 0 0 0' }}>10+</h3>
                  </div>
                  <div className="stat-card" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '11px', display: 'block' }}>{TRANSLATIONS[language].liveRequests}</span>
                    <h3 style={{ color: '#ffffff', margin: '4px 0 0 0' }}>{requestState === 'searching' ? 'Processing' : requestState === 'matched' ? 'Matched' : 'Idle'}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-grid">
              <div className="feature-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].instantMatching || "Instant Matching"}</h4>
                <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].instantMatchingDesc || "Submit a request and get matched with the nearest available qualified provider instantly."}</p>
              </div>
              <div className="feature-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].verifiedProfessionals || "Verified Professionals"}</h4>
                <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].verifiedProfessionalsDesc || "All provider profiles include service specialization, contact details, and active status."}</p>
              </div>
              <div className="feature-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].smartTracking || "Smart Request Tracking"}</h4>
                <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].smartTrackingDesc || "Follow request progress, accept offers, and complete jobs from a unified dashboard."}</p>
              </div>
            </div>

            <div className="service-showcase" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
              <div className="showcase-header">
                <h3 style={{ color: '#ffffff', margin: 0 }}>{TRANSLATIONS[language].popularCategories}</h3>
                <span style={{ color: '#cbd5e1' }}>{TRANSLATIONS[language].tapCategoryExplore || "Tap any category to explore services"}</span>
              </div>
              <div className="category-grid" style={{ marginTop: '16px' }}>
                {['AC Mechanic', 'Electrician', 'Plumber', 'Painter', 'Car Mechanic', 'CCTV Installer', 'Home Cleaning', 'Solar Tech'].map((category) => {
                  const keyMap = {
                    'AC Mechanic': 'AC mechanic',
                    'Electrician': 'electrician',
                    'Plumber': 'plumber',
                    'Painter': 'painter',
                    'Car Mechanic': 'car mechanic',
                    'CCTV Installer': 'cctv installer',
                    'Home Cleaning': 'home cleaning',
                    'Solar Tech': 'solar tech'
                  };
                  const categoryKey = keyMap[category] || category.toLowerCase();
                  return (
                    <div 
                      key={category} 
                      className="category-chip" 
                      onClick={() => {
                        setSelectedService(categoryKey);
                        setActivePage('booking');
                      }}
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}
                    >
                      {getCategoryName(categoryKey)}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : activePage === 'dashboard' ? (
          <section className="glass page-section dashboard-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{TRANSLATIONS[language].dashboardOverview || "Dashboard Overview"}</span>
                <h2>{TRANSLATIONS[language].dashboardOverviewSub || "Review your service history, performance metrics, and records."}</h2>
              </div>
              {user?.role === 'customer' ? (
                <button onClick={() => setActivePage('requests')} className="btn-secondary">{TRANSLATIONS[language].openRequests || "Open Requests"}</button>
              ) : (
                <button onClick={() => setActivePage('requests')} className="btn-secondary">Active Console</button>
              )}
            </div>

            {user?.role === 'provider' ? (
              /* ================= PROVIDER DASHBOARD VIEW ================= */
              <>
                <div className="dashboard-summary-grid">
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].completedJobs || "Completed Jobs"}</span>
                    <h3>{requestHistory.filter(r => r.status === 'completed').length || providerProfile?.totalJobs || 0}</h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].avgRating || "Average Rating"}</span>
                    <h3>{providerProfile?.rating ? `${providerProfile.rating} ⭐` : '—'}</h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].simulatedEarnings || "Simulated Earnings"}</span>
                    <h3>
                      {((requestHistory.filter(r => r.status === 'completed').length || providerProfile?.totalJobs || 0) * 1500).toLocaleString()} PKR
                    </h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].dutyStatus || "Duty Status"}</span>
                    <h3>{isAvailable ? (TRANSLATIONS[language].onlineStatus || 'ONLINE') : (TRANSLATIONS[language].offlineStatus || 'OFFLINE')}</h3>
                  </div>
                </div>

                {/* Provider Level & Badge Section */}
                <div className="glass-glow-blue" style={{
                  padding: '20px',
                  borderRadius: '24px',
                  border: '1px solid var(--border-color)',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                    border: '2px solid white'
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1 }}>Lvl</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', lineHeight: 1 }}>{providerProfile?.level || 1}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>
                        {TRANSLATIONS[language].rankText || "Rank"}: <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase' }}>{providerProfile?.badge || 'Rookie'}</span>
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {(providerProfile?.xp || 0) % 500} / 500 {(language === 'ur' ? 'ایکس پی اگلے لیول' : language === 'roman' ? 'XP Agle Level' : 'XP to Level')} {(providerProfile?.level || 1) + 1}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${((providerProfile?.xp || 0) % 500) / 5}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                </div>

                <div className="dashboard-history">
                  <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <div>
                        <h3>Job History & Feedback</h3>
                        <p className="hero-copy">Feedback, ratings, and reviews from your service assignments.</p>
                      </div>
                    </div>

                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Task Description</th>
                          <th>Rating & Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestHistory.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                              No completed jobs history found yet.
                            </td>
                          </tr>
                        ) : (
                          requestHistory.map((item) => (
                            <tr key={item.id}>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ fontWeight: 'bold' }}>{item.counterpartyName || 'Anonymous Customer'}</td>
                              <td>{item.description || 'Emergency service call'}</td>
                              <td>
                                {item.rating ? (
                                  <div>
                                    <span style={{ color: '#facc15', fontSize: '13px', display: 'block' }}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                                    {item.review && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>"{item.review}"</span>}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>— No review left</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* ================= CUSTOMER DASHBOARD VIEW ================= */
              <>
                <div className="dashboard-summary-grid">
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].activeProviders || "Active Providers"}</span>
                    <h3>{displayedProviders.length}</h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].liveRequests || "Live Requests"}</span>
                    <h3>{requestState === 'idle' ? 0 : 1}</h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].totalBookings || "Total Bookings"}</span>
                    <h3>{requestHistory.length}</h3>
                  </div>
                  <div className="stat-card">
                    <span>{TRANSLATIONS[language].avgRatingGiven || "Average Rating Given"}</span>
                    <h3>
                      {(() => {
                        const rated = requestHistory.filter(r => r.rating);
                        if (rated.length === 0) return '—';
                        const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
                        return `${avg.toFixed(1)} ⭐`;
                      })()}
                    </h3>
                  </div>
                </div>

                <div className="dashboard-history">
                  <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <div>
                        <h3>{TRANSLATIONS[language].recentHistory}</h3>
                        <p className="hero-copy">{TRANSLATIONS[language].recentHistorySub || "Recent service interactions and the latest provider assignments."}</p>
                      </div>
                      <button onClick={() => setActivePage('requests')} className="btn-primary">{TRANSLATIONS[language].viewLiveRequests || "View Live Requests"}</button>
                    </div>

                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>{TRANSLATIONS[language].colRequest || "Request"}</th>
                          <th>{TRANSLATIONS[language].colProvider || "Provider"}</th>
                          <th>{TRANSLATIONS[language].colCategory || "Category"}</th>
                          <th>{TRANSLATIONS[language].colStatus || "Status"}</th>
                          <th>{TRANSLATIONS[language].colRating || "Rating"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestHistory.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                              {TRANSLATIONS[language].noHistory || "No service request history found yet."}
                            </td>
                          </tr>
                        ) : (
                          requestHistory.map((item) => (
                            <tr key={item.id}>
                              <td>{item.description || (TRANSLATIONS[language].emergencyServiceRequest || 'Emergency service request')}</td>
                              <td style={{ fontWeight: 'bold' }}>{item.counterpartyName || (TRANSLATIONS[language].pendingMatch || 'Pending Match')}</td>
                              <td>{getCategoryName(item.serviceType)}</td>
                              <td>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  backgroundColor: item.status === 'completed' ? 'rgba(34, 197, 94, 0.15)' : item.status === 'accepted' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: item.status === 'completed' ? '#10b981' : item.status === 'accepted' ? '#3b82f6' : '#ef4444',
                                  textTransform: 'uppercase'
                                }}>
                                  {TRANSLATIONS[language]['status' + item.status.charAt(0).toUpperCase() + item.status.slice(1)] || item.status}
                                </span>
                              </td>
                              <td>
                                {item.rating ? (
                                  <div>
                                    <span style={{ color: '#facc15', fontSize: '13px' }}>{'★'.repeat(item.rating)}</span>
                                    {item.review && <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{item.review}"</span>}
                                  </div>
                                ) : item.status === 'completed' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedRequestId(item.id);
                                      // Find matched provider profile
                                      if (item.providerId) {
                                        axios.get(`http://localhost:5000/api/providers/${item.providerId}`)
                                          .then(res => {
                                            setMatchedProvider(res.data);
                                            setRequestState('rating');
                                            setSelectedRating(0);
                                            setReviewText('');
                                            setRatingSubmitted(false);
                                            setActivePage('requests');
                                          })
                                          .catch(err => {
                                            console.error('Error fetching provider details:', err);
                                            // Fallback minimal
                                            setMatchedProvider({ id: item.providerId, name: item.counterpartyName });
                                            setRequestState('rating');
                                            setSelectedRating(0);
                                            setReviewText('');
                                            setRatingSubmitted(false);
                                            setActivePage('requests');
                                          });
                                      }
                                    }}
                                    style={{
                                      padding: '3px 8px',
                                      fontSize: '10px',
                                      backgroundColor: 'var(--color-primary)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Rate Now
                                  </button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        ) : activePage === 'estimator' ? (
          <section className="glass page-section estimator-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{TRANSLATIONS[language].estimatorTitle || "Interactive Pricing & Calculator"}</span>
                <h2>{TRANSLATIONS[language].estimatorSubtitle || "Get instant cost quotes and duration estimates for standard repairs."}</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px', alignItems: 'start' }} className="estimator-grid">
              
              {/* Left Column: Category selector and service list */}
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                  {[...new Set(ESTIMATED_SERVICES.map(s => s.category))].map(cat => {
                    const catItemCount = selectedEstimatorItems.filter(i => i.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setEstimatorCategory(cat)}
                        className={`nav-pill ${estimatorCategory === cat ? 'active' : ''}`}
                        style={{ position: 'relative', fontSize: '12px' }}
                      >
                        {getCategoryName(cat)}
                        {catItemCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'var(--color-secondary)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>{catItemCount}</span>
                        )}
                      </button>
                    );
                  })}
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
                            <strong style={{ display: 'block', fontSize: '14px' }}>{getServiceName(item.name)}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⏱️ {TRANSLATIONS[language].estimatorDurationLabel || "Est. Duration:"} {item.duration} {TRANSLATIONS[language].minsLabel || "mins"}</span>
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
                  {TRANSLATIONS[language].estimatorSummaryTitle || "📋 Service Estimate Summary"}
                </h3>
                
                {selectedEstimatorItems.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '13px' }}>{TRANSLATIONS[language].estimatorSummaryEmpty || "Select services on the left to build your custom repair quote."}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {selectedEstimatorItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{getServiceName(item.name)}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{getCategoryName(item.category)}</span>
                          </div>
                          <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.price} PKR</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>{TRANSLATIONS[language].estimatorEstTime || "Estimated Work Time:"}</span>
                        <span style={{ fontWeight: '500' }}>
                          {selectedEstimatorItems.reduce((sum, item) => sum + item.duration, 0)} {TRANSLATIONS[language].minsLabel || "mins"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', marginTop: '4px' }}>
                        <span>{TRANSLATIONS[language].estimatorTotalQuote || "Total Quote:"}</span>
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
                      {TRANSLATIONS[language].estimatorBookQuote || "⚡ Book this Quote"}
                    </button>
                    
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}>
                      {TRANSLATIONS[language].estimatorNotice || "Rates are standard diagnostic estimates. Final pricing subject to repair complexity."}
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
                <span className="eyebrow">{language === 'ur' ? 'سسٹم سیٹنگز اور پروفائل' : language === 'roman' ? 'System Settings & Profile' : 'SYSTEM SETTINGS & PROFILE'}</span>
                <h2>{language === 'ur' ? 'اپنے پروفائل کی ترجیحات، مقامی ایپ کے برتاؤ اور تھیم کو ترتیب دیں۔' : language === 'roman' ? 'Apne profile preferences, local app behavior, aur theme ko configure karein.' : 'Configure your profile preferences, local app behavior, and theme.'}</h2>
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
                  }}>{user?.role === 'provider' ? (TRANSLATIONS[language].providerView || 'Provider') : (TRANSLATIONS[language].customer || 'Customer')}</span>
                </div>

                {/* Info and stats summary */}
                <div className="glass" style={{ padding: '16px', borderRadius: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{language === 'ur' ? 'اکاؤنٹ کی حالت:' : language === 'roman' ? 'Account Status:' : 'Account Status:'}</strong> {language === 'ur' ? 'فعال' : 'Active'}</p>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{language === 'ur' ? 'موجودہ زبان:' : language === 'roman' ? 'Current Language:' : 'Current Language:'}</strong> {language === 'en' ? 'English' : language === 'ur' ? 'Urdu (اردو)' : 'Roman Urdu'}</p>
                  <p style={{ margin: 0 }}><strong>{language === 'ur' ? 'موجودہ تھیم:' : language === 'roman' ? 'Current Theme:' : 'Current Theme:'}</strong> {theme.toUpperCase()}</p>
                </div>
              </div>

              {/* Right Column: Settings Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Profile Settings Form */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👤 {TRANSLATIONS[language].profileSettings || "Profile Settings"}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].fullName || "Full Name"}</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].phoneNumber || "Phone Number"}</label>
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        style={{ fontSize: '13px' }}
                      />
                    </div>

                    {/* Profile Picture Upload & Camera Capture */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].profilePicLabel || "Profile Picture"}</label>
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
                          📁 {TRANSLATIONS[language].chooseFile || "Choose File"}
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
                            background: 'var(--bg-secondary)',
                            fontWeight: '600',
                            minHeight: 'unset',
                            boxShadow: 'none'
                          }}
                        >
                          📷 {TRANSLATIONS[language].takePhoto || "Take Photo"}
                        </button>
                      </div>
                    </div>

                    {/* Role Specific settings */}
                    {user?.role === 'provider' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].offeredServices || "Offered Specialist Services"}</label>
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
                                   background: active ? 'var(--color-primary)' : 'transparent',
                                   color: active ? 'white' : 'var(--text-muted)',
                                   cursor: 'pointer',
                                   minHeight: 'unset',
                                   boxShadow: 'none'
                                 }}
                              >
                                {getCategoryName(trade)}
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
                      {isEditSaving ? <Loader2 size={14} className="animate-spin" /> : '✓'} {TRANSLATIONS[language].saveProfileBtn || "Save Profile Details"}
                    </button>
                  </div>
                </div>

                {/* 2. Appearance & Language */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>🎨 {language === 'ur' ? 'ظاہری شکل اور زبان' : language === 'roman' ? 'Appearance & Language' : 'Appearance & Language'}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Theme Selector */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        {language === 'ur' ? 'ایپ تھیم منتخب کریں' : language === 'roman' ? 'App Theme select karein' : 'Choose App Theme'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'light', label: language === 'ur' ? '☀️ لائٹ تھیم' : language === 'roman' ? '☀️ Light Theme' : '☀️ Light Theme' },
                          { id: 'dark', label: language === 'ur' ? '🌙 ڈارک تھیم' : language === 'roman' ? '🌙 Dark Theme' : '🌙 Dark Theme' },
                          { id: 'system', label: language === 'ur' ? '💻 سسٹم ڈیفالٹ' : language === 'roman' ? '💻 System Default' : '💻 System Default' }
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
                        {language === 'ur' ? 'ایپ کی زبان منتخب کریں' : language === 'roman' ? 'App Language select karein' : 'Select App Language'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {[
                          { id: 'en', label: language === 'ur' ? '🇬🇧 انگریزی' : '🇬🇧 English' },
                          { id: 'ur', label: language === 'ur' ? '🇵🇰 اردو' : '🇵🇰 اردو (Urdu)' },
                          { id: 'roman', label: language === 'ur' ? '🗣️ رومن اردو' : '🗣️ Roman Urdu' }
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
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>⚙️ {language === 'ur' ? 'ایپ کی ترجیحات' : language === 'roman' ? 'App Preferences' : 'App Preferences'}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Audio Alert synthesiser config */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>{language === 'ur' ? 'ہنگامی آڈیو الرٹس' : language === 'roman' ? 'Emergency Audio Alerts' : 'Emergency Audio Alerts'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'SOS ملاپ پر خود بخود سائرن کی آوازیں چلائیں۔' : language === 'roman' ? 'SOS match par automatic siren alerts play karein.' : 'Synthesize sweep sirens programmatically on SOS match.'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableAudioAlerts(!enableAudioAlerts)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          background: enableAudioAlerts ? 'var(--color-secondary)' : 'var(--border-color)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          minHeight: 'unset',
                          boxShadow: 'none'
                        }}
                      >
                        {enableAudioAlerts ? (language === 'ur' ? '✓ فعال' : '✓ ACTIVE') : (language === 'ur' ? 'خاموش' : 'MUTED')}
                      </button>
                    </div>

                    {/* SOS Match Radius */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>{language === 'ur' ? 'ہنگامی SOS رداس' : language === 'roman' ? 'Emergency SOS Radius' : 'Emergency SOS Radius'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'ہنگامی SOS الرٹس نشر کرنے کے لیے زیادہ سے زیادہ فاصلہ۔' : language === 'roman' ? 'Emergency SOS alerts broadcast karne ka maximum distance.' : 'Maximum distance coverage to broadcast emergency SOS alerts.'}</span>
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
                        <option value={10}>{language === 'ur' ? '10 کلومیٹر' : '10 Kilometers'}</option>
                        <option value={15}>{language === 'ur' ? '15 کلومیٹر (تجویز کردہ)' : language === 'roman' ? '15 Kilometers (Recommended)' : '15 Kilometers (Recommended)'}</option>
                        <option value={20}>{language === 'ur' ? '20 کلومیٹر' : '20 Kilometers'}</option>
                        <option value={25}>{language === 'ur' ? '25 کلومیٹر' : '25 Kilometers'}</option>
                      </select>
                    </div>

                    {/* Simulation Map speed */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>{language === 'ur' ? 'نقشہ اپ ڈیٹ فریکوئنسی' : language === 'roman' ? 'Map Update Frequency' : 'Map Simulation Update Frequency'}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'گاڑی کی نقل و حرکت کے لیے نقشہ کوآرڈینیٹس کا وقفہ۔' : language === 'roman' ? 'Simulated vehicle movement ke liye map refresh frequency.' : 'Map coordinates interval for simulated vehicle drift.'}</span>
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
                        <option value={2}>{language === 'ur' ? '2 سیکنڈ (اعلیٰ درستگی)' : language === 'roman' ? '2 Seconds (High Precision)' : '2 Seconds (High Precision)'}</option>
                        <option value={5}>{language === 'ur' ? '5 سیکنڈ (تجویز کردہ)' : language === 'roman' ? '5 Seconds (Recommended)' : '5 Seconds (Recommended)'}</option>
                        <option value={10}>{language === 'ur' ? '10 سیکنڈ (بیٹری بچت)' : language === 'roman' ? '10 Seconds (Battery Saver)' : '10 Seconds (Battery Saver)'}</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Simulated Wallet Card in Settings */}
                <div 
                  id="wallet-card-section" 
                  className="glass" 
                  style={{ 
                    padding: '24px', 
                    borderRadius: '24px', 
                    border: walletFlash ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    boxShadow: walletFlash ? '0 0 25px rgba(34, 197, 94, 0.4)' : 'none',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💳 Simulated Wallet Balance
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Available Balance</span>
                      <strong style={{ fontSize: '24px', color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '5,000'} PKR</strong>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1000, 2000, 5000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await axios.post('http://localhost:5000/api/auth/wallet/add-funds', {
                                  userId: user.id,
                                  amount: val
                                });
                                if (res.data.success) {
                                  showToast(`Successfully added ${val} PKR to your wallet!`, 'success');
                                  updateUserProfile({ ...user, walletBalance: res.data.walletBalance });
                                }
                              } catch (err) {
                                console.error(err);
                                showToast("Failed to top-up wallet.", "error");
                              }
                            }}
                            className="glass"
                            style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-card)',
                              color: 'var(--text-main)',
                              transition: 'all 0.2s'
                            }}
                          >
                            +{val.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Amount (PKR)"
                        id="wallet-topup-input"
                        style={{ width: '120px', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                      <button
                        onClick={async () => {
                          const input = document.getElementById('wallet-topup-input');
                          const amt = Number(input?.value);
                          if (!amt || amt <= 0) {
                            showToast("Please enter a valid positive amount.", "warning");
                            return;
                          }
                          try {
                            const res = await axios.post('http://localhost:5000/api/auth/wallet/add-funds', {
                              userId: user.id,
                              amount: amt
                            });
                            if (res.data.success) {
                              showToast(`Successfully added ${amt} PKR to your wallet!`, 'success');
                              updateUserProfile({ ...user, walletBalance: res.data.walletBalance });
                              if (input) input.value = '';
                            }
                          } catch (err) {
                            showToast("Failed to top-up wallet.", "error");
                          }
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        Top-up
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        ) : activePage === 'about' ? (
          <section 
            className="glass page-section about-section"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.94)), url("/about_bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="about-grid-top">
              <div className="about-copy">
                <span className="eyebrow">{TRANSLATIONS[language].aboutTitle || "About Servio"}</span>
                <h2 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{TRANSLATIONS[language].aboutSubtitle || "A smarter local service concierge for every home and business."}</h2>
                <p className="hero-copy" style={{ color: '#cbd5e1' }}>{TRANSLATIONS[language].aboutDesc || "Servio brings together customers and nearby trusted providers with modern booking, tracking, and communication tools — all inside one premium dashboard."}</p>
                <div className="about-grid" style={{ marginTop: '26px' }}>
                  <div className="about-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutMission || "Our Mission"}</h4>
                    <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutMissionDesc || "Make local service delivery fast, transparent, and reliable."}</p>
                  </div>
                  <div className="about-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutVision || "Our Vision"}</h4>
                    <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutVisionDesc || "Empower every user to manage requests with confidence and clarity."}</p>
                  </div>
                  <div className="about-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutForProviders || "For Providers"}</h4>
                    <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutForProvidersDesc || "Tools to stay visible, accept work quickly, and manage availability live."}</p>
                  </div>
                </div>
              </div>

              <div className="about-cta-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutWhyChoose || "Why customers choose Servio"}</h4>
                <ul style={{ color: '#cbd5e1' }}>
                  <li>{TRANSLATIONS[language].aboutCtaItem1 || "Verified nearby professionals"}</li>
                  <li>{TRANSLATIONS[language].aboutCtaItem2 || "Smart routing and request tracking"}</li>
                  <li>{TRANSLATIONS[language].aboutCtaItem3 || "Slick mobile-friendly interaction"}</li>
                  <li>{TRANSLATIONS[language].aboutCtaItem4 || "Quick status notifications"}</li>
                </ul>
              </div>
            </div>

            <div className="work-steps">
              <h3 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutHowItWorks || "How it works"}</h3>
              <div className="steps-grid">
                <div className="step-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>1</span>
                  <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutStep1Title || "Submit Your Request"}</h4>
                  <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutStep1Desc || "Describe your issue and select a service category."}</p>
                </div>
                <div className="step-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>2</span>
                  <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutStep2Title || "Match with Providers"}</h4>
                  <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutStep2Desc || "We locate nearby qualified providers instantly."}</p>
                </div>
                <div className="step-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span>3</span>
                  <h4 style={{ color: '#ffffff' }}>{TRANSLATIONS[language].aboutStep3Title || "Confirm & Track"}</h4>
                  <p style={{ color: '#94a3b8' }}>{TRANSLATIONS[language].aboutStep3Desc || "See request progress, chat with providers, and complete the job."}</p>
                </div>
              </div>
            </div>
          </section>
        ) : activePage === 'requests' ? (
          <section className="glass page-section requests-list-section" style={{ minHeight: '80vh' }}>
            <div className="section-header">
              <div>
                <span className="eyebrow">{TRANSLATIONS[language].requestsTitle || "Service Logs & Portal"}</span>
                <h2>{TRANSLATIONS[language].requestsSubtitle || "Monitor, manage, and inspect all active and historical requests."}</h2>
              </div>
            </div>

            <div className="glass animate-fade-in" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{TRANSLATIONS[language].requestsAllRecords || "All Request Records"}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].requestsTotalCount || "Total requests"}: {requestHistory.length + (activeRequest ? 1 : 0)}</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>{TRANSLATIONS[language].colDate || "Date"}</th>
                      <th>{TRANSLATIONS[language].colCategory || "Category"}</th>
                      <th>{TRANSLATIONS[language].colRequest || "Description"}</th>
                      <th>{TRANSLATIONS[language].colProvider || "Counterparty"}</th>
                      <th>{TRANSLATIONS[language].colUrgency || "Urgency"}</th>
                      <th>{TRANSLATIONS[language].colPrice || "Price"}</th>
                      <th>{TRANSLATIONS[language].colStatus || "Status"}</th>
                      <th>{TRANSLATIONS[language].colActions || "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                     {(() => {
                      const allReqs = [];
                      if (activeRequest) allReqs.push({ ...activeRequest, isLive: true });
                      if (activeJob) allReqs.push({ ...activeJob, isLive: true });
                      
                      requestHistory.forEach(h => {
                        if (!allReqs.some(r => r.id === h.id)) {
                          allReqs.push(h);
                        }
                      });

                      if (allReqs.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                              {TRANSLATIONS[language].noRequestsFound || "No requests or bookings found. Click \"Home\" to start a new search."}
                            </td>
                          </tr>
                        );
                      }

                      return allReqs.map(req => {
                        const statusColor = 
                          req.status === 'completed' ? 'var(--color-primary)' :
                          req.status === 'accepted' ? 'var(--color-secondary)' :
                          req.status === 'pending' ? 'hsl(45, 100%, 50%)' :
                          req.status === 'checkout' ? 'hsl(14, 100%, 53%)' :
                          'var(--text-muted)';
                        
                        return (
                          <tr key={req.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ textTransform: 'capitalize', fontWeight: '600' }}>{getCategoryName(req.serviceType)}</td>
                            <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {req.description}
                            </td>
                            <td>{req.counterpartyName || req.customerName || (req.provider?.name) || (TRANSLATIONS[language].pendingMatch || 'Searching...')}</td>
                            <td>
                              <span style={{
                                color: req.urgency === 'High' ? 'var(--color-danger)' : 'var(--text-main)',
                                fontWeight: req.urgency === 'High' ? 'bold' : 'normal'
                              }}>{req.urgency === 'High' ? (language === 'ur' ? 'سنگین' : language === 'roman' ? 'High' : 'High') : (language === 'ur' ? 'معمولی' : language === 'roman' ? 'Low' : 'Low')}</span>
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                              {req.price > 0 ? `${req.price} PKR` : (TRANSLATIONS[language].notLocked || 'Not locked')}
                            </td>
                            <td>
                              <span style={{
                                color: statusColor,
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                fontSize: '11px'
                              }}>{TRANSLATIONS[language]['status' + req.status.charAt(0).toUpperCase() + req.status.slice(1)] || req.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {req.isLive ? (
                                  <button
                                    onClick={() => {
                                      setActivePage('home');
                                      if (user.role === 'customer') {
                                        setSelectedRequestId(req.id);
                                        // Auto map request state based on request status
                                        if (req.status === 'pending') setRequestState('searching');
                                        else if (req.status === 'accepted') setRequestState('matched');
                                        else if (req.status === 'checkout') setRequestState('checkout');
                                        else if (req.status === 'rating') setRequestState('rating');
                                      } else {
                                        setActiveTab('provider');
                                      }
                                    }}
                                    className="btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '11px' }}
                                  >
                                    {TRANSLATIONS[language].goToActiveConsole || "Go to Active Console"}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].historical || "Historical"}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : activePage === 'admin' && user?.role === 'admin' ? (
          <section className="glass page-section admin-console-section" style={{ minHeight: '80vh' }}>
            <div className="section-header">
              <div>
                <span className="eyebrow">ADMINISTRATIVE OVERVIEW</span>
                <h2>Oversee system users, provider activities, transaction ledger logs, and requests.</h2>
              </div>
              <button onClick={fetchAdminMetrics} className="btn-secondary" disabled={isAdminLoading}>
                {isAdminLoading ? 'Refreshing...' : '🔄 Refresh Metrics'}
              </button>
            </div>

            {adminMetrics ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
                {/* Stats Summary Widgets */}
                <div className="dashboard-summary-grid">
                  <div className="stat-card">
                    <span>Registered Users</span>
                    <h3>{adminMetrics.totalUsers}</h3>
                  </div>
                  <div className="stat-card">
                    <span>Total Providers</span>
                    <h3>{adminMetrics.totalProviders}</h3>
                  </div>
                  <div className="stat-card">
                    <span>Total Requests Created</span>
                    <h3>{adminMetrics.totalRequests}</h3>
                  </div>
                  <div className="stat-card">
                    <span>Aggregate Revenue</span>
                    <h3>{adminMetrics.totalEarnings.toLocaleString()} PKR</h3>
                  </div>
                </div>

                {/* System Requests Management */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>System Requests Monitor</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="dashboard-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Created At</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Price</th>
                          <th>Admin Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminMetrics.requestsList?.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No requests created in system.</td>
                          </tr>
                        ) : (
                          adminMetrics.requestsList?.map(req => (
                            <tr key={req.id}>
                              <td><code>{req.id}</code></td>
                              <td>{new Date(req.createdAt).toLocaleString()}</td>
                              <td style={{ textTransform: 'capitalize' }}>{req.serviceType}</td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.description}</td>
                              <td style={{ fontWeight: 'bold' }}>{req.status.toUpperCase()}</td>
                              <td>{req.price} PKR</td>
                              <td>
                                {['pending', 'accepted', 'checkout'].includes(req.status) ? (
                                  <button
                                    onClick={() => handleAdminCancelRequest(req.id)}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                                  >
                                    Force Cancel
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locked</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transactions Audit Log */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Financial Transactions Ledger</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="dashboard-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>ID</th>
                          <th>User ID</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminMetrics.transactions?.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transaction logs available.</td>
                          </tr>
                        ) : (
                          [...adminMetrics.transactions].reverse().map((tx, idx) => (
                            <tr key={tx.id || idx}>
                              <td>{new Date(tx.date).toLocaleString()}</td>
                              <td><code>{tx.id}</code></td>
                              <td><code>{tx.userId}</code></td>
                              <td style={{
                                color: tx.type === 'credit' ? 'var(--color-primary)' : 'var(--color-danger)',
                                fontWeight: 'bold'
                              }}>{tx.type.toUpperCase()}</td>
                              <td>{tx.amount} PKR</td>
                              <td>{tx.description}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>Loading admin statistics...</p>
            )}
          </section>
        ) : (activePage === 'booking' || !activePage) ? (
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
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{TRANSLATIONS[language].setLocation || "Set Your Current Location"}</span>
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
                <option value="">{TRANSLATIONS[language].chooseCustomCoords || "Choose custom coordinates..."}</option>
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
                📍 {TRANSLATIONS[language].gpsLocation || "GPS Location"}
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
                    className={`tab-btn ${selectedRequestId === null ? 'active' : ''}`}
                  >
                    {TRANSLATIONS[language].newBooking || "➕ New Booking"}
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
                        className={`tab-btn ${active ? 'active' : ''}`}
                      >
                        {statusEmoji} {getCategoryName(req.serviceType)}
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
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-danger)', margin: '0 0 4px 0' }}>{TRANSLATIONS[language].emergencyTitle || "🚨 Critical Emergency Situation?"}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{TRANSLATIONS[language].emergencySub || "Skip typing and immediately match with nearby specialists."}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowSOSSelector(true)}
                        className="sos-trigger-btn"
                        style={{ flex: 1, minWidth: '140px' }}
                      >
                        🚨 {TRANSLATIONS[language].oneTapSOS}
                      </button>

                      <button
                        type="button"
                        onClick={isInstantVoiceDispatching ? stopVoiceRecording : startInstantVoiceDispatch}
                        className={`sos-trigger-btn ${isInstantVoiceDispatching ? 'recording' : ''}`}
                        style={{
                          flex: 1,
                          minWidth: '140px',
                          background: isInstantVoiceDispatching 
                            ? 'linear-gradient(135deg, var(--color-danger), #b91c1c)' 
                            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          boxShadow: isInstantVoiceDispatching ? '0 0 12px var(--color-danger)' : 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isInstantVoiceDispatching ? (
                          <>
                            <span className="recording-dot" style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              display: 'inline-block',
                              animation: 'sos-pulse 1.2s infinite'
                            }}></span>
                            <span>Stop & Send</span>
                          </>
                        ) : (
                          <>
                            🎙️ {TRANSLATIONS[language].aiVoiceDispatch || "AI Voice Dispatch"}
                          </>
                        )}
                      </button>
                    </div>

                    {isInstantVoiceDispatching && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--color-primary)',
                        fontWeight: '600',
                        animation: 'sos-pulse 1.5s infinite',
                        marginTop: '4px'
                      }}>
                        {TRANSLATIONS[language].aiVoiceDispatchListening || "Listening... Tell Servio your issue (e.g. 'pipe burst in washroom'). Tap to dispatch."}
                      </div>
                    )}
                  </div>

                  {/* SOS Selector Modal has been moved to root level */}

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
                          className={`voice-record-btn ${isRecordingVoice ? 'recording' : ''}`}
                        >
                          {isRecordingVoice ? (
                            <>
                              <span className="recording-dot"></span>
                              <span>{TRANSLATIONS[language].stopRecording || "Stop Recording"}</span>
                              <div className="voice-wave">
                                <span className="voice-wave-bar"></span>
                                <span className="voice-wave-bar"></span>
                                <span className="voice-wave-bar"></span>
                                <span className="voice-wave-bar"></span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Mic size={13} />
                              {TRANSLATIONS[language].voiceRecord}
                            </>
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
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].voiceRequestCaptured || "🎙️ Voice request captured!"}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const audio = new Audio(voiceAudio);
                                audio.play();
                              }}
                              className="voice-action-btn play"
                            >
                              {TRANSLATIONS[language].play || "▶️ Play"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceAudio(null)}
                              className="voice-action-btn remove"
                            >
                              {TRANSLATIONS[language].remove || "Remove"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Upload Option */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].attachPhotoLabel || "Attach Photo of the Issue (Optional)"}</label>
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
                            {TRANSLATIONS[language].remove || "Remove"}
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
                                {TRANSLATIONS[language].aiScanning || "AI SCANNING..."}
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
                                  {TRANSLATIONS[language].analyzing || "Analyzing..."}
                                </>
                              ) : aiDiagnosisReport ? (
                                <>{TRANSLATIONS[language].rediagnoseAI || "✓ Rediagnose with AI"}</>
                              ) : (
                                <>{TRANSLATIONS[language].diagnoseWithAI || "🔍 Diagnose with AI"}</>
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
                              {TRANSLATIONS[language].detectedIssue || "Detected Issue:"}
                            </strong>
                            <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0 }}>
                              {aiDiagnosisReport.diagnosis}
                            </p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{TRANSLATIONS[language].estCost || "Est. Cost:"}</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                                {aiDiagnosisReport.priceRange}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{TRANSLATIONS[language].urgencyLevel || "Urgency Level:"}</span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#facc15' }}>
                                {aiDiagnosisReport.urgency}
                              </span>
                            </div>
                          </div>

                          {aiDiagnosisReport.partsRequired && aiDiagnosisReport.partsRequired.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{TRANSLATIONS[language].suggestedParts || "Suggested Parts/Tools:"}</span>
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
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].aiParsingPreview || "AI PARSING PREVIEW"}</span>
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
                            }}>{parsedUrgency} {language === 'ur' ? 'شدت' : language === 'roman' ? 'Urgency' : 'Urgency'}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          {parsedCategory === 'electrician' && <Zap size={16} className="text-yellow-400" />}
                          {parsedCategory === 'plumber' && <Droplet size={16} className="text-blue-400" />}
                          {parsedCategory === 'AC mechanic' && <Wrench size={16} className="text-cyan-400" />}
                          {parsedCategory && !['electrician', 'plumber', 'AC mechanic'].includes(parsedCategory) && <Wrench size={16} />}
                          <span style={{ fontSize: '14px', textTransform: 'capitalize', fontWeight: '600' }}>
                            {parsedCategory ? (language === 'ur' ? `${getCategoryName(parsedCategory)} درکار ہے` : language === 'roman' ? `${getCategoryName(parsedCategory)} Zaroorat` : `${getCategoryName(parsedCategory)} Required`) : (TRANSLATIONS[language].analyzingText || 'Analyzing text...')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].serviceCategory || "Service Category"}</label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                      >
                        <option value="AC mechanic">{getCategoryName("AC mechanic")}</option>
                        <option value="electrician">{getCategoryName("electrician")}</option>
                        <option value="plumber">{getCategoryName("plumber")}</option>
                        <option value="painter">{getCategoryName("painter")}</option>
                        <option value="mason">{getCategoryName("mason")}</option>
                        <option value="appliance repair">{getCategoryName("appliance repair")}</option>
                        <option value="carpenter">{getCategoryName("carpenter")}</option>
                        <option value="car mechanic">{getCategoryName("car mechanic")}</option>
                        <option value="cleaner">{getCategoryName("cleaner")}</option>
                        <option value="cctv installer">{getCategoryName("cctv installer")}</option>
                        <option value="solar technician">{getCategoryName("solar technician")}</option>
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
                    <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].availableNearby || "Available Nearby Now"}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {displayedProviders.filter(p => p.serviceType?.includes(selectedService)).length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {TRANSLATIONS[language].noLiveProvidersAround 
                            ? TRANSLATIONS[language].noLiveProvidersAround.replace("{service}", getCategoryName(selectedService)) 
                            : `No live ${getCategoryName(selectedService)}s around. Try simulation!`}
                        </p>
                      ) : (
                        displayedProviders.filter(p => p.serviceType?.includes(selectedService)).map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <div>
                              <span style={{ fontWeight: '500' }}>{p.name}</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>({p.experience || 3} {language === 'ur' ? 'سال کا تجربہ' : language === 'roman' ? 'saal exp' : 'yrs exp'})</span>
                            </div>
                            <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></span>
                              {TRANSLATIONS[language].available || "Available"}
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
                    <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{TRANSLATIONS[language].searchingResponders || "Searching Online Responders..."}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {TRANSLATIONS[language].sendingPing ? TRANSLATIONS[language].sendingPing.replace("{service}", getCategoryName(selectedService)) : `Sending ping to available ${getCategoryName(selectedService)}s within 5km radius.`}
                    </p>
                  </div>
                  {requestImage && (
                    <div style={{ marginTop: '4px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100px', height: '100px', boxShadow: 'var(--shadow-sm)' }}>
                      <img src={requestImage} alt="Issue preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setCustomerRequests(prev => prev.filter(r => r.id !== selectedRequestId));
                      setSelectedRequestId(null);
                      setRequestState('idle');
                      setRequestImage(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-danger)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >{TRANSLATIONS[language].cancelRequest || "Cancel Request"}</button>
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
                      <h4 style={{ fontSize: '15px' }}>{TRANSLATIONS[language].providerAccepted || "Provider Accepted!"}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].headingToCoords || "Heading to your coordinates."}</p>
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
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{getCategoryName(selectedService)}</p>
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
                      {matchedProvider.experience !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px' }}>🛡️</span>
                          <span>{TRANSLATIONS[language].experienceLabel || "Experience:"} <strong>{matchedProvider.experience} {TRANSLATIONS[language].years || "years"}</strong></span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} className="text-green-400" />
                        <span>{TRANSLATIONS[language].distanceApproaching || "Distance: Approaching..."}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Safety Warning Alert Banner */}
                  {activeRequest?.aiDiagnosis?.safetyWarning && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '16px', marginTop: '-2px' }}>🚨</span>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-danger)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {TRANSLATIONS[language].aiSafetyWarningTitle || "AI Safety Recommendation"}
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0, fontWeight: '500' }}>
                          {activeRequest.aiDiagnosis.safetyWarning}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Issue Photo preview if uploaded */}
                  {activeRequest?.image && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].attachedPhoto || "ATTACHED ISSUE PHOTO"}</span>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '140px' }}>
                        <img src={activeRequest.image} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(activeRequest.image, '_blank')} />
                      </div>
                    </div>
                  )}

                  {/* Issue Voice Request player */}
                  {activeRequest?.voiceAudio && (
                    <div className="glass" style={{ padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].yourVoiceRequest || "🎙️ YOUR VOICE REQUEST"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio(activeRequest.voiceAudio);
                          audio.play();
                        }}
                        className="voice-action-btn play"
                      >
                        {TRANSLATIONS[language].playVoiceNote || "▶️ Play voice note"}
                      </button>
                    </div>
                  )}

                  {/* Live Bidding & Rate lock UI (Customer View) */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{TRANSLATIONS[language].rateNegotiation || "💲 RATE NEGOTIATION"}</span>
                      {activeRequest?.price > 0 && activeRequest?.negotiation?.status === 'accepted' ? (
                        <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: 'bold' }}>🔒 {language === 'ur' ? 'مقفل' : language === 'roman' ? 'Locked' : 'Locked'}</span>
                      ) : (
                        <span style={{ color: 'var(--color-warning)', fontSize: '11px' }}>{language === 'ur' ? 'کھلا ہے' : language === 'roman' ? 'Khula' : 'Open'}</span>
                      )}
                    </div>

                    {activeRequest?.price > 0 && activeRequest?.negotiation?.status === 'accepted' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 'bold' }}>
                        <span>{TRANSLATIONS[language].rateLocked || "✅ Rate Locked at"} {activeRequest.price} PKR</span>
                      </div>
                    ) : activeRequest?.negotiation?.status === 'pending' && activeRequest?.negotiation?.proposedBy === 'provider' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <p style={{ fontSize: '12px', margin: 0 }}>{TRANSLATIONS[language].providerProposedRate || "Provider proposed a rate of"} <strong>{activeRequest.negotiation.proposedPrice} PKR</strong></p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleRespondPrice('accept')}
                            style={{ padding: '4px 10px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >{language === 'ur' ? 'قبول کریں' : language === 'roman' ? 'Accept' : 'Accept'}</button>
                          <button
                            type="button"
                            onClick={() => handleRespondPrice('reject')}
                            style={{ padding: '4px 10px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >{language === 'ur' ? 'مسترد کریں' : language === 'roman' ? 'Reject' : 'Reject'}</button>
                        </div>
                      </div>
                    ) : activeRequest?.negotiation?.status === 'pending' && activeRequest?.negotiation?.proposedBy === 'customer' ? (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{TRANSLATIONS[language].waitingProviderResponse || "Waiting for provider to respond to counter-offer of"} <strong>{activeRequest.negotiation.proposedPrice} PKR</strong>...</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          placeholder={TRANSLATIONS[language].counterProposePlaceholder || "Counter-propose rate..."}
                          value={proposedBid}
                          onChange={(e) => setProposedBid(e.target.value)}
                          style={{ flex: 1, padding: '5px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-card)' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleProposePrice()}
                          style={{ padding: '5px 10px', backgroundColor: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >{TRANSLATIONS[language].sendOffer || "Send Offer"}</button>
                      </div>
                    )}

                    {/* AI Negotiation Copilot Advice (Customer View) */}
                    {activeRequest?.negotiation?.copilotAnalysis && (
                      <div className="glass" style={{
                        padding: '8px 10px',
                        backgroundColor: activeRequest.negotiation.copilotAnalysis.status === 'high' 
                          ? 'rgba(239, 68, 68, 0.05)' 
                          : 'rgba(34, 197, 94, 0.05)',
                        border: `1px solid ${activeRequest.negotiation.copilotAnalysis.status === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <span>🤖</span>
                        <div>
                          <strong style={{ 
                            color: activeRequest.negotiation.copilotAnalysis.status === 'high' ? 'var(--color-danger)' : 'var(--color-success)',
                            textTransform: 'uppercase',
                            fontSize: '9px',
                            display: 'block'
                          }}>
                            {TRANSLATIONS[language].aiCopilotTitle || "AI Negotiation Copilot"}
                          </strong>
                          <span style={{ color: 'var(--text-main)' }}>{activeRequest.negotiation.copilotAnalysis.advice}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parts Invoice approval UI (Customer View) */}
                  {activeRequest?.partsList && activeRequest.partsList.length > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      border: '1px dashed var(--color-secondary)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{TRANSLATIONS[language].partsInvoice || "🛠️ PARTS INVOICE"}</span>
                        {activeRequest.partsList.some(p => p.status === 'pending') && (
                          <span style={{ color: 'var(--color-warning)', fontSize: '10px', fontWeight: 'bold' }}>{TRANSLATIONS[language].approvalRequired || "APPROVAL REQUIRED"}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {activeRequest.partsList.map((part, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span>{part.name} ({TRANSLATIONS[language]['status' + part.status.charAt(0).toUpperCase() + part.status.slice(1)] || part.status})</span>
                            <strong>{part.price} PKR</strong>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', marginTop: '4px' }}>
                          <span>{TRANSLATIONS[language].partsTotalLabel || "Parts Total:"}</span>
                          <span>{activeRequest.partsTotal || activeRequest.partsList.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.price, 0)} PKR</span>
                        </div>
                      </div>

                      {activeRequest.partsList.some(p => p.status === 'pending') && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleRespondParts('approve')}
                            style={{ padding: '5px 10px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                          >{TRANSLATIONS[language].approveAndPay || "Approve & Pay"}</button>
                          <button
                            type="button"
                            onClick={() => handleRespondParts('reject')}
                            style={{ padding: '5px 10px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                          >{TRANSLATIONS[language].decline || "Decline"}</button>
                        </div>
                      )}
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
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>{language === 'ur' ? 'گلی نمبر اور تفصیلات یہاں پوچھیں' : language === 'roman' ? 'Gali number aur details yahan share karein' : 'Ask details, share exact street number here.'}</p>
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
                        placeholder={language === 'ur' ? 'پیغام لکھیں...' : language === 'roman' ? 'Message likhein...' : 'Write a message...'}
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
                      fontWeight: 'bold',
                      marginTop: '16px'
                    }}
                  >{language === 'ur' ? 'کام مکمل ہو گیا / سیشن بند کریں' : language === 'roman' ? 'Kaam Khatam / Session Close Karein' : 'Job Finished / Close Session'}</button>
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--color-danger)',
                      fontWeight: 'bold',
                      marginTop: '8px',
                      cursor: 'pointer'
                    }}
                  >{language === 'ur' ? 'بکنگ منسوخ کریں اور واپس جائیں' : language === 'roman' ? 'Booking Cancel & Wapas Jayein' : 'Cancel Booking & Go Back'}</button>
                </div>
              )}

              {/* 💳 CHECKOUT / WALLET BILL CHECK SCREEN */}
              {requestState === 'checkout' && activeRequest && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '32px' }}>💳</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0 4px 0' }}>{language === 'ur' ? 'انوائس اور ادائیگی' : language === 'roman' ? 'Invoice aur Payment' : 'Invoice & Payment'}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'کام کی تکمیل کے لیے والٹ کی کٹوتیوں کی تصدیق کریں۔' : language === 'roman' ? 'Job complete karne ke liye wallet payments confirm karein.' : 'Confirm wallet deductions for job completion.'}</p>
                  </div>

                  <div className="glass" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{language === 'ur' ? 'لاک شدہ سروس ریٹ:' : language === 'roman' ? 'Locked Service Rate:' : 'Locked Service Rate:'}</span>
                      <strong>{(activeRequest.price - (activeRequest.partsTotal || 0))} PKR</strong>
                    </div>
                    {activeRequest.partsTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>{language === 'ur' ? 'منظور شدہ پرزوں کا انوائس:' : language === 'roman' ? 'Approved Parts Invoice:' : 'Approved Parts Invoice:'}</span>
                        <strong>{activeRequest.partsTotal} PKR</strong>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                      <span>{language === 'ur' ? 'کل بل کی رقم:' : language === 'roman' ? 'Total Bill Amount:' : 'Total Bill Amount:'}</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>{activeRequest.price} PKR</strong>
                    </div>
                  </div>

                  <div className="glass-glow-blue" style={{ padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{language === 'ur' ? 'آپ کا والٹ بیلنس' : language === 'roman' ? 'APKA WALLET BALANCE' : 'YOUR WALLET BALANCE'}</span>
                      <strong style={{ fontSize: '16px' }}>{user?.walletBalance !== undefined ? user.walletBalance.toLocaleString() : '5,000'} PKR</strong>
                    </div>
                    {(user?.walletBalance === undefined || user.walletBalance < activeRequest.price) && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await axios.post('http://localhost:5000/api/auth/wallet/add-funds', {
                              userId: user.id,
                              amount: 5000
                            });
                            if (res.data.success) {
                              showToast("Loaded 5,000 PKR simulated funds!", "success");
                              updateUserProfile({ ...user, walletBalance: res.data.walletBalance });
                            }
                          } catch (e) {
                            showToast("Failed to load funds.", "error");
                          }
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        ⚡ {language === 'ur' ? '5 ہزار شامل کریں' : language === 'roman' ? 'Load 5K' : 'Load 5K'}
                      </button>
                    )}
                  </div>

                  {(user?.walletBalance === undefined || user.walletBalance < activeRequest.price) && (
                    <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: 0, textAlign: 'center', fontWeight: '500' }}>
                      {language === 'ur' ? '⚠️ انوائس کی ادائیگی کے لیے ناکافی بیلنس۔ براہ کرم بیلنس بڑھائیں۔' : language === 'roman' ? '⚠️ Invoice pay karne ke liye balance kam hai. Balance barhayein.' : '⚠️ Insufficient balance to pay invoice. Please top-up.'}
                    </p>
                  )}

                  <button
                    onClick={handlePayInvoice}
                    disabled={(user?.walletBalance === undefined || user.walletBalance < activeRequest.price) || isPaying}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      cursor: (user?.walletBalance === undefined || user.walletBalance < activeRequest.price) ? 'not-allowed' : 'pointer',
                      background: (user?.walletBalance === undefined || user.walletBalance < activeRequest.price) ? 'var(--border-color)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isPaying ? <Loader2 size={16} className="animate-spin" /> : `🔒 ${language === 'ur' ? 'ادائیگی کریں اور ریٹنگ کھولیں' : language === 'roman' ? 'Pay & Unlock Rating' : 'Pay & Unlock Rating'}`}
                  </button>
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
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>{language === 'ur' ? 'جائزہ جمع کروا دیا گیا!' : language === 'roman' ? 'Review Submit Hogya!' : 'Review Submitted!'}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'آپ کے فیڈ بیک کا شکریہ۔' : language === 'roman' ? 'Feedback ke liye shukriya.' : 'Thank you for your feedback.'}</p>
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
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{language === 'ur' ? 'اپنے تجربے کی درجہ بندی کریں' : language === 'roman' ? 'Apna Experience Rate Karein' : 'Rate your Experience'}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {language === 'ur' ? `فراہم کنندہ ${matchedProvider?.name || 'فراہم کنندہ'} کیسا رہا؟` : language === 'roman' ? `${matchedProvider?.name || 'Apka provider'} kaisa rha?` : `How was ${matchedProvider?.name || 'your provider'}?`}
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
                          {language === 'ur' 
                            ? ['', 'بہت برا 😞', 'مناسب 😐', 'اچھا 🙂', 'بہت اچھا 😊', 'شاندار! 🌟'][hoveredRating || selectedRating]
                            : language === 'roman'
                            ? ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😊', 'Excellent! 🌟'][hoveredRating || selectedRating]
                            : ['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Very Good 😊', 'Excellent! 🌟'][hoveredRating || selectedRating]}
                        </p>
                      )}

                      {/* Text review area */}
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'left' }}>
                          {language === 'ur' ? 'جائزہ شامل کریں (اختیاری)' : language === 'roman' ? 'Review add karein (optional)' : 'Add a review (optional)'}
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder={language === 'ur' ? 'مثال کے طور پر: بہت اچھا کام کیا، وقت پر آئے اور پیشہ ور تھے...' : language === 'roman' ? 'e.g. Bahut acha kaam kiya, time pe aaye aur professional tha...' : 'e.g. Bahut acha kaam kiya, time pe aaye aur professional tha...'}
                          rows={3}
                          style={{ resize: 'none', width: '100%', fontSize: '13px' }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                          onClick={() => { setRequestState('idle'); setMatchedProvider(null); setSelectedRequestId(null); }}
                          style={{
                            flex: 1, padding: '11px', borderRadius: '8px',
                            border: '1px solid var(--border-color)', backgroundColor: 'transparent',
                            color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer'
                          }}
                        >
                          {language === 'ur' ? 'چھوڑیں اور واپس جائیں' : language === 'roman' ? 'Skip karein aur wapas jayein' : 'Skip & Go Back to Map'}
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
                          {isSubmittingRating ? <Loader2 size={16} className="animate-spin" /> : '⭐'} {language === 'ur' ? 'ریٹنگ جمع کروائیں' : language === 'roman' ? 'Rating Submit Karein' : 'Submit Rating'}
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
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px' }}>{language === 'ur' ? 'سب مکمل ہو گیا! 🙌' : language === 'roman' ? 'Sub Ho Gaya! 🙌' : 'All Done! 🙌'}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'سرویو استعمال کرنے کا شکریہ۔ آپ کی رائے سے کمیونٹی کو مدد ملتی ہے۔' : language === 'roman' ? 'Servio use karne ka shukriya. Apka feedback hamari help karta hai.' : 'Thank you for your feedback.'}</p>
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
                    {language === 'ur' ? 'دوسری سروس بک کریں' : language === 'roman' ? 'Dusri Service Book Karein' : 'Book Another Service'}
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
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{TRANSLATIONS[language].dutyStatus || "Duty Status"}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: isAvailable ? 'var(--color-primary)' : 'var(--text-muted)'
                    }}>{isAvailable ? (TRANSLATIONS[language].onlineStatus || 'AVAILABLE NOW') : (TRANSLATIONS[language].offlineStatus || 'OFFLINE')}</span>

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
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{language === 'ur' ? 'آپ آف لائن ہیں' : language === 'roman' ? 'Aap Offline hain' : 'You are Offline'}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {language === 'ur' ? 'اپنے آپ کو کسٹمر میپ پر ظاہر کرنے اور آنے والی نوکریاں حاصل کرنے کے لیے اوپر "ڈیوٹی اسٹیٹس" کو فعال کریں۔' : language === 'roman' ? 'Apne aap ko customer map par dikhane aur incoming jobs receive karne ke liye upar "Duty Status" toggle karein.' : 'Toggle "Duty Status" above to make yourself visible on customer map and receive incoming jobs.'}
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
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{language === 'ur' ? 'ہنگامی درخواستوں کا انتظار ہے...' : language === 'roman' ? 'Emergency Requests ka wait hai...' : 'Waiting for Emergency Requests...'}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {language === 'ur' ? 'اسکرین کو فعال رکھیں۔ جب کوئی رابطہ کرے گا ہم آپ کو فوری طور پر مطلع کریں گے۔' : language === 'roman' ? 'Screen active rakhein. Kisi ke match hote hi hum aapko instant notify karein ge.' : 'Keep the screen active. We will notify you instantly when someone matches.'}
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
                          {language === 'ur' ? 'سنگین ہنگامی SOS درخواست' : language === 'roman' ? 'CRITICAL SOS EMERGENCY' : 'CRITICAL SOS EMERGENCY'}
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'فوری روانگی کے لیے قریبی فراہم کنندہ کا ملاپ ہو گیا ہے' : language === 'roman' ? 'Foran dispatch ke liye kareeb tareen responder match hogya' : 'Nearest responder matched for immediate dispatch'}</span>
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
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'درکار مہارت:' : language === 'roman' ? 'Req. Specialization:' : 'Req. Specialization:'} {getCategoryName(incomingRequest.serviceType)}</span>
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
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'خودکار انکار کا کاؤنٹ ڈاؤن:' : language === 'roman' ? 'Auto-decline Countdown:' : 'Auto-decline Countdown:'}</span>
                        <strong style={{ fontSize: '18px', color: 'var(--color-danger)' }}>{countdown} {language === 'ur' ? 'سیکنڈ' : language === 'roman' ? 'seconds' : 'seconds'}</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '10px' }}>
                        <button
                          onClick={handleDeclineRequest}
                          className="sos-select-btn cancel"
                        >
                          {TRANSLATIONS[language].decline || "Decline"}
                        </button>
                        <button
                          onClick={handleAcceptRequest}
                          className="sos-accept-btn"
                        >
                          {language === 'ur' ? 'ہنگامی SOS قبول کریں' : language === 'roman' ? 'ACCEPT SOS EMERGENCY' : 'ACCEPT SOS EMERGENCY'}
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
                      <span style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '800', letterSpacing: '0.05em' }}>{TRANSLATIONS[language].incomingRequestAlert || "INCOMING EMERGENCY REQUEST"}</span>
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
                          className="voice-action-btn play"
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
                        className="btn-secondary"
                        style={{ minHeight: 'unset', padding: '10px 14px', borderRadius: '8px' }}
                      >
                        {TRANSLATIONS[language].decline}
                      </button>
                      <button
                        onClick={handleAcceptRequest}
                        style={{ minHeight: 'unset', padding: '10px 14px', borderRadius: '8px' }}
                      >
                        {TRANSLATIONS[language].acceptAndGo}
                      </button>
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
                        className="voice-action-btn play"
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

                  {/* AI Diagnostics Procedure Checklist (Provider View) */}
                  {activeJob?.aiDiagnosis?.checklist && activeJob.aiDiagnosis.checklist.length > 0 && (
                    <div className="glass" style={{
                      padding: '14px',
                      backgroundColor: 'rgba(59, 130, 246, 0.04)',
                      borderRadius: '12px',
                      border: '1px dashed var(--color-primary)',
                      marginBottom: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {TRANSLATIONS[language].aiChecklistTitle || "🛠️ AI Procedure Checklist"}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeJob.aiDiagnosis.checklist.map((item, idx) => {
                          const isItemChecked = !!checkedChecklistItems[`${activeJob.id}-${idx}`];
                          return (
                            <label key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              color: isItemChecked ? 'var(--text-muted)' : 'var(--text-main)',
                              textDecoration: isItemChecked ? 'line-through' : 'none',
                              transition: 'all 0.2s ease'
                            }}>
                              <input 
                                type="checkbox" 
                                style={{ accentColor: 'var(--color-primary)', cursor: 'pointer', width: '15px', height: '15px' }}
                                checked={isItemChecked}
                                onChange={() => handleToggleChecklistItem(activeJob.id, idx)}
                              />
                              <span>{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Bidding & Rate lock UI (Provider View) */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>💲 RATE NEGOTIATION</span>
                      {activeJob?.price > 0 && activeJob?.negotiation?.status === 'accepted' ? (
                        <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: 'bold' }}>🔒 Locked</span>
                      ) : (
                        <span style={{ color: 'var(--color-warning)', fontSize: '11px' }}>Open</span>
                      )}
                    </div>

                    {activeJob?.price > 0 && activeJob?.negotiation?.status === 'accepted' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 'bold' }}>
                        <span>✅ Rate Locked at {activeJob.price} PKR</span>
                      </div>
                    ) : activeJob?.negotiation?.status === 'pending' && activeJob?.negotiation?.proposedBy === 'customer' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <p style={{ fontSize: '12px', margin: 0 }}>Customer proposed counter-rate of <strong>{activeJob.negotiation.proposedPrice} PKR</strong></p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleRespondPrice('accept')}
                            style={{ padding: '4px 10px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >Accept</button>
                          <button
                            type="button"
                            onClick={() => handleRespondPrice('reject')}
                            style={{ padding: '4px 10px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >Reject</button>
                        </div>
                      </div>
                    ) : activeJob?.negotiation?.status === 'pending' && activeJob?.negotiation?.proposedBy === 'provider' ? (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Waiting for customer to respond to your proposal of <strong>{activeJob.negotiation.proposedPrice} PKR</strong>...</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          placeholder="Propose service fee..."
                          value={proposedBid}
                          onChange={(e) => setProposedBid(e.target.value)}
                          style={{ flex: 1, padding: '5px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-card)' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleProposePrice()}
                          style={{ padding: '5px 10px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >Propose</button>
                      </div>
                    )}

                    {/* AI Negotiation Copilot Advice (Provider View) */}
                    {activeJob?.negotiation?.copilotAnalysis && (
                      <div className="glass" style={{
                        padding: '8px 10px',
                        backgroundColor: activeJob.negotiation.copilotAnalysis.status === 'high' 
                          ? 'rgba(239, 68, 68, 0.05)' 
                          : 'rgba(34, 197, 94, 0.05)',
                        border: `1px solid ${activeJob.negotiation.copilotAnalysis.status === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <span>🤖</span>
                        <div>
                          <strong style={{ 
                            color: activeJob.negotiation.copilotAnalysis.status === 'high' ? 'var(--color-danger)' : 'var(--color-success)',
                            textTransform: 'uppercase',
                            fontSize: '9px',
                            display: 'block'
                          }}>
                            {TRANSLATIONS[language].aiCopilotTitle || "AI Negotiation Copilot"}
                          </strong>
                          <span style={{ color: 'var(--text-main)' }}>{activeJob.negotiation.copilotAnalysis.advice}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parts Assistant invoice panel (Provider View) */}
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                    border: '1px dashed var(--color-primary)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)' }}>🛠️ PARTS SHOPPING ASSISTANT</span>
                    
                    {activeJob?.partsList && activeJob.partsList.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '4px' }}>
                        {activeJob.partsList.map((part, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{part.name} ({part.status})</span>
                            <strong>{part.price} PKR</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          placeholder="Part name (e.g. Capacitor)..."
                          value={partName}
                          onChange={(e) => setPartName(e.target.value)}
                          style={{ flex: 2, padding: '5px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-card)' }}
                        />
                        <input
                          type="number"
                          placeholder="Price (PKR)..."
                          value={partPrice}
                          onChange={(e) => setPartPrice(e.target.value)}
                          style={{ flex: 1, padding: '5px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-card)' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!partName.trim() || !partPrice.trim()) {
                            props.showToast("Please enter both part name and price.", "warning");
                            return;
                          }
                          handleSendPartsInvoice([{ name: partName, price: Number(partPrice) }]);
                          setPartName('');
                          setPartPrice('');
                        }}
                        style={{ padding: '5px 10px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                      >Submit Part Invoice</button>
                    </div>
                  </div>

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
                      fontWeight: 'bold',
                      marginTop: '16px'
                    }}
                  >Mark Job Completed / Done</button>
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--color-danger)',
                      fontWeight: 'bold',
                      marginTop: '8px',
                      cursor: 'pointer'
                    }}
                  >Cancel Job & Exit Console</button>
                </div>
              )}
            </div>
          )}

        </section>

        {/* --- RIGHT HAND SIDE: INTERACTIVE MAP & CONTROL --- */}
        <section className="map-section">

          {/* MAP */}
          <div style={{ flex: 1, minHeight: '300px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
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

              {/* Render Search Radius Circle for Customer during SOS/Standard Search */}
              {activeTab === 'customer' && requestState === 'searching' && (
                <Circle
                  center={customerLocation}
                  radius={(sosMatchRadius || 15) * 1000}
                  pathOptions={{
                    color: 'var(--color-danger)',
                    fillColor: 'var(--color-danger)',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    dashArray: '4, 4'
                  }}
                />
              )}

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
                const mainService = p.serviceType?.[0] || 'electrician';

                const pinIcon = isUrgent ? icons.emergency : (icons[mainService] || icons.electrician);

                return (
                  <Marker
                    key={p.id}
                    position={[coords[1], coords[0]]}
                    icon={pinIcon}
                  >
                    <Popup>
                      <div style={{ fontSize: '13px', width: '220px' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', fontSize: '14px', marginBottom: '2px' }}>
                          <span>{p.name}</span>
                          {p.level && (
                            <span style={{ fontSize: '10px', color: 'var(--color-primary)', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                              Lvl {p.level} ({p.badge})
                            </span>
                          )}
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Category: {p.serviceType.join(', ')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                          <Star size={10} className="text-yellow-400" fill="yellow" />
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{p.rating} ({p.totalJobs} jobs) • {p.experience || 3} yrs exp</span>
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

              {/* Render dynamic routing Polyline when matched */}
              {requestState === 'matched' && matchedProvider && matchedProvider.location?.coordinates && (
                <Polyline
                  positions={[
                    customerLocation,
                    [matchedProvider.location.coordinates[1], matchedProvider.location.coordinates[0]]
                  ]}
                  pathOptions={{
                    color: 'var(--color-primary)',
                    weight: 3.5,
                    dashArray: '8, 8',
                    lineCap: 'round',
                    lineJoin: 'round',
                    opacity: 0.8
                  }}
                />
              )}
            </MapContainer>

            {/* Live Tracking overlay on top of the Map */}
            {requestState === 'matched' && matchedProvider && (
              <div className="glass-glow-blue fade-in" style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '280px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                zIndex: 1000,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', backgroundColor: 'var(--color-primary)', padding: '2px 8px', borderRadius: '20px' }}>
                    TRACKING ACTIVE
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="live-pulse" style={{ width: '8px', height: '8px' }}></span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-live)' }}>LIVE</span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{matchedProvider.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {matchedProvider.serviceType?.join(' / ') || 'Service Partner'}
                  </p>
                </div>

                {(() => {
                  const pCoords = matchedProvider.location?.coordinates;
                  if (!pCoords || pCoords.length !== 2) return null;
                  
                  // Calculate raw distance
                  const dLat = customerLocation[0] - pCoords[1];
                  const dLng = customerLocation[1] - pCoords[0];
                  const distDeg = Math.sqrt(dLat * dLat + dLng * dLng);
                  
                  // Convert degree distance roughly to KM (1 deg is approx 111km)
                  const distKm = distDeg * 111;
                  
                  // Dynamic ETA: assume 40km/h (approx 1.5 mins per km)
                  const etaMins = Math.max(1, Math.round(distKm * 1.5));
                  
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ESTIMATED TIME</span>
                        <strong style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>
                          {distKm < 0.15 ? 'Arriving now!' : `${etaMins} mins`}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>DISTANCE</span>
                        <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>
                          {distKm < 0.15 ? '< 150 m' : `${distKm.toFixed(1)} km`}
                        </strong>
                      </div>
                    </div>
                  );
                })()}

                <div style={{
                  fontSize: '11px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  🚲 Provider is moving towards your location.
                </div>
              </div>
            )}
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
      </>
    ) : null}

      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <div style={{ maxWidth: '280px' }}>
            <p className="footer-brand">Servio</p>
            <p className="footer-text">{language === 'ur' ? 'صارفین اور مقامی فراہم کنندگان کے لیے ایک بہترین اور مربوط سروس مارکیٹ پلیس۔' : language === 'roman' ? 'Customers aur local providers ke liye aik polished service marketplace.' : 'A polished service marketplace for customers and local providers — all in one connected console.'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                🛡️ {language === 'ur' ? 'تصدیق شدہ قابل اعتماد مارکیٹ پلیس' : language === 'roman' ? 'Verified Trusted Marketplace' : 'Verified Trusted Marketplace'}
              </span>
              <a href="tel:+923001234567" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                📞 {language === 'ur' ? 'ہاٹ لائن:' : 'Hotline:'} +92-300-1234567
              </a>
              <a href="mailto:servio.support.ltd@gmail.com" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                📧 {language === 'ur' ? 'سپورٹ ای میل:' : language === 'roman' ? 'Support Email:' : 'Support Email:'} servio.support.ltd@gmail.com
              </a>
            </div>
          </div>

          <div className="footer-links">
            <a href="#home" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('home'); }}>{TRANSLATIONS[language].navHome}</a>
            <a href="#dashboard" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }}>{TRANSLATIONS[language].navDashboard}</a>
            <a href="#requests" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('requests'); }}>{TRANSLATIONS[language].navRequests}</a>
            <a href="#about" className="footer-link" onClick={(e) => { e.preventDefault(); setActivePage('about'); }}>{TRANSLATIONS[language].navAbout}</a>
          </div>

          <div>
            <p className="footer-text footer-text-small" style={{ marginBottom: '4px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              📧 {language === 'ur' ? 'خبرنامہ کو سبسکرائب کریں' : language === 'roman' ? 'Newsletter Subscribe Karein' : 'Subscribe to Newsletter'}
            </p>
            <p className="footer-text" style={{ fontSize: '11px', margin: '0 0 10px 0' }}>
              {language === 'ur' ? 'تازہ ترین اپ ڈیٹس اور الرٹس حاصل کریں۔' : language === 'roman' ? 'Latest updates aur alerts haasil karein.' : 'Get the latest updates and service alerts.'}
            </p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={language === 'ur' ? 'ای میل درج کریں...' : language === 'roman' ? 'Email likhein...' : 'Enter email...'}
                required
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none',
                  maxWidth: '180px'
                }}
              />
              <button
                type="submit"
                className="glass"
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: 'unset',
                  boxShadow: 'none'
                }}
              >
                {language === 'ur' ? 'بھیجیں' : 'Send'}
              </button>
            </form>
            {newsletterSubscribed && (
              <span style={{ fontSize: '11px', color: '#10b981', display: 'block', marginTop: '6px', fontWeight: 'bold' }}>
                ✓ {language === 'ur' ? 'سبسکرائب کر لیا گیا!' : 'Subscribed successfully!'}
              </span>
            )}
          </div>
        </div>

        {/* Outlined Social Icons Row at the downside free space */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '30px',
          marginBottom: '10px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px'
        }}>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="glass" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)'
          }} title="X (Twitter)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
              <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="glass" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)'
          }} title="Facebook">
            <Facebook size={20} strokeWidth={2.5} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="glass" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--text-muted)',
            transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)'
          }} title="LinkedIn">
            <Linkedin size={20} strokeWidth={2.5} />
          </a>
        </div>

        <div className="footer-copy">© 2026 Servio. All rights reserved.</div>
      </footer>

      {/* SOS Category Selector Modal Overlay (Moved to root for full screen viewport behavior) */}
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
                className="sos-select-btn electrician"
              >
                ⚡ Sparking & Short Circuit
              </button>
              
              <button
                type="button"
                onClick={() => handleEmergencySOS('plumber', 'PIPE BURST / WATER LEAK FLOODING - IMMEDIATE RESPONDER NEEDED!')}
                className="sos-select-btn plumber"
              >
                🌊 Pipe Burst & Flooding
              </button>

              <button
                type="button"
                onClick={() => handleEmergencySOS('appliance repair', 'APPLIANCE SMOKE / GAS LEAK / THREAT - IMMEDIATE RESPONDER NEEDED!')}
                className="sos-select-btn appliance"
              >
                🔥 Appliance Smoke & Hazard
              </button>

              <button
                type="button"
                onClick={() => setShowSOSSelector(false)}
                className="sos-select-btn cancel"
                style={{ marginTop: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with Auth and Socket contexts
export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('servio_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

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

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const [authView, setAuthView] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // customer | provider
  const [serviceTypes, setServiceTypes] = useState(['AC mechanic']); // for provider signup
  const [experience, setExperience] = useState('3'); // years of experience

  return (
    <AuthProvider>
      <SocketProvider>
        <AuthWrapper
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
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
          experience={experience}
          setExperience={setExperience}
        />
      </SocketProvider>
    </AuthProvider>
  );
}

// Sub-component to pull contexts inside AuthWrapper
function AuthWrapper(props) {
  const { token, login, register, error, loading: authLoading, verifyRegistration } = useAuth();
  const [loading, setLoading] = useState(false);
  const language = props.language || 'en';
  const dict = TRANSLATIONS[language] || {};

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [resetPreviewUrl, setResetPreviewUrl] = useState('');
  const [confirmSignupPassword, setConfirmSignupPassword] = useState('');

  // Signup OTP verification states
  const [otpRequired, setOtpRequired] = useState(false);
  const [verifyRegId, setVerifyRegId] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [regPreviewUrl, setRegPreviewUrl] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      props.setPassword('');
      props.setEmail('');
    }
  }, [token]);

  const getPasswordInputType = () => {
    if (props.authView === 'login') {
      return showLoginPassword ? "text" : "password";
    } else {
      return showSignupPassword ? "text" : "password";
    }
  };

  const renderEyeIcon = () => {
    if (props.authView === 'login') {
      return showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />;
    } else {
      return showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />;
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotError('');
    setForgotMessage('');
    setResetPreviewUrl('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: resetEmail });
      setForgotMessage(res.data.message);
      if (res.data.previewUrl) {
        setResetPreviewUrl(res.data.previewUrl);
      }
      props.setAuthView('reset');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to send OTP code. Please try again.';
      setForgotError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setForgotError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasNumber || !hasSpecial) {
      setForgotError("Password must contain at least 1 numeric character and 1 special character (e.g. @, #, $, %, etc.).");
      return;
    }

    setLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: resetEmail,
        otp,
        newPassword,
        confirmPassword
      });
      showToast('Password reset successful! You can now log in with your new password.', 'success');
      props.setAuthView('login');
      // Reset state
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetEmail('');
    } catch (err) {
      console.error(err);
      setForgotError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (props.authView === 'register') {
      const p = props.password ? props.password.trim() : '';
      const cp = confirmSignupPassword ? confirmSignupPassword.trim() : '';

      console.log('Password comparison logs:', { passwordLength: p.length, confirmLength: cp.length, match: p === cp });

      if (p !== cp) {
        showToast("Confirm Password must match the Password!", "error");
        return;
      }
      const hasNumber = /[0-9]/.test(p);
      const hasSpecial = /[^A-Za-z0-9]/.test(p);
      if (p.length < 8 || !hasNumber || !hasSpecial) {
        showToast("Password must be at least 8 characters long and contain at least 1 numeric character and 1 special character (e.g. @, #, $, %, etc.).", "error");
        return;
      }
    }

    setLoading(true);
    if (props.authView === 'login') {
      await login(props.email.trim(), props.password.trim());
    } else {
      const p = props.password ? props.password.trim() : '';
      const cp = confirmSignupPassword ? confirmSignupPassword.trim() : '';
      await register(props.name.trim(), props.email.trim(), props.phone.trim(), p, cp, props.role, props.serviceTypes, props.experience);
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
    return <MainApp theme={props.theme} setTheme={props.setTheme} language={props.language} setLanguage={props.setLanguage} showToast={showToast} />;
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
      {/* Floating Theme & Language Selector on login/signup */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <select
          value={props.language}
          onChange={(e) => props.setLanguage(e.target.value)}
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
          <option value="en">🇬🇧 English</option>
          <option value="ur">🇵🇰 اردو</option>
          <option value="roman">🗣️ Roman</option>
        </select>

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
          <img 
            src="/logo_icon.png" 
            alt="Servio Logo" 
            style={{ 
              width: '48px', 
              height: '48px', 
              marginBottom: '4px'
            }} 
          />
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>Servio</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dict.authHeroDesc || "Real-Time Local Service Concierge"}</p>
        </div>

        {(error || forgotError) && (
          <div className="glass-glow-red" style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '8px',
            color: 'var(--color-danger)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error || forgotError}
          </div>
        )}

        {forgotMessage && (
          <div className="glass-glow-green" style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {forgotMessage}
          </div>
        )}

        {props.authView === 'forgot' ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelEmail || "Email Address"}</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@service.com"
                required
              />
            </div>
            
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
              {dict.authBtnSendOtp || "Send OTP Code"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  props.setAuthView('login');
                  setForgotError('');
                  setForgotMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {dict.authBtnBackLogin || "Back to Login"}
              </button>
            </div>
          </form>
        ) : props.authView === 'reset' ? (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0', textAlign: 'center' }}>
              {dict.authResetPasswordFor || "Resetting password for:"} <strong>{resetEmail}</strong>
            </p>

            {resetPreviewUrl && (
              <div className="glass-glow-blue" style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '8px',
                border: '1px dashed var(--color-secondary)',
                fontSize: '12px',
                color: 'var(--text-main)',
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                📧 <strong>{dict.authSimulatedEmailSent || "Simulated Email Sent!"}</strong><br />
                {dict.authSimulatedOtpNotice || "Since SMTP credentials are not configured in backend/.env, you can view the email online:"}<br />
                <a
                  href={resetPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-secondary)',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}
                >
                  {dict.authSimulatedOtpClick || "Click Here to Open simulated Ethereal Inbox & View OTP"}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabel6DigitOtp || "6-Digit OTP Code"}</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelNewPassword || "New Password"}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '40px', width: '100%' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    boxShadow: 'none',
                    minHeight: 'unset',
                    zIndex: 10
                  }}
                >
                  {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelConfirmPassword || "Confirm Password"}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '40px', width: '100%' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    boxShadow: 'none',
                    minHeight: 'unset',
                    zIndex: 10
                  }}
                >
                  {showResetConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
              {dict.authBtnResetPassword || "Reset Password"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  props.setAuthView('login');
                  setForgotError('');
                  setForgotMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {dict.authBtnBackLogin || "Back to Login"}
              </button>
            </div>
          </form>
        ) : otpRequired ? (
          <form onSubmit={handleVerifyRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0', textAlign: 'center' }}>
              {dict.authEmailVerifyPrompt || "Please verify your email address to complete registration."}
            </p>
            
            {regPreviewUrl && (
              <div className="glass-glow-blue" style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '8px',
                border: '1px dashed var(--color-secondary)',
                fontSize: '12px',
                color: 'var(--text-main)',
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                📧 <strong>{dict.authSimulatedEmailSent || "Simulated Email Sent!"}</strong><br />
                {dict.authSimulatedOtpNotice || "Since SMTP is not configured, view the generated OTP online:"}<br />
                <a
                  href={regPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-secondary)',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}
                >
                  {dict.authSimulatedOtpClick || "Click Here to Open simulated Ethereal Inbox & View OTP"}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabel6DigitOtp || "6-Digit OTP Code"}</label>
              <input
                type="text"
                maxLength={6}
                value={signupOtp}
                onChange={(e) => setSignupOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
              />
            </div>

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
              {dict.authBtnVerifyOtp || "Verify OTP"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setOtpRequired(false);
                  props.setAuthView('login');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {dict.authBtnCancelBackLogin || "Cancel & Back to Login"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {props.authView === 'register' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelFullName || "Full Name"}</label>
                    <input
                      type="text"
                      value={props.name}
                      onChange={(e) => props.setName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelPhone || "Phone Number"}</label>
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
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelEmail || "Email Address"}</label>
                <input
                  type="email"
                  value={props.email}
                  onChange={(e) => props.setEmail(e.target.value)}
                  placeholder="name@service.com"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelPassword || "Password"}</label>
                  {props.authView === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        props.setAuthView('forgot');
                        setForgotError('');
                        setForgotMessage('');
                        setResetPreviewUrl('');
                        if (props.email) setResetEmail(props.email);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-secondary)',
                        fontWeight: '600',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        boxShadow: 'none',
                        minHeight: 'unset'
                      }}
                    >
                      {dict.authBtnForgot || "Forgot Password?"}
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={getPasswordInputType()}
                    value={props.password}
                    onChange={(e) => props.setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight: '40px', width: '100%' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (props.authView === 'login') {
                        setShowLoginPassword(!showLoginPassword);
                      } else {
                        setShowSignupPassword(!showSignupPassword);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      boxShadow: 'none',
                      minHeight: 'unset',
                      zIndex: 10
                    }}
                  >
                    {renderEyeIcon()}
                  </button>
                </div>
              </div>

              {props.authView === 'register' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelConfirmPassword || "Confirm Password"}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      value={confirmSignupPassword}
                      onChange={(e) => setConfirmSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ paddingRight: '40px', width: '100%' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        boxShadow: 'none',
                        minHeight: 'unset',
                        zIndex: 10
                      }}
                    >
                      {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {props.authView === 'register' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelSignUpAs || "Sign up as"}</label>
                    <select
                      value={props.role}
                      onChange={(e) => props.setRole(e.target.value)}
                    >
                      <option value="customer">{language === 'ur' ? 'صارف (بکنگ کرنے والا)' : language === 'roman' ? 'Customer (Needs Service)' : 'Customer (Needs Service)'}</option>
                      <option value="provider">{language === 'ur' ? 'سروس فراہم کنندہ' : language === 'roman' ? 'Provider (Offers Service)' : 'Provider (Offers Service)'}</option>
                    </select>
                  </div>

                  {props.role === 'provider' && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelSelectSkill || "Select Main Skill"}</label>
                        <select
                          value={props.serviceTypes[0]}
                          onChange={(e) => props.setServiceTypes([e.target.value])}
                        >
                          <option value="AC mechanic">{language === 'ur' ? 'اے سی مکینک' : 'AC Mechanic'}</option>
                          <option value="electrician">{language === 'ur' ? 'الیکٹریشن' : 'Electrician'}</option>
                          <option value="plumber">{language === 'ur' ? 'پلمبر' : 'Plumber'}</option>
                          <option value="painter">{language === 'ur' ? 'پینٹر' : 'Painter'}</option>
                          <option value="mason">{language === 'ur' ? 'معمار (Mason)' : 'Mason/Tile work'}</option>
                          <option value="appliance repair">{language === 'ur' ? 'ایپلائینس ریپیئر' : 'Appliance Repair'}</option>
                          <option value="carpenter">{language === 'ur' ? 'بڑھئی (Carpenter)' : 'Carpenter'}</option>
                          <option value="car mechanic">{language === 'ur' ? 'کار مکینک' : 'Car Mechanic (Mobile)'}</option>
                          <option value="cleaner">{language === 'ur' ? 'گھر کی صفائی' : 'Home Cleaning'}</option>
                          <option value="cctv installer">{language === 'ur' ? 'سی سی ٹی وی انسٹالر' : 'CCTV Installer'}</option>
                          <option value="solar technician">{language === 'ur' ? 'سولر ٹیکنیشن' : 'Solar Panel Tech'}</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{dict.authLabelExperience || "Years of Experience"}</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={props.experience}
                          onChange={(e) => props.setExperience(e.target.value)}
                          placeholder="e.g. 5"
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-main)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </>
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
                {props.authView === 'login' ? (dict.authBtnLogin || "Login") : (dict.authBtnCreateAccount || "Create Account")}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {props.authView === 'login' ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {dict.authTextDontHaveAccount || "Don't have an account?"}{' '}
                  <button
                    onClick={() => {
                      props.setAuthView('register');
                      setConfirmSignupPassword('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >{dict.authLinkSignUp || "Sign Up"}</button>
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {dict.authTextAlreadyHaveAccount || "Already have an account?"}{' '}
                  <button
                    onClick={() => {
                      props.setAuthView('login');
                      setConfirmSignupPassword('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  >{dict.authLinkLogIn || "Log In"}</button>
                </p>
              )}
            </div>
          </>
        )}

      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Reusable beautiful Toast alert component
function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500); // Auto close after 4.5 seconds
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.4)',
          color: '#10b981',
          shadow: 'rgba(34, 197, 94, 0.25)',
          icon: '✨'
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          color: '#ef4444',
          shadow: 'rgba(239, 68, 68, 0.25)',
          icon: '🚨'
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          color: '#f59e0b',
          shadow: 'rgba(245, 158, 11, 0.25)',
          icon: '⚠️'
        };
      case 'info':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          color: '#3b82f6',
          shadow: 'rgba(59, 130, 246, 0.25)',
          icon: '🔔'
        };
    }
  };

  const t = getTheme();

  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        minWidth: '320px',
        maxWidth: '480px',
        padding: '16px 20px',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${t.border}`,
        boxShadow: `0 12px 32px ${t.shadow}, 0 0 20px rgba(0,0,0,0.5)`,
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'slide-up-fade 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        backdropFilter: 'blur(20px)'
      }}
    >
      <span style={{ fontSize: '20px' }}>{t.icon}</span>
      <div style={{ flex: 1, fontSize: '13px', fontWeight: 'bold', color: t.color, lineHeight: 1.4 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
          minHeight: 'unset',
          minWidth: 'unset'
        }}
      >
        ✕
      </button>
    </div>
  );
}
