import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getOfflineSavedCrops,
  saveCropOffline,
  removeSavedCropOffline,
  getOfflineSavedTips,
  getOfflineSavedDiseases,
  saveDiseaseOffline,
  initializeOfflineStorage
} from '../utils/offlineStorage';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  // Real-time online/offline detector using browser navigator.onLine
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Simulated offline mode toggle to allow testing offline functionality easily
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(() => {
    try {
      return localStorage.getItem('krishimitra_simulated_offline') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Offline modal state
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Cached data states
  const [savedCrops, setSavedCrops] = useState(() => getOfflineSavedCrops());
  const [savedTips, setSavedTips] = useState(() => getOfflineSavedTips());
  const [savedDiseases, setSavedDiseases] = useState(() => getOfflineSavedDiseases());

  // Listen to browser network changes
  useEffect(() => {
    initializeOfflineStorage();

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register PWA Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('KrishiMitra Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('Service Worker registration skipped or failed:', error);
          });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle simulated offline mode for demonstration & testing
  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('krishimitra_simulated_offline', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Save crop to local storage
  const saveCropLocally = (crop) => {
    const updated = saveCropOffline(crop);
    setSavedCrops(updated);
  };

  // Remove crop from local storage
  const removeCropLocally = (cropId) => {
    const updated = removeSavedCropOffline(cropId);
    setSavedCrops(updated);
  };

  // Save disease result to local storage
  const saveDiseaseLocally = (disease) => {
    const updated = saveDiseaseOffline(disease);
    setSavedDiseases(updated);
  };

  // Effective offline state: either real network offline or simulated offline
  const isOffline = !isOnline || isSimulatedOffline;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        isOffline,
        toggleSimulatedOffline,
        savedCrops,
        savedTips,
        savedDiseases,
        saveCropLocally,
        removeCropLocally,
        saveDiseaseLocally,
        isOfflineModalOpen,
        setIsOfflineModalOpen,
        openOfflineGuide: () => setIsOfflineModalOpen(true),
        closeOfflineGuide: () => setIsOfflineModalOpen(false)
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

