// Simple JavaScript Translation Dictionary for KrishiMitra
// Supported Languages: Kannada (kn - Default), English (en), Hindi (hi)

export const SUPPORTED_LANGUAGES = [
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'en', name: 'English', label: 'English' },
  { code: 'hi', name: 'हिन्दी', label: 'हिन्दी (Hindi)' },
];

export const TRANSLATIONS = {
  kn: {
    // Brand
    brandName: 'ಕೃಷಿಮಿತ್ರ',
    brandTagline: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ',
    activeBeta: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ',
    bannerAlertBadge: 'ಹಿಂಗಾರು ಎಚ್ಚರಿಕೆ',
    bannerAlertText: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ. ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು 2 ದಿನ ಮುಂದೂಡಿ.',

    // Navigation
    navHome: 'ಮುಖಪುಟ',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navFarmingRecords: 'ಕೃಷಿ ದಾಖಲೆಗಳು',
    navCalendar: 'ಸ್ಮಾರ್ಟ್ ಕ್ಯಾಲೆಂಡರ್',
    navFarmerProfile: 'ರೈತರ ಪ್ರೊಫೈಲ್',
    navCropRecommendation: 'ಬೆಳೆ ಶಿಫಾರಸು',
    navWeather: 'ಹವಾಮಾನ',
    navDiseaseDetection: 'ರೋಗ ಪತ್ತೆ',
    navAiAssistant: 'ಎಐ ಸಹಾಯಕ',
    navSignIn: 'ಲಾಗಿನ್',
    navRegister: 'ನೋಂದಣಿ',
    navProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    navSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    navLogout: 'ಲಾಗ್‌ಔಟ್',

    // Hero Section
    heroBadge: 'ಕೃಷಿಮಿತ್ರ • ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ',
    heroHeadingMain: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ, ',
    heroHeadingHighlight: 'ಉತ್ತಮ ಭವಿಷ್ಯ.',
    heroDescription: 'ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಶಿಫಾರಸುಗಳು, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.',
    heroGetStarted: 'ಪ್ರಾರಂಭಿಸಿ',
    heroExploreFeatures: 'ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    heroFreeBadge: 'ರೈತರಿಗೆ 100% ಉಚಿತ',
    heroAiPrecision: 'ಎಐ ನಿಖರತೆ',
    heroLocalForecast: 'ಸ್ಥಳೀಯ ಹವಾಮಾನ',
    heroScanLeafDemo: 'ಬೆಳೆ ರೋಗ ಪರೀಕ್ಷಿಸಿ',
    heroIdealSpray: 'ಇಂದಿನ ಸಿಂಪಡಣೆ ಸಮಯ: ಸೂಕ್ತವಾಗಿದೆ',

    // Feature Cards
    featuresHeaderBadge: 'ರೈತ ಸ್ನೇಹಿ ವೈಶಿಷ್ಟ್ಯಗಳು',
    featuresHeading: 'ಸಮಗ್ರ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಉಪಕರಣಗಳು',
    featuresSubheading: 'ಖರ್ಚು ಕಡಿಮೆ ಮಾಡಲು, ರೋಗ ತಡೆಗಟ್ಟಲು ಮತ್ತು ಉತ್ತಮ ಇಳುವರಿ ಪಡೆಯಲು ಬೇಕಾದ ಎಲ್ಲ ಮಾಹಿತಿ.',
    
    featCropRecTitle: 'ಎಐ ಬೆಳೆ ಶಿಫಾರಸು',
    featCropRecDesc: 'ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಹವಾಮಾನ ಮತ್ತು ನೀರಿನ ಲಭ್ಯತೆಗೆ ತಕ್ಕಂತೆ ಗರಿಷ್ಠ ಲಾಭ ನೀಡುವ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.',
    featCropRecAction: 'ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ',

    featDiseaseTitle: 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆ',
    featDiseaseDesc: 'ಎಲೆಗಳ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ರೋಗ ಪತ್ತೆ ಹಚ್ಚಿ, ನೈಸರ್ಗಿಕ ಮತ್ತು ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ ತಿಳಿಯಿರಿ.',
    featDiseaseAction: 'ಎಲೆಯ ಫೋಟೋ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    cameraOpen: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
    cameraCapture: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    cameraRetake: 'ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    cameraSwitch: 'ಕ್ಯಾಮೆರಾ ಬದಲಾಯಿಸಿ',
    cameraClose: 'ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ',
    uploadGallery: 'ಗ್ಯಾಲರಿಯಿಂದ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    detectDiseaseBtn: 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ',
    removePhoto: 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ',

    featWeatherTitle: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    featWeatherDesc: 'ನಿಮ್ಮ ಹಳ್ಳಿಯ ಮಳೆ ಸಂಭವನೀಯತೆ, ಆರ್ದ್ರತೆ, ಗಾಳಿಯ ವೇಗ ಮತ್ತು ಸುರಕ್ಷಿತ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯ ಸಮಯ ತಿಳಿಯಿರಿ.',
    featWeatherAction: 'ಮುನ್ಸೂಚನೆ ವೀಕ್ಷಿಸಿ',

    featSoilTitle: 'ಮಣ್ಣಿನ ಮಾಹಿತಿ',
    featSoilDesc: 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಜಮೀನಿಗೆ ಬೇಕಾದ ಯೂರಿಯಾ, ಡಿಎಪಿ ಗೊಬ್ಬರದ ಚೀಲಗಳ ನಿಖರ ಲೆಕ್ಕ ಹಾಕಿ.',
    featSoilAction: 'ಗೊಬ್ಬರ ಲೆಕ್ಕ ಹಾಕಿ',

    featAssistantTitle: 'ಕೃಷಿ ಸಹಾಯಕ',
    featAssistantDesc: 'ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಯಾವುದೇ ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ. ಬಿತ್ತನೆ, ರೋಗ ನಿಯಂತ್ರಣ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ತಕ್ಷಣ ಉತ್ತರ ಪಡೆಯಿರಿ.',
    featAssistantAction: 'ಸಹಾಯಕರೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ',

    featMarketTitle: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮಾಹಿತಿ',
    featMarketDesc: 'ಗೋಧಿ, ಹತ್ತಿ, ಸೋಯಾಬೀನ್, ಈರುಳ್ಳಿ ಮತ್ತಿತರ ಬೆಳೆಗಳ ಇಂದಿನ ಲೈವ್ ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    featMarketAction: 'ಮಂಡಿ ದರ ಪರಿಶೀಲಿಸಿ',

    // Dashboard
    dashWelcome: 'ನಮಸ್ಕಾರ',
    dashActiveFarmer: 'ಸಕ್ರಿಯ ರೈತರು',
    dashRabiSeason: 'ಹಿಂಗಾರು (ರಬಿ) ಋತು',
    dashOverviewBanner: 'ಕೃಷಿಮಿತ್ರ ಸ್ಮಾರ್ಟ್ ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    dashSprayWindowOpen: 'ಇಂದು ಸಂಜೆ 4:00 ರವರೆಗೆ ಸಿಂಪಡಣೆಗೆ ಅನುಕೂಲಕರ ಹವಾಮಾನವಿದೆ.',
    dashScanLeafBtn: 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    dashAskAiBtn: 'ಎಐ ಸಹಾಯಕನನ್ನು ಕೇಳಿ',
    dashFarmerPortal: 'ರೈತ ಪೋರ್ಟಲ್',
    dashNavMenu: 'ನ್ಯಾವಿಗೇಷನ್ ಮೆನು',
    dashBackHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    dashHelpline: 'ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ',
    dashFarmGps: 'ಕೃಷಿ ಜಿಪಿಎಸ್ ನಕ್ಷೆ',
    dashChange: 'ಬದಲಾಯಿಸಿ',
    dashViewForecast: '5 ದಿನಗಳ ಮುನ್ಸೂಚನೆ ನೋಡಿ',
    dashRunCropAi: 'ಬೆಳೆ ಎಐ ಎಂಜಿನ್ ಚಾಲನೆ',
    dashScanPlantLeaf: 'ಗಿಡದ ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    dashCalcFertilizer: 'ಗೊಬ್ಬರದ ಚೀಲಗಳನ್ನು ಲೆಕ್ಕ ಹಾಕಿ',
    dashLaunchChat: 'ಎಐ ಸಹಾಯಕ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ',

    dashWeatherCardTitle: 'ಹವಾಮಾನ ಮಾಹಿತಿ',
    dashCropCardTitle: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು',
    dashDiseaseCardTitle: 'ಬೆಳೆ ವೈದ್ಯ',
    dashSoilCardTitle: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
    dashFarmingTipsTitle: 'ಇಂದಿನ ಕೃಷಿ ಸಲಹೆಗಳು & ಜ್ಞಾನ',
    dashActivitiesTitle: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು',

    // Common Farming Information & Tips
    tipSprayTimeTitle: 'ಔಷಧ ಸಿಂಪಡಣೆಗೆ ಸೂಕ್ತ ಸಮಯ',
    tipSprayTimeDesc: 'ಬೆಳಿಗ್ಗೆ 7:00 ರಿಂದ 11:00 ಮತ್ತು ಸಂಜೆ 3:30 ರಿಂದ 5:30 ರವರೆಗೆ. ಗಾಳಿಯ ವೇಗ ಕಡಿಮೆ ಇರುವಾಗ ಮಾತ್ರ ಸಿಂಪಡಿಸಿ.',
    tipIrrigationTitle: 'ನೀರಾವರಿಗೆ ಉತ್ತಮ ಸಮಯ',
    tipIrrigationDesc: 'ಮಳೆ ಬರುವ 48 ಗಂಟೆ ಮೊದಲು ಹೆಚ್ಚು ನೀರು ಹಾಯಿಸಬೇಡಿ. ಸಂಜೆ ವೇಳೆಯಲ್ಲಿ ಹನಿ ನೀರಾವರಿ ನೀಡುವುದು ಸೂಕ್ತ.',
    tipRainWarningTitle: 'ಮಳೆ ಎಚ್ಚರಿಕೆ',
    tipRainWarningDesc: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.',
    tipPrecautionsTitle: 'ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
    tipPrecautionsDesc: 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆ ಇದ್ದಾಗ ಬೂದಿ ರೋಗ ಹಾಗೂ ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಬಗ್ಗೆ ನಿಗಾ ಇರಿಸಿ. ಮುಂಜಾನೆ ಪರಿಶೀಲಿಸಿ.',

    // Weather page
    weatherHeading: 'ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಶಿಫಾರಸುಗಳು',
    weatherBackHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',

    // Chatbot
    chatTitle: 'ಕೃಷಿಮಿತ್ರ ಎಐ ಕೃಷಿ ಸಹಾಯಕ',
    chatStatusOnline: 'ಆನ್‌ಲೈನ್ • 24/7 ಸಕ್ರಿಯ',
    chatSuggestedTitle: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು (ಕೇಳಲು ಕ್ಲಿಕ್ ಮಾಡಿ):',
    chatPlaceholder: 'ಬೆಳೆಗಳು, ರೋಗಗಳು, ಗೊಬ್ಬರ, ಹವಾಮಾನ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    chatSendBtn: 'ಕಳುಹಿಸಿ',
    chatClearBtn: 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ',
    chatTyping: 'ಕೃಷಿಮಿತ್ರ ಎಐ ಸಲಹೆ ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ...',
    chatInitialGreeting: '🙏 **ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!** ನಾನು ನಿಮ್ಮ 24/7 ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆಗಾರ **ಕೃಷಿಮಿತ್ರ ಎಐ**.\n\nನೀವು ಬೆಳೆ ಆಯ್ಕೆ, ರೋಗ ನಿಯಂತ್ರಣ, ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ, ನೀರಾವರಿ ಸಮಯ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.\n\n*ಕೆಳಗಿನ ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ!*',
    voiceStart: 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ',
    voiceStop: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    voiceListening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಈಗ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ',
    voiceReadAloud: 'ಧ್ವನಿ ಕೇಳಿ',
    voiceStopReading: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    voiceNotSupported: 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',

    chatQuestions: [
      'ನಾನು ಯಾವ ಬೆಳೆಯನ್ನು ಬೆಳೆಯಬೇಕು?',
      'ಸಸ್ಯ ರೋಗಗಳನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?',
      'ನಾನು ಯಾವಾಗ ಬೆಳೆಗೆ ನೀರು ಹಾಯಿಸಬೇಕು?',
      'ಯಾವ ಗೊಬ್ಬರ ಸೂಕ್ತವಾಗಿದೆ?',
      'ಭತ್ತ ಬೆಳೆಯಲು ಅತ್ಯುತ್ತಮ ಋತು ಯಾವುದು?'
    ],

    // Footer
    footerDesc: 'ಕೃಷಿಮಿತ್ರ ಭಾರತೀಯ ರೈತರಿಗೆ ಸುಧಾರಿತ ಎಐ ಕೃಷಿ ಜ್ಞಾನ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಲೈವ್ ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    footerUsefulLinks: 'ಉಪಯುಕ್ತ ಲಿಂಕ್‌ಗಳು',
    footerGovtPortals: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಪೋರ್ಟಲ್‌ಗಳು',
    footerContactInfo: 'ಸಂಪರ್ಕ ಮಾಹಿತಿ',
    footerTollFree: 'ರಾಷ್ಟ್ರೀಯ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಉಚಿತ)',
    footerAllRights: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
    footerMadeForFarmers: 'ಭಾರತದ ಅನ್ನದಾತರಿಗಾಗಿ ಪ್ರೀತಿಯಿಂದ ರೂಪಿಸಲಾಗಿದೆ',
    footerFreeBadge: 'ರೈತರಿಗೆ 100% ಉಚಿತ & ಮುಕ್ತ'
  },

  en: {
    // Brand
    brandName: 'KrishiMitra',
    brandTagline: 'Smart Farming Assistant',
    activeBeta: 'Smart Agri',
    bannerAlertBadge: 'Rabi Alert',
    bannerAlertText: 'Light rain forecasted across regions. Delay urea application for 48 hours.',

    // Navigation
    navHome: 'Home',
    navDashboard: 'Dashboard',
    navFarmingRecords: 'Farming Records',
    navCalendar: 'Smart Calendar',
    navFarmerProfile: 'Farmer Profile',
    navCropRecommendation: 'Crop Recommendation',
    navWeather: 'Weather',
    navDiseaseDetection: 'Disease Detection',
    navAiAssistant: 'AI Assistant',
    navSignIn: 'Sign In',
    navRegister: 'Register',
    navProfile: 'My Profile',
    navSettings: 'Settings',
    navLogout: 'Logout',

    // Hero Section
    heroBadge: 'KrishiMitra • Smart Farming Assistant',
    heroHeadingMain: 'Smart Farming, ',
    heroHeadingHighlight: 'Better Future.',
    heroDescription: 'Get smart crop recommendations, weather updates and farming guidance.',
    heroGetStarted: 'Get Started',
    heroExploreFeatures: 'Explore Features',
    heroFreeBadge: '100% Free For Farmers',
    heroAiPrecision: 'AI Precision',
    heroLocalForecast: 'Hyperlocal Forecast',
    heroScanLeafDemo: 'Test Plant Disease Detection',
    heroIdealSpray: "Today's Spray Window: Favorable",

    // Feature Cards
    featuresHeaderBadge: 'Farmer First Features',
    featuresHeading: 'Comprehensive Smart Farming Tools',
    featuresSubheading: 'Everything an Indian farmer needs to reduce input costs, prevent disease losses, and secure peak market prices.',
    
    featCropRecTitle: 'AI Crop Recommendation',
    featCropRecDesc: 'Get scientific crop suggestions based on your soil type, seasonal calendar, and water availability to maximize your harvest profits.',
    featCropRecAction: 'Get Crop Advice',

    featDiseaseTitle: 'Plant Disease Detection',
    featDiseaseDesc: 'Scan or upload plant leaves to identify 120+ crop diseases in seconds with verified organic and chemical treatment advice.',
    featDiseaseAction: 'Scan Leaf Photo',
    cameraOpen: 'Open Camera',
    cameraCapture: 'Capture Photo',
    cameraRetake: 'Retake Photo',
    cameraSwitch: 'Switch Camera',
    cameraClose: 'Close Camera',
    uploadGallery: 'Upload from Gallery',
    detectDiseaseBtn: 'Detect Disease',
    removePhoto: 'Remove Photo',

    featWeatherTitle: 'Weather Prediction',
    featWeatherDesc: 'Accurate rain probability, humidity levels, wind speed, and safe spray windows tailored to your farm location.',
    featWeatherAction: 'View Forecast',

    featSoilTitle: 'Soil Information',
    featSoilDesc: 'Understand soil fertility, check N-P-K balances, and calculate exact Urea, DAP, and Potash bag dosage for your field size.',
    featSoilAction: 'Calculate Fertilizer',

    featAssistantTitle: 'Farming Assistant',
    featAssistantDesc: 'Ask any farming question in simple language. Get instant answers on sowing, pest management, and government subsidies.',
    featAssistantAction: 'Chat with Assistant',

    featMarketTitle: 'Market Price Information',
    featMarketDesc: 'Track daily APMC auction prices for Wheat, Cotton, Soybean, Onion, and more across 450+ mandis in India.',
    featMarketAction: 'Check Mandi Rates',

    // Dashboard
    dashWelcome: 'Namaste',
    dashActiveFarmer: 'Active Farmer',
    dashRabiSeason: 'Rabi Season 2026',
    dashOverviewBanner: 'KrishiMitra Smart Farmer Dashboard',
    dashSprayWindowOpen: "Today's weather offers favorable spray conditions until 4:00 PM.",
    dashScanLeafBtn: 'Scan Crop Leaf',
    dashAskAiBtn: 'Ask AI Assistant',
    dashFarmerPortal: 'Farmer Portal',
    dashNavMenu: 'Navigation Menu',
    dashBackHome: 'Back to Public Website',
    dashHelpline: 'Toll-Free Helpline',
    dashFarmGps: 'Farm GPS Map',
    dashChange: 'Change',
    dashViewForecast: 'View 5-Day Forecast',
    dashRunCropAi: 'Run Crop AI Engine',
    dashScanPlantLeaf: 'Scan Plant Leaf Photo',
    dashCalcFertilizer: 'Calculate Fertilizer Bags',
    dashLaunchChat: 'Launch AI Assistant Chat',

    dashWeatherCardTitle: 'Weather Forecast',
    dashCropCardTitle: 'Crop Advisory',
    dashDiseaseCardTitle: 'Crop Doctor',
    dashSoilCardTitle: 'Soil Health',
    dashFarmingTipsTitle: "Today's Agronomist Tips & Krishi Gyan",
    dashActivitiesTitle: 'Recent Activities',

    // Common Farming Information & Tips
    tipSprayTimeTitle: 'Suitable Time for Spraying Crops',
    tipSprayTimeDesc: 'Between 7:00 AM - 11:00 AM & 3:30 PM - 5:30 PM. Only spray when wind speed is below 15 km/h.',
    tipIrrigationTitle: 'Best Time for Irrigation',
    tipIrrigationDesc: 'Hold flood irrigation 48 hours prior to expected rain. Evening drip watering reduces evaporation.',
    tipRainWarningTitle: 'Rain & Storm Warning',
    tipRainWarningDesc: 'Moderate rainfall expected in next 48 hours. Clear drainage channels to prevent root waterlogging.',
    tipPrecautionsTitle: 'Weather-Related Precautions',
    tipPrecautionsDesc: 'High morning humidity promotes fungal mildew. Scout leaf undersides early morning.',

    // Weather page
    weatherHeading: 'Weather-Driven Farming Recommendations',
    weatherBackHome: 'Back to Home',

    // Chatbot
    chatTitle: 'KrishiMitra AI Farming Assistant',
    chatStatusOnline: 'Online • 24/7 Active',
    chatSuggestedTitle: 'Suggested Questions (Click to Ask):',
    chatPlaceholder: 'Ask anything about crops, soil, pests, fertilizers (e.g. spray window)...',
    chatSendBtn: 'Send',
    chatClearBtn: 'Reset Chat',
    chatTyping: 'KrishiMitra AI is formulating advice...',
    chatInitialGreeting: '🙏 **Namaste Kisan Bhai!** I am **KrishiMitra AI**, your 24/7 smart farming advisor.\n\nYou can ask me questions about crop selection, pest control, fertilizer dosages, irrigation schedules, and government schemes.\n\n*Click any of the suggested questions below or type your inquiry in simple Hindi or English to begin!*',
    voiceStart: 'Start Voice Input',
    voiceStop: 'Stop Voice Input',
    voiceListening: 'Listening... Speak now',
    voiceReadAloud: 'Read Aloud',
    voiceStopReading: 'Stop Speaking',
    voiceNotSupported: 'Voice recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari, or type your question.',

    chatQuestions: [
      'Which crop should I grow?',
      'How to control plant diseases?',
      'When should I water my crops?',
      'Which fertilizer is suitable?',
      'What is the best season for growing rice?'
    ],

    // Footer
    footerDesc: 'KrishiMitra bridges advanced AI precision agronomy with grassroots Indian farming to protect crops and boost harvest profits.',
    footerUsefulLinks: 'Useful Links',
    footerGovtPortals: 'Govt Agri Portals',
    footerContactInfo: 'Contact Information',
    footerTollFree: 'National Kisan Call Center (Toll-Free)',
    footerAllRights: 'All rights reserved.',
    footerMadeForFarmers: 'Crafted with pride for Indian Farmers',
    footerFreeBadge: '100% Free & Open for all Farmers'
  },

  hi: {
    // Brand
    brandName: 'कृषिमित्र',
    brandTagline: 'स्मार्ट किसान सहायक',
    activeBeta: 'स्मार्ट कृषि',
    bannerAlertBadge: 'रबी अलर्ट',
    bannerAlertText: 'क्षेत्रों में हल्की बारिश का अनुमान। यूरिया का छिड़काव 48 घंटे के लिए टालें।',

    // Navigation
    navHome: 'होम',
    navDashboard: 'डैशबोर्ड',
    navFarmingRecords: 'कृषि रिकॉर्ड्स',
    navCalendar: 'स्मार्ट कैलेंडर',
    navFarmerProfile: 'किसान प्रोफ़ाइल',
    navCropRecommendation: 'फसल सिफारिश',
    navWeather: 'मौसम',
    navDiseaseDetection: 'रोग पहचान',
    navAiAssistant: 'एआई सहायक',
    navSignIn: 'साइन इन',
    navRegister: 'पंजीकरण',
    navProfile: 'मेरी प्रोफाइल',
    navSettings: 'सेटिंग्स',
    navLogout: 'लॉगआउट',

    // Hero Section
    heroBadge: 'कृषिमित्र • स्मार्ट किसान सहायक',
    heroHeadingMain: 'स्मार्ट खेती, ',
    heroHeadingHighlight: 'बेहतर भविष्य।',
    heroDescription: 'स्मार्ट फसल सिफारिशें, मौसम अपडेट और कृषि मार्गदर्शन प्राप्त करें।',
    heroGetStarted: 'शुरू करें',
    heroExploreFeatures: 'सुविधाएं देखें',
    heroFreeBadge: 'किसानों के लिए 100% मुफ़्त',
    heroAiPrecision: 'एआई सटीकता',
    heroLocalForecast: 'स्थानीय मौसम',
    heroScanLeafDemo: 'पौधे के रोग की जांच करें',
    heroIdealSpray: 'आज छिड़काव का समय: अनुकूल',

    // Feature Cards
    featuresHeaderBadge: 'किसान हितैषी सुविधाएं',
    featuresHeading: 'व्यापक स्मार्ट कृषि उपकरण',
    featuresSubheading: 'लागत कम करने, फसल रोग रोकने और सर्वोत्तम मंडी मूल्य प्राप्त करने के लिए संपूर्ण जानकारी।',
    
    featCropRecTitle: 'एआई फसल सिफारिश',
    featCropRecDesc: 'अपनी मिट्टी, मौसम और पानी की उपलब्धता के आधार पर सर्वाधिक लाभ देने वाली फसलों का चयन करें।',
    featCropRecAction: 'फसल सलाह लें',

    featDiseaseTitle: 'पौधों के रोग की पहचान',
    featDiseaseDesc: 'पत्ती की तस्वीर अपलोड करें और कुछ ही सेकंड में 120+ रोगों की पहचान व जैविक/रासायनिक उपचार जानें।',
    featDiseaseAction: 'पत्ती स्कैन करें',
    cameraOpen: 'कैमरा खोलें',
    cameraCapture: 'फोटो खींचें',
    cameraRetake: 'दोबारा फोटो लें',
    cameraSwitch: 'कैमरा बदलें',
    cameraClose: 'कैमरा बंद करें',
    uploadGallery: 'गैलरी से अपलोड करें',
    detectDiseaseBtn: 'रोग पहचानें',
    removePhoto: 'फोटो हटाएं',

    featWeatherTitle: 'मौसम पूर्वानुमान',
    featWeatherDesc: 'अपने गांव के लिए सटीक वर्षा संभावना, आर्द्रता, हवा की गति और सुरक्षित कीटनाशक छिड़काव का समय जानें।',
    featWeatherAction: 'पूर्वानुमान देखें',

    featSoilTitle: 'मिट्टी की जानकारी',
    featSoilDesc: 'मिट्टी की उर्वरता समझें, एन-पी-के संतुलन जांचें और अपनी एकड़ के अनुसार यूरिया व डीएपी की बोरियां गिनें।',
    featSoilAction: 'उर्वरक की गणना करें',

    featAssistantTitle: 'कृषि सहायक',
    featAssistantDesc: 'सरल भाषा में कोई भी कृषि प्रश्न पूछें। बुवाई, कीट प्रबंधन और सरकारी योजनाओं पर तुरंत जवाब पाएं।',
    featAssistantAction: 'सहायक से बात करें',

    featMarketTitle: 'मंडी भाव जानकारी',
    featMarketDesc: 'गेहूं, कपास, सोयाबीन, प्याज सहित विभिन्न फसलों के दैनिक लाइव एपीएमसी मंडी भाव देखें।',
    featMarketAction: 'मंडी भाव देखें',

    // Dashboard
    dashWelcome: 'नमस्ते',
    dashActiveFarmer: 'सक्रिय किसान',
    dashRabiSeason: 'रबी सीजन 2026',
    dashOverviewBanner: 'कृषिमित्र स्मार्ट किसान डैशबोर्ड',
    dashSprayWindowOpen: 'आज शाम 4:00 बजे तक छिड़काव के लिए मौसम अनुकूल है।',
    dashScanLeafBtn: 'पत्ती स्कैन करें',
    dashAskAiBtn: 'एआई सहायक से पूछें',
    dashFarmerPortal: 'किसान पोर्टल',
    dashNavMenu: 'नेविगेशन मेनू',
    dashBackHome: 'मुख्य वेबसाइट पर वापस जाएं',
    dashHelpline: 'टोल-फ्री हेल्पलाइन',
    dashFarmGps: 'खेत जीपीएस नक्शा',
    dashChange: 'बदलें',
    dashViewForecast: '5-दिवसीय पूर्वानुमान देखें',
    dashRunCropAi: 'फसल एआई इंजन चलाएं',
    dashScanPlantLeaf: 'पौधे की पत्ती स्कैन करें',
    dashCalcFertilizer: 'उर्वरक की बोरियां गिनें',
    dashLaunchChat: 'एआई सहायक चैट शुरू करें',

    dashWeatherCardTitle: 'मौसम पूर्वानुमान',
    dashCropCardTitle: 'फसल सलाह',
    dashDiseaseCardTitle: 'फसल डॉक्टर',
    dashSoilCardTitle: 'मिट्टी स्वास्थ्य',
    dashFarmingTipsTitle: 'आज के कृषि सुझाव व ज्ञान',
    dashActivitiesTitle: 'हाल की गतिविधियां',

    // Common Farming Information & Tips
    tipSprayTimeTitle: 'कीटनाशक छिड़काव का सही समय',
    tipSprayTimeDesc: 'सुबह 7:00 से 11:00 और शाम 3:30 से 5:30 बजे। हवा की गति 15 किमी/घंटा से कम होने पर ही छिड़कें।',
    tipIrrigationTitle: 'सिंचाई का सर्वोत्तम समय',
    tipIrrigationDesc: 'बारिश से 48 घंटे पहले भारी सिंचाई रोकें। वाष्पीकरण से बचने के लिए शाम को ड्रिप सिंचाई करें।',
    tipRainWarningTitle: 'बारिश व तूफान की चेतावनी',
    tipRainWarningDesc: 'अगले 48 घंटों में हल्की से मध्यम वर्षा संभव है। खेतों में जलभराव रोकने के लिए नालियां साफ रखें।',
    tipPrecautionsTitle: 'मौसम संबंधी सावधानियां',
    tipPrecautionsDesc: 'अधिक सुबह की नमी फफूंद व पाउडरी मिल्ड्यू को बढ़ावा देती है। पत्तियों के नीचे नियमित जांच करें।',

    // Weather page
    weatherHeading: 'मौसम आधारित कृषि सिफारिशें',
    weatherBackHome: 'होम पर वापस जाएं',

    // Chatbot
    chatTitle: 'कृषिमित्र एआई कृषि सहायक',
    chatStatusOnline: 'ऑनलाइन • 24/7 सक्रिय',
    chatSuggestedTitle: 'सुझाए गए प्रश्न (पूछने के लिए क्लिक करें):',
    chatPlaceholder: 'फसलों, मिट्टी, कीट, उर्वरक, मौसम के बारे में पूछें...',
    chatSendBtn: 'भेजें',
    chatClearBtn: 'चैट रीसेट करें',
    chatTyping: 'कृषिमित्र एआई सलाह तैयार कर रहा है...',
    chatInitialGreeting: '🙏 **नमस्ते किसान भाई!** मैं आपका 24/7 स्मार्ट कृषि सलाहकार **कृषिमित्र एआई** हूं।\n\nआप मुझसे फसल चयन, कीट नियंत्रण, उर्वरक खुराक, सिंचाई समय और सरकारी योजनाओं के बारे में पूछ सकते हैं।\n\n*शुरू करने के लिए नीचे दिए गए प्रश्नों पर क्लिक करें या सीधे लिखें!*',
    voiceStart: 'आवाज से पूछें',
    voiceStop: 'आवाज रोकें',
    voiceListening: 'सुन रहे हैं... अब बोलें',
    voiceReadAloud: 'बोलकर सुनाएं',
    voiceStopReading: 'रोकें',
    voiceNotSupported: 'आपके ब्राउज़र में आवाज पहचान समर्थित नहीं है। कृपया गूगल क्रोम का उपयोग करें या नीचे लिखें।',

    chatQuestions: [
      'मुझे कौन सी फसल उगानी चाहिए?',
      'पौधों के रोगों को कैसे नियंत्रित करें?',
      'मुझे अपनी फसलों को पानी कब देना चाहिए?',
      'कौन सा उर्वरक उपयुक्त है?',
      'चावल उगाने के लिए सबसे अच्छा मौसम कौन सा है?'
    ],

    // Footer
    footerDesc: 'कृषिमित्र उन्नत एआई कृषि विज्ञान को भारतीय किसानों से जोड़कर फसलों की सुरक्षा और मुनाफा बढ़ाता है।',
    footerUsefulLinks: 'महत्वपूर्ण लिंक',
    footerGovtPortals: 'सरकारी कृषि पोर्टल',
    footerContactInfo: 'संपर्क जानकारी',
    footerTollFree: 'राष्ट्रीय किसान कॉल सेंटर (टोल-फ्री)',
    footerAllRights: 'सर्वाधिकार सुरक्षित।',
    footerMadeForFarmers: 'भारतीय किसानों के लिए गर्व से निर्मित',
    footerFreeBadge: 'सभी किसानों के लिए 100% मुफ़्त'
  }
};
