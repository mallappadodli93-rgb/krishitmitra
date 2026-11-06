import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Droplets,
  Sprout,
  AlertTriangle,
  Bug,
  Plus,
  CheckCircle2,
  Bell,
  BellRing,
  Trash2,
  Edit,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck,
  Search,
  Filter,
  Download,
  Share2,
  ShieldCheck,
  Globe,
  ChevronDown,
  Database
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchCropSchedules,
  createOrUpdateCropSchedule,
  deleteCropSchedule,
  fetchFarmingReminders,
  createFarmingReminder,
  updateFarmingReminder,
  deleteFarmingReminder,
  toggleReminderCompleted,
  getCropScheduleTemplates,
  fetchFarmerProfile,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  checkDueRemindersAndNotify,
  prepareServerScheduledNotificationPayload
} from '../services/farmerDataService';

export default function FarmingCalendarPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const templates = getCropScheduleTemplates();

  const [schedules, setSchedules] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Notification state
  const [notificationPerm, setNotificationPerm] = useState(() => getNotificationPermission());
  const [notificationMsg, setNotificationMsg] = useState('');

  // Reminder Filters
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // 'all' | 'irrigation' | 'fertilizer' | 'inspection' | 'pest_monitoring'
  const [activeStatusFilter, setActiveStatusFilter] = useState('pending'); // 'pending' | 'completed' | 'all'

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);
  const [isDeleteReminderModalOpen, setIsDeleteReminderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Error alerts
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // New Schedule Form State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('Wheat (HD-3086)');
  const [scheduleForm, setScheduleForm] = useState({
    cropName: 'Wheat (HD-3086 / Gehun / ಗೋಧಿ)',
    variety: 'HD-3086 (Pusa Tejas)',
    fieldArea: 3.0,
    landUnit: 'Acres',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    autoGenerateReminders: true
  });

  // Reminder Form State
  const initialReminderForm = {
    id: '',
    scheduleId: '',
    cropName: 'Wheat (HD-3086)',
    type: 'irrigation',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '08:00',
    priority: 'high',
    description: '',
    status: 'pending'
  };
  const [reminderForm, setReminderForm] = useState(initialReminderForm);

  // Auto-update harvest date when planting date or template changes
  useEffect(() => {
    const tmpl = templates[selectedTemplateKey];
    if (tmpl && scheduleForm.plantingDate) {
      const pDate = new Date(scheduleForm.plantingDate);
      if (!isNaN(pDate.getTime())) {
        const hDate = new Date(pDate.getTime() + (tmpl.durationDays || 120) * 24 * 60 * 60 * 1000);
        setScheduleForm(prev => ({
          ...prev,
          cropName: tmpl.cropName,
          expectedHarvestDate: hDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [selectedTemplateKey, scheduleForm.plantingDate]);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schedList, remList, profile] = await Promise.all([
        fetchCropSchedules(),
        fetchFarmingReminders(),
        fetchFarmerProfile()
      ]);
      setSchedules(schedList);
      setReminders(remList);
      setFarmerProfile(profile);

      // Check due reminders and notify if permitted
      if (notificationPerm === 'granted') {
        const count = checkDueRemindersAndNotify(remList);
        if (count > 0) {
          setNotificationMsg(`Checked reminders: ${count} due farming alerts sent to your browser.`);
        }
      }
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      setErrorMessage('Could not load schedules from IndexedDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Request Notification Permission
  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPerm(perm);
    if (perm === 'granted') {
      sendBrowserNotification('KrishiMitra Alerts Activated! 🌾', {
        body: 'You will receive timely reminders for crop irrigation, fertilizers, and pest monitoring.',
        tag: 'welcome-notification'
      });
      setSuccessMessage('Browser notifications enabled! Timely farming alerts will appear here.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else if (perm === 'denied') {
      setErrorMessage('Browser notification permission was denied in your browser settings.');
    }
  };

  // Submit New Crop Schedule
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.cropName || !scheduleForm.plantingDate) {
      setErrorMessage('Please provide crop name and planting date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const tmpl = templates[selectedTemplateKey];
      const newSchedule = {
        cropName: scheduleForm.cropName,
        variety: scheduleForm.variety,
        fieldArea: scheduleForm.fieldArea,
        landUnit: scheduleForm.landUnit,
        plantingDate: scheduleForm.plantingDate,
        expectedHarvestDate: scheduleForm.expectedHarvestDate,
        currentStageIndex: 0,
        stages: tmpl?.stages || [
          { name: 'Sowing & Germination', days: '0 - 15 DAS', desc: 'Crop emergence' },
          { name: 'Vegetative Growth', days: '20 - 50 DAS', desc: 'Active branching' },
          { name: 'Flowering & Fruiting', days: '55 - 90 DAS', desc: 'Bloom and fruit set' },
          { name: 'Maturity & Harvest', days: '95 - 120 DAS', desc: 'Harvest stage' }
        ],
        notes: `Created on ${new Date().toLocaleDateString()}`
      };

      const savedSchedule = await createOrUpdateCropSchedule(newSchedule);

      // Auto-generate suggested reminders if selected
      if (scheduleForm.autoGenerateReminders && tmpl?.suggestedReminders) {
        const plantBaseDate = new Date(scheduleForm.plantingDate);
        for (const rem of tmpl.suggestedReminders) {
          const dueDateObj = new Date(plantBaseDate.getTime() + rem.daysAfterPlanting * 24 * 60 * 60 * 1000);
          await createFarmingReminder({
            scheduleId: savedSchedule.id,
            cropName: savedSchedule.cropName.split(' ')[0],
            type: rem.type,
            title: rem.title,
            dueDate: dueDateObj.toISOString().split('T')[0],
            dueTime: '08:00',
            priority: rem.priority,
            description: rem.desc,
            isSuggested: true,
            status: 'pending'
          });
        }
      }

      setIsScheduleModalOpen(false);
      setSuccessMessage(`Schedule created for ${savedSchedule.cropName} with editable reminder suggestions!`);
      await loadData();
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      console.error('Error saving schedule:', err);
      setErrorMessage('Failed to save crop schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Reminder (Add or Edit)
  const handleSubmitReminder = async (e) => {
    e.preventDefault();
    if (!reminderForm.title || !reminderForm.dueDate) {
      setErrorMessage('Please enter title and due date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      if (activeReminder?.id) {
        await updateFarmingReminder({
          ...reminderForm,
          id: activeReminder.id
        });
        setSuccessMessage('Reminder updated successfully!');
      } else {
        await createFarmingReminder(reminderForm);
        setSuccessMessage('New farming reminder scheduled in IndexedDB!');
      }

      setIsReminderModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to save reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Reminder
  const handleConfirmDeleteReminder = async () => {
    if (!activeReminder?.id) return;
    try {
      setIsSubmitting(true);
      await deleteFarmingReminder(activeReminder.id);
      setIsDeleteReminderModalOpen(false);
      setSuccessMessage('Reminder removed from IndexedDB.');
      await loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to delete reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (scheduleId, cropName) => {
    if (confirm(`Are you sure you want to delete the schedule for ${cropName}?`)) {
      try {
        await deleteCropSchedule(scheduleId);
        setSuccessMessage(`Schedule for ${cropName} deleted.`);
        await loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setErrorMessage('Failed to delete schedule.');
      }
    }
  };

  // Toggle Reminder Status (Completed / Pending)
  const handleToggleReminder = async (rem) => {
    try {
      await toggleReminderCompleted(rem);
      await loadData();
    } catch (err) {
      setErrorMessage('Failed to update reminder status.');
    }
  };

  // Export Server-Scheduled Notification Payload (for future cloud integration)
  const handleExportServerPayload = () => {
    const pendingReminders = reminders.filter(r => r.status === 'pending');
    const payloads = pendingReminders.map(rem =>
      prepareServerScheduledNotificationPayload(rem, farmerProfile)
    );
    const jsonStr = JSON.stringify({
      targetIntegration: 'Future Cloud Push / SMS Server Gateway',
      totalScheduledAlerts: payloads.length,
      alerts: payloads
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishimitra_server_scheduled_payload_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter reminders for display
  const filteredReminders = reminders.filter((rem) => {
    const matchType = activeTypeFilter === 'all' || rem.type === activeTypeFilter;
    const matchStatus = activeStatusFilter === 'all' || rem.status === activeStatusFilter;
    return matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-24">
      
      {/* 1. Header Navigation */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('dashBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.name || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    ಆಯ್ಕೆ / Language:
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center justify-between ${
                        language === lang.code ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === 'kn' ? 'ಕೃಷಿ ಕ್ಯಾಲೆಂಡರ್' : language === 'hi' ? 'कृषि कैलेंडर' : 'Farming Calendar'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Badge variant="emerald" icon={CalendarIcon}>
                Smart Agronomic Calendar & Reminders
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Smart Crop Calendar & Field Reminders
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Track growth stages from sowing to harvest. Manage timely irrigation, fertilizer doses, inspections, and pest alerts saved locally in IndexedDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsScheduleModalOpen(true)}
              className="font-bold shadow-md shadow-emerald-600/20"
            >
              + Create Crop Schedule
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Bell}
              onClick={() => {
                setActiveReminder(null);
                setReminderForm(initialReminderForm);
                setIsReminderModalOpen(true);
              }}
              className="border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 font-bold"
            >
              + Add Custom Reminder
            </Button>

            <button
              type="button"
              onClick={handleExportServerPayload}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Download future cloud push integration payload"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>Server-Sync Payload</span>
            </button>
          </div>
        </div>

        {/* Browser Notification Permission Banner */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              notificationPerm === 'granted'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {notificationPerm === 'granted' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900">
                  Browser Reminder Alerts:
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  notificationPerm === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : notificationPerm === 'denied'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {notificationPerm === 'granted' ? 'Active / Enabled' : notificationPerm === 'denied' ? 'Blocked in Settings' : 'Permission Needed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {notificationPerm === 'granted'
                  ? 'Browser notifications are active. Due irrigation and pest alerts will appear on your desktop or phone.'
                  : 'Grant browser notification permission to receive audible alerts for upcoming irrigation and fertilizer timings.'}
              </p>
            </div>
          </div>

          {notificationPerm !== 'granted' && isNotificationSupported() && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm shrink-0"
            >
              Enable Browser Alerts
            </button>
          )}
        </div>

        {/* Success / Error Messages */}
        {successMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================== */}
        {/* 1. ACTIVE CROP SCHEDULES & GROWTH STAGES  */}
        {/* ========================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>Active Crop Schedules & Growth Stages</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              {schedules.length} Schedules Active
            </span>
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 space-y-3">
              <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                No crop schedules created yet. Create a schedule to monitor plant development stages and auto-generate suggested reminders.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsScheduleModalOpen(true)}
              >
                Create First Crop Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {schedules.map((sch) => (
                <Card
                  key={sch.id}
                  className="p-6 border-slate-200 hover:border-emerald-300 shadow-sm bg-white space-y-5 transition"
                >
                  {/* Schedule Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {sch.cropName}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {sch.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Variety: <strong>{sch.variety}</strong> • Area: <strong>{sch.fieldArea} {sch.landUnit || 'Acres'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Sown to Harvest</span>
                        <span className="font-extrabold text-slate-800">
                          {sch.plantingDate} → {sch.expectedHarvestDate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(sch.id, sch.cropName)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Growth Stages Interactive Stepper */}
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-2">
                      Crop Growth Stages (Crop Development Progress)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {(sch.stages || []).map((stg, sIdx) => {
                        const isCurrent = sIdx === (sch.currentStageIndex || 0);
                        const isPassed = sIdx < (sch.currentStageIndex || 0);

                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-2xl border text-xs transition ${
                              isCurrent
                                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/30'
                                : isPassed
                                ? 'bg-slate-50 border-emerald-200 text-slate-700'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black uppercase ${isCurrent ? 'text-emerald-700' : 'text-slate-400'}`}>
                                Stage {sIdx + 1}
                              </span>
                              {isCurrent && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              )}
                              {isPassed && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <span className="font-extrabold text-slate-900 block truncate leading-tight">
                              {stg.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {stg.days}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 2. UPCOMING FARMING REMINDERS & ACTIVITIES */}
        {/* ========================================== */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Upcoming Farming Reminders & Field Activities</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Crop-specific reminders are editable suggestions designed to prevent water stress and disease attacks.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTypeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Activities
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeFilter('irrigation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTypeFilter === 'irrigation'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Irrigation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeFilter('fertilizer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTypeFilter === 'fertilizer'
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-white text-green-800 border border-green-200 hover:bg-green-50'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Fertilizer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeFilter('pest_monitoring')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTypeFilter === 'pest_monitoring'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Pest Alert</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTypeFilter('inspection')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTypeFilter === 'inspection'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Inspection</span>
              </button>
            </div>
          </div>

          {/* Status Tabs: Pending vs Completed */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeStatusFilter === 'pending'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending Reminders ({reminders.filter(r => r.status === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveStatusFilter('completed')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeStatusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({reminders.filter(r => r.status === 'completed').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeStatusFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Show All ({reminders.length})
            </button>
          </div>

          {/* Reminders List Cards */}
          {filteredReminders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 text-xs text-slate-500">
              No reminders found for the selected filter. Click "+ Add Custom Reminder" to add an alert.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReminders.map((rem) => {
                const isDone = rem.status === 'completed';
                const typeIcon =
                  rem.type === 'irrigation' ? <Droplets className="w-4 h-4 text-blue-600" /> :
                  rem.type === 'fertilizer' ? <Sprout className="w-4 h-4 text-green-600" /> :
                  rem.type === 'pest_monitoring' ? <Bug className="w-4 h-4 text-amber-600" /> :
                  <CalendarCheck className="w-4 h-4 text-purple-600" />;

                const typeColor =
                  rem.type === 'irrigation' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                  rem.type === 'fertilizer' ? 'bg-green-50 border-green-200 text-green-900' :
                  rem.type === 'pest_monitoring' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-purple-50 border-purple-200 text-purple-900';

                return (
                  <Card
                    key={rem.id}
                    className={`p-5 border transition flex flex-col justify-between ${
                      isDone
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${typeColor}`}>
                            {typeIcon}
                            <span className="capitalize">{rem.type.replace('_', ' ')}</span>
                          </span>
                          <span className="text-xs font-extrabold text-slate-700">
                            {rem.cropName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {rem.isSuggested && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                              Suggestion
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            rem.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rem.priority} Priority
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className={`text-base font-bold text-slate-900 mb-1 ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {rem.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rem.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Due: {rem.dueDate} ({rem.dueTime || '08:00'})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle Complete */}
                        <button
                          type="button"
                          onClick={() => handleToggleReminder(rem)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                            isDone
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Mark Pending' : 'Mark Done'}</span>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReminder(rem);
                            setReminderForm(rem);
                            setIsReminderModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                          title="Edit reminder"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReminder(rem);
                            setIsDeleteReminderModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* ========================================== */}
      {/* MODAL 1: CREATE CROP SCHEDULE             */}
      {/* ========================================== */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Create Smart Crop Schedule"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitSchedule} className="space-y-4">
          
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Select an Indian crop template to auto-populate growth stages and suggested irrigation/fertilizer reminders.</span>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Crop Template (Editable Suggestion)
            </label>
            <select
              value={selectedTemplateKey}
              onChange={(e) => setSelectedTemplateKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-semibold"
            >
              {Object.keys(templates).map((key) => (
                <option key={key} value={key}>
                  {key} ({templates[key].durationDays} Days)
                </option>
              ))}
            </select>
          </div>

          {/* Crop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Crop Name & Variety
            </label>
            <input
              type="text"
              required
              value={scheduleForm.cropName}
              onChange={(e) => setScheduleForm({ ...scheduleForm, cropName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Area & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Planting / Sowing Date</label>
              <input
                type="date"
                required
                value={scheduleForm.plantingDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, plantingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvest Date</label>
              <input
                type="date"
                value={scheduleForm.expectedHarvestDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, expectedHarvestDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Field Area (Acres)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={scheduleForm.fieldArea}
              onChange={(e) => setScheduleForm({ ...scheduleForm, fieldArea: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Checkbox: Auto-generate editable reminders */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={scheduleForm.autoGenerateReminders}
              onChange={(e) => setScheduleForm({ ...scheduleForm, autoGenerateReminders: e.target.checked })}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="autoGenerate" className="text-xs text-slate-700 cursor-pointer">
              <strong>Auto-generate recommended crop reminders</strong> (Irrigation, Nitrogen top-dressing, Yellow rust scout). You can customize or delete them anytime.
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
            >
              Save Schedule to IndexedDB
            </Button>
          </div>

        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: ADD / EDIT REMINDER              */}
      {/* ========================================== */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title={activeReminder ? 'Edit Farming Reminder' : 'Add Farming Reminder'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitReminder} className="space-y-4">
          
          {/* Associated Crop */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Crop</label>
            <input
              type="text"
              required
              value={reminderForm.cropName}
              onChange={(e) => setReminderForm({ ...reminderForm, cropName: e.target.value })}
              placeholder="e.g. Wheat (HD-3086)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Reminder Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reminder Category</label>
            <select
              value={reminderForm.type}
              onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="irrigation">💧 Irrigation Reminder</option>
              <option value="fertilizer">🧪 Fertilizer Application</option>
              <option value="pest_monitoring">🐛 Pest Monitoring / Scout</option>
              <option value="inspection">🌱 Crop Inspection</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reminder Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reminderForm.title}
              onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
              placeholder="e.g. Crown Root Irrigation (21 DAS)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={reminderForm.dueDate}
                onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={reminderForm.dueTime}
                onChange={(e) => setReminderForm({ ...reminderForm, dueTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
            <select
              value={reminderForm.priority}
              onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Action Description & Notes</label>
            <textarea
              rows={2}
              value={reminderForm.description}
              onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
              placeholder="e.g. Apply 35 kg Urea per acre. Check soil moisture beforehand."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
            >
              Save Reminder
            </Button>
          </div>

        </form>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 3: DELETE REMINDER CONFIRMATION     */}
      {/* ========================================== */}
      {activeReminder && (
        <Modal
          isOpen={isDeleteReminderModalOpen}
          onClose={() => setIsDeleteReminderModalOpen(false)}
          title="Delete Reminder"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600">
              Are you sure you want to remove reminder: <strong>{activeReminder.title}</strong>?
            </p>
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteReminderModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeleteReminder}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Reminder'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

