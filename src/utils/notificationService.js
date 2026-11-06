// KrishiMitra Notification & Reminder Service
// Handles client-side Web Notification API and prepares future server-side
// scheduled push notification payloads (e.g. Firebase Cloud Messaging / mKisan SMS).

/**
 * Check if the browser supports standard Web Notifications
 */
export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission: 'default' | 'granted' | 'denied'
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from farmer
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Send an immediate browser notification if permission is granted
 * @param {string} title
 * @param {Object} [options={}]
 */
export function sendBrowserNotification(title, options = {}) {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const defaultOptions = {
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: options.tag || 'krishimitra-reminder',
      renotify: true,
      body: options.body || 'Smart Farming Reminder from KrishiMitra',
      ...options
    };

    return new Notification(title, defaultOptions);
  } catch (err) {
    console.warn('Could not display Notification:', err);
    return null;
  }
}

/**
 * Check all pending reminders and trigger browser notifications for ones due today or overdue
 * @param {Array} reminders
 * @returns {number} count of reminders triggered
 */
export function checkDueRemindersAndNotify(reminders = []) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return 0;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  let triggeredCount = 0;

  reminders.forEach((rem) => {
    if (rem.status === 'pending' && !rem.notified && rem.dueDate <= todayStr) {
      const typeLabel =
        rem.type === 'irrigation' ? '💧 Irrigation Reminder' :
        rem.type === 'fertilizer' ? '🧪 Fertilizer Application' :
        rem.type === 'pest_monitoring' ? '🐛 Pest Alert' : '🌱 Crop Inspection';

      sendBrowserNotification(`${typeLabel}: ${rem.cropName}`, {
        body: `${rem.title} — ${rem.description}`,
        tag: `reminder-${rem.id}`,
        requireInteraction: rem.priority === 'high'
      });

      triggeredCount++;
    }
  });

  return triggeredCount;
}

/**
 * Prepares a structured payload for future server-side scheduled push/SMS delivery.
 * This can be sent to a backend queue (e.g. AWS SQS, BullMQ, Firebase Cloud Messaging, or mKisan gateway).
 *
 * @param {Object} reminder
 * @param {Object} farmerProfile
 * @returns {Object}
 */
export function prepareServerScheduledNotificationPayload(reminder, farmerProfile) {
  return {
    notificationId: `PUSH-${reminder.id}`,
    scheduleTimestamp: `${reminder.dueDate}T${reminder.dueTime || '08:00'}:00.000Z`,
    channel: 'SMS_AND_PUSH',
    recipient: {
      farmerId: farmerProfile?.farmerId || 'KM-2026-8842',
      name: farmerProfile?.name || 'Farmer',
      mobile: farmerProfile?.mobile || '',
      preferredLanguage: farmerProfile?.preferredLanguage || 'kn',
      district: farmerProfile?.district || 'Nashik',
      state: farmerProfile?.state || 'Maharashtra'
    },
    message: {
      title: `KrishiMitra: ${reminder.title}`,
      crop: reminder.cropName,
      type: reminder.type,
      priority: reminder.priority,
      actionRequired: reminder.description,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime
    },
    meta: {
      clientEngine: 'IndexedDB',
      appVersion: '2.0.0',
      cloudSyncReady: true
    }
  };
}

