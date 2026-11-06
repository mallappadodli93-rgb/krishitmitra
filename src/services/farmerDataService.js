// KrishiMitra Farmer Data Management Service
// Abstraction service layer that decouples UI components from the underlying storage engine.
// Currently powered by browser-native IndexedDB for high-capacity offline storage.
// Structured to be swapped with REST API / GraphQL calls when backend is deployed.

import {
  getFarmerProfileFromDB,
  saveFarmerProfileToDB,
  getAllFarmingRecordsFromDB,
  getFarmingRecordByIdFromDB,
  addFarmingRecordToDB,
  updateFarmingRecordInDB,
  deleteFarmingRecordFromDB,
  getAllCropSchedulesFromDB,
  saveCropScheduleToDB,
  deleteCropScheduleFromDB,
  getAllFarmingRemindersFromDB,
  addFarmingReminderToDB,
  updateFarmingReminderInDB,
  deleteFarmingReminderFromDB,
  exportAllDataToJSON,
  exportRecordsToCSV,
  importDataFromJSON,
  seedIndexedDBIfEmpty,
  DEFAULT_INDEXEDDB_PROFILE,
  DEFAULT_FARM_LOCATIONS,
  CROP_SCHEDULE_TEMPLATES,
  getAllFarmLocationsFromDB,
  saveFarmLocationToDB,
  updateFarmLocationInDB,
  deleteFarmLocationFromDB,
  setPrimaryFarmLocationInDB,
  getAllDiseaseScansFromDB,
  saveDiseaseScanToDB,
  deleteDiseaseScanFromDB,
  getAllChatSessionsFromDB,
  getChatSessionByIdFromDB,
  saveChatSessionToDB,
  deleteChatSessionFromDB,
  clearAllChatSessionsFromDB
} from '../utils/indexedDBStorage';

import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  checkDueRemindersAndNotify,
  prepareServerScheduledNotificationPayload
} from '../utils/notificationService';

/**
 * Get current storage engine metadata for transparent UI status
 */
export function getStorageEngineInfo() {
  return {
    engine: 'IndexedDB',
    isCloudSynced: false,
    badgeText: 'Local IndexedDB (Offline-Protected)',
    cloudSyncStatus: 'Pending Backend Integration',
    description: 'Farmer details, crop records, schedules, and photos are stored locally in IndexedDB on this device. Data is preserved across sessions and accessible without internet.'
  };
}

/**
 * Initialize data storage and seed default demo data if first visit
 */
export async function initializeFarmerData() {
  await seedIndexedDBIfEmpty();
}

// ==========================================
// 1. Farmer Profile & Farm Details
// ==========================================

export async function fetchFarmerProfile() {
  try {
    return await getFarmerProfileFromDB();
  } catch (err) {
    console.error('Failed to fetch profile from IndexedDB, using fallback:', err);
    return DEFAULT_INDEXEDDB_PROFILE;
  }
}

export async function saveFarmerProfile(profileData) {
  try {
    return await saveFarmerProfileToDB(profileData);
  } catch (err) {
    console.error('Failed to save profile to IndexedDB:', err);
    throw err;
  }
}

// ==========================================
// 2. Farming Records (Crop Logs)
// ==========================================

export async function fetchFarmingRecords(filters = {}) {
  try {
    let records = await getAllFarmingRecordsFromDB();

    if (filters.season && filters.season !== 'All') {
      records = records.filter(r => r.season?.toLowerCase() === filters.season.toLowerCase());
    }

    if (filters.status && filters.status !== 'All') {
      records = records.filter(r => r.status?.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      records = records.filter(r =>
        r.cropName?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.soilType?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }

    return records;
  } catch (err) {
    console.error('Failed to fetch records from IndexedDB:', err);
    throw err;
  }
}

export async function fetchFarmingRecordById(id) {
  return await getFarmingRecordByIdFromDB(id);
}

export async function createFarmingRecord(recordData) {
  return await addFarmingRecordToDB(recordData);
}

export async function updateFarmingRecord(recordData) {
  return await updateFarmingRecordInDB(recordData);
}

export async function deleteFarmingRecord(id) {
  return await deleteFarmingRecordFromDB(id);
}

// ==========================================
// 3. Crop Schedules
// ==========================================

export async function fetchCropSchedules() {
  return await getAllCropSchedulesFromDB();
}

export async function createOrUpdateCropSchedule(scheduleData) {
  return await saveCropScheduleToDB(scheduleData);
}

export async function deleteCropSchedule(id) {
  return await deleteCropScheduleFromDB(id);
}

export function getCropScheduleTemplates() {
  return CROP_SCHEDULE_TEMPLATES;
}

// ==========================================
// 4. Farming Reminders
// ==========================================

export async function fetchFarmingReminders(filters = {}) {
  let reminders = await getAllFarmingRemindersFromDB();

  if (filters.type && filters.type !== 'all') {
    reminders = reminders.filter(r => r.type === filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    reminders = reminders.filter(r => r.status === filters.status);
  }

  return reminders;
}

export async function createFarmingReminder(reminderData) {
  return await addFarmingReminderToDB(reminderData);
}

export async function updateFarmingReminder(reminderData) {
  return await updateFarmingReminderInDB(reminderData);
}

export async function deleteFarmingReminder(id) {
  return await deleteFarmingReminderFromDB(id);
}

export async function toggleReminderCompleted(reminder) {
  const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';
  return await updateFarmingReminderInDB({
    ...reminder,
    status: newStatus
  });
}

// ==========================================
// 5. Image & File Helpers
// ==========================================

export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export async function downloadExportedJSON() {
  const jsonString = await exportAllDataToJSON();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `krishimitra_farm_data_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export async function downloadExportedCSV() {
  const csvString = await exportRecordsToCSV();
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `krishimitra_crop_records_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export async function importJSONFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for import'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const result = await importDataFromJSON(content);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read import file'));
    reader.readAsText(file);
  });
}

// ==========================================
// 5. Multiple Farm Locations Management
// ==========================================

export async function fetchFarmLocations() {
  try {
    return await getAllFarmLocationsFromDB();
  } catch (err) {
    console.error('Failed to fetch farm locations from IndexedDB, using fallback:', err);
    return DEFAULT_FARM_LOCATIONS;
  }
}

export async function saveFarmLocation(locationData) {
  try {
    return await saveFarmLocationToDB(locationData);
  } catch (err) {
    console.error('Failed to save farm location to IndexedDB:', err);
    throw err;
  }
}

export async function updateFarmLocation(locationData) {
  try {
    return await updateFarmLocationInDB(locationData);
  } catch (err) {
    console.error('Failed to update farm location in IndexedDB:', err);
    throw err;
  }
}

export async function deleteFarmLocation(id) {
  try {
    return await deleteFarmLocationFromDB(id);
  } catch (err) {
    console.error('Failed to delete farm location from IndexedDB:', err);
    throw err;
  }
}

export async function setPrimaryFarmLocation(id) {
  try {
    return await setPrimaryFarmLocationInDB(id);
  } catch (err) {
    console.error('Failed to set primary farm location in IndexedDB:', err);
    throw err;
  }
}

// ==========================================
// 6. Crop Disease Scans & AI Diagnosis History
// ==========================================

export async function fetchDiseaseScans() {
  try {
    return await getAllDiseaseScansFromDB();
  } catch (err) {
    console.error('Failed to fetch disease scans from IndexedDB:', err);
    return [];
  }
}

export async function saveDiseaseScan(scanRecord) {
  try {
    return await saveDiseaseScanToDB(scanRecord);
  } catch (err) {
    console.error('Failed to save disease scan to IndexedDB:', err);
    throw err;
  }
}

export async function deleteDiseaseScan(id) {
  try {
    return await deleteDiseaseScanFromDB(id);
  } catch (err) {
    console.error('Failed to delete disease scan from IndexedDB:', err);
    throw err;
  }
}

// ==========================================
// 7. AI Chatbot Sessions Repository
// ==========================================

export async function fetchChatSessions() {
  try {
    return await getAllChatSessionsFromDB();
  } catch (err) {
    console.error('Failed to fetch chat sessions:', err);
    return [];
  }
}

export async function fetchChatSessionById(id) {
  try {
    return await getChatSessionByIdFromDB(id);
  } catch (err) {
    console.error('Failed to fetch chat session:', err);
    return null;
  }
}

export async function saveChatSession(session) {
  try {
    return await saveChatSessionToDB(session);
  } catch (err) {
    console.error('Failed to save chat session:', err);
    throw err;
  }
}

export async function deleteChatSession(id) {
  try {
    return await deleteChatSessionFromDB(id);
  } catch (err) {
    console.error('Failed to delete chat session:', err);
    throw err;
  }
}

export async function clearAllChatSessions() {
  try {
    return await clearAllChatSessionsFromDB();
  } catch (err) {
    console.error('Failed to clear chat sessions:', err);
    throw err;
  }
}

// Re-export notification functions
export {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  checkDueRemindersAndNotify,
  prepareServerScheduledNotificationPayload
};

