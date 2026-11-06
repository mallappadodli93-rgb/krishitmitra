import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  LandPlot,
  Droplets,
  Layers,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  FileText,
  Save,
  Image as ImageIcon,
  Camera,
  LayoutGrid,
  Table as TableIcon,
  Globe,
  ChevronDown,
  Database,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFarmingRecords,
  createFarmingRecord,
  updateFarmingRecord,
  deleteFarmingRecord,
  convertImageToBase64,
  downloadExportedJSON,
  downloadExportedCSV,
  importJSONFile,
  getStorageEngineInfo
} from '../services/farmerDataService';

export default function MyFarmingRecordsPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const storageInfo = getStorageEngineInfo();

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Import file ref
  const importFileRef = useRef(null);
  const recordImageInputRef = useRef(null);

  // Add/Edit Form State
  const initialFormState = {
    id: '',
    cropName: '',
    category: 'Cereal / Grain',
    season: 'Rabi',
    status: 'Growing',
    farmArea: 2.0,
    landUnit: 'Acres',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    soilType: 'Medium Black Cotton Soil',
    irrigationType: 'Drip Irrigation',
    projectedYield: '',
    fertilizersApplied: '',
    healthStatus: 'Healthy (Zero Pests)',
    cropImage: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Load records from IndexedDB
  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFarmingRecords({
        season: selectedSeason,
        status: selectedStatus,
        search: searchTerm
      });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load farming records:', err);
      setErrorMessage('Could not load records from IndexedDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedSeason, selectedStatus, searchTerm]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setActiveRecord(null);
    setFormData(initialFormState);
    setIsAddEditModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (rec) => {
    setActiveRecord(rec);
    setFormData({
      ...rec,
      farmArea: rec.farmArea || 1.0,
      landUnit: rec.landUnit || 'Acres'
    });
    setIsAddEditModalOpen(true);
  };

  // Handle open View Modal
  const handleOpenViewModal = (rec) => {
    setActiveRecord(rec);
    setIsViewModalOpen(true);
  };

  // Handle open Delete Confirm Modal
  const handleOpenDeleteModal = (rec) => {
    setActiveRecord(rec);
    setIsDeleteModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!formData.cropName.trim()) {
      setErrorMessage('Crop name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      if (activeRecord?.id) {
        // Update
        await updateFarmingRecord(formData);
        setSuccessMessage(`Updated record for ${formData.cropName} in IndexedDB!`);
      } else {
        // Create new
        await createFarmingRecord(formData);
        setSuccessMessage(`Added new record for ${formData.cropName} to IndexedDB!`);
      }

      setIsAddEditModalOpen(false);
      await loadRecords();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving record:', err);
      setErrorMessage('Failed to save record into IndexedDB.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!activeRecord?.id) return;
    try {
      setIsSubmitting(true);
      await deleteFarmingRecord(activeRecord.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage(`Deleted record ${activeRecord.id} from local IndexedDB.`);
      await loadRecords();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to delete record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload Crop Image
  const handleCropImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Image must be under 8MB.');
        return;
      }
      try {
        const base64 = await convertImageToBase64(file);
        setFormData(prev => ({ ...prev, cropImage: base64 }));
      } catch (err) {
        setErrorMessage('Failed to process image file.');
      }
    }
  };

  // Handle Import JSON
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await importJSONFile(file);
      setSuccessMessage(res.message);
      await loadRecords();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Import error:', err);
      setErrorMessage(`Import failed: ${err.message || 'Invalid JSON file'}`);
    } finally {
      setIsLoading(false);
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  // Summary Metrics
  const totalArea = records.reduce((acc, r) => acc + (parseFloat(r.farmArea) || 0), 0);
  const activeGrowingCount = records.filter(r => r.status === 'Growing').length;
  const harvestedCount = records.filter(r => r.status === 'Harvested').length;

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
                {language === 'kn' ? 'ನನ್ನ ಕೃಷಿ ದಾಖಲೆಗಳು' : language === 'hi' ? 'मेरी कृषि प्रविष्टियां' : 'My Farming Records'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Title & Engine Distinction Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Badge variant="emerald" icon={Database}>
                IndexedDB Local Storage • Offline Protected
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Farming Records & Crop Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Organized records of your crop cycles, acreage, sowing dates, and field photos stored directly in browser IndexedDB.
            </p>
          </div>

          {/* Top Actions: Add New Record & Export/Import */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAddModal}
              className="font-bold shadow-md shadow-emerald-600/20"
            >
              Add Crop Record
            </Button>

            <button
              type="button"
              onClick={downloadExportedJSON}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Export all data as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={downloadExportedCSV}
              className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Export records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Import JSON data"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-300" />
              <span>Import JSON</span>
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileImport}
            />
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 4 Overview Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              Total Tracked Crops
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <span>{records.length}</span>
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Logged in IndexedDB</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              Cultivated Area
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 flex items-center gap-2">
              <span>{totalArea.toFixed(1)}</span>
              <span className="text-sm text-slate-500 font-normal">Acres</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total farm acreage logged</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              Active Growing
            </span>
            <div className="text-2xl sm:text-3xl font-black text-green-600 flex items-center gap-2">
              <span>{activeGrowingCount}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Under active irrigation</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
              Harvested Cycles
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 flex items-center gap-2">
              <span>{harvestedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Past seasons archived</span>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, soil, notes, or record ID..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Filter Dropdowns & View Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Season Filter */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Seasons</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Growing">Growing</option>
              <option value="Harvested">Harvested</option>
              <option value="Planned">Planned</option>
            </select>

            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Empty State */}
        {!isLoading && records.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Farming Records Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              You haven't logged any crops matching your current filter. Click "+ Add Crop Record" to start tracking your crop cycles.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              Add First Crop Record
            </Button>
          </div>
        )}

        {/* 1. CARDS VIEW */}
        {viewMode === 'cards' && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((rec) => (
              <Card
                key={rec.id}
                className="overflow-hidden flex flex-col justify-between border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 group bg-white"
              >
                <div>
                  {/* Image & Header */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    {rec.cropImage ? (
                      <img
                        src={rec.cropImage}
                        alt={rec.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                        <ImageIcon className="w-10 h-10 mb-1" />
                        <span className="text-xs">No Photo Logged</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md ${
                          rec.status === 'Growing'
                            ? 'bg-emerald-500 text-white'
                            : rec.status === 'Harvested'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {rec.status}
                      </span>
                      <span className="text-[10px] bg-black/60 text-emerald-200 font-mono px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                        {rec.season}
                      </span>
                    </div>

                    {/* Storage Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 border border-emerald-400/30">
                      IndexedDB
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] text-emerald-300 uppercase font-mono block">
                        {rec.id}
                      </span>
                      <h3 className="text-base font-extrabold leading-snug truncate drop-shadow">
                        {rec.cropName}
                      </h3>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3.5 text-xs">
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Cultivated Land
                        </span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                          <LandPlot className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rec.farmArea} {rec.landUnit || 'Acres'}</span>
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Sowing Date
                        </span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rec.sowingDate}</span>
                        </span>
                      </div>
                    </div>

                    {rec.projectedYield && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                        <span className="text-[10px] text-emerald-900 font-bold block uppercase">
                          Yield Forecast / Actual
                        </span>
                        <span className="font-extrabold text-emerald-800 block mt-0.5">
                          {rec.projectedYield}
                        </span>
                      </div>
                    )}

                    {rec.notes && (
                      <p className="text-slate-600 line-clamp-2 italic text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{rec.notes}"
                      </p>
                    )}

                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenViewModal(rec)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rec)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(rec)}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 2. TABLE VIEW */}
        {viewMode === 'table' && records.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Crop</th>
                    <th className="py-3.5 px-4">Season</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Area</th>
                    <th className="py-3.5 px-4">Sown Date</th>
                    <th className="py-3.5 px-4">Yield Forecast</th>
                    <th className="py-3.5 px-4">Storage</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-emerald-50/40 transition">
                      
                      {/* Crop with Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                            {rec.cropImage ? (
                              <img src={rec.cropImage} alt={rec.cropName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Sprout className="w-5 h-5 text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block truncate max-w-xs">
                              {rec.cropName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {rec.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {rec.season}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            rec.status === 'Growing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Harvested'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {rec.farmArea} {rec.landUnit || 'Acres'}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {rec.sowingDate}
                      </td>

                      <td className="py-3 px-4 font-medium text-emerald-800">
                        {rec.projectedYield || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          IndexedDB
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(rec)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                            title="Edit record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(rec)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* 1. ADD / EDIT RECORD MODAL                 */}
      {/* ========================================== */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={activeRecord ? `Edit Record (${activeRecord.id})` : 'Add New Farming Record'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitRecord} className="space-y-4">
          
          {/* Storage Notification Banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Record and crop photo will be saved securely inside browser <strong>IndexedDB</strong>.</span>
          </div>

          {/* Crop Photo Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Crop / Field Photo (IndexedDB Image Storage)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                {formData.cropImage ? (
                  <img src={formData.cropImage} alt="Crop preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => recordImageInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formData.cropImage ? 'Change Image' : 'Upload Field Photo'}</span>
                </button>
                <input
                  ref={recordImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCropImageUpload}
                />
                <span className="text-[11px] text-slate-400 block">JPG, JPEG or PNG (Max 8MB)</span>
              </div>
            </div>
          </div>

          {/* Crop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Crop Name & Variety (ಬೆಳೆ ಮತ್ತು ತಳಿ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              placeholder="e.g. Wheat (HD-3086) or Chickpea (JG-14)"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Season, Status & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Season</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Rabi">Rabi (Winter / रबी)</option>
                <option value="Kharif">Kharif (Monsoon / खरीफ)</option>
                <option value="Zaid">Zaid (Summer / जायद)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Growing">Growing (ಸಕ್ರಿಯ)</option>
                <option value="Harvested">Harvested (ಕೊಯ್ಲು ಮಾಡಲಾಗಿದೆ)</option>
                <option value="Planned">Planned (ಯೋಜಿಸಲಾಗಿದೆ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Cereal / Grain">Cereal / Grain</option>
                <option value="Pulse / Legume">Pulse / Legume</option>
                <option value="Oilseed">Oilseed</option>
                <option value="Cash Crop">Cash Crop</option>
                <option value="Vegetable">Vegetable</option>
              </select>
            </div>
          </div>

          {/* Area & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.farmArea}
                onChange={(e) => setFormData({ ...formData, farmArea: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sowing Date</label>
              <input
                type="date"
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvest Date</label>
              <input
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Soil & Irrigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Soil Type</label>
              <input
                type="text"
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                placeholder="e.g. Medium Black Cotton Soil"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Irrigation System</label>
              <input
                type="text"
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                placeholder="e.g. Drip Irrigation (Daily 2h)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Projected Yield & Fertilizers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Projected / Actual Yield</label>
              <input
                type="text"
                value={formData.projectedYield}
                onChange={(e) => setFormData({ ...formData, projectedYield: e.target.value })}
                placeholder="e.g. 22 Quintals / Acre"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fertilizers Applied</label>
              <input
                type="text"
                value={formData.fertilizersApplied}
                onChange={(e) => setFormData({ ...formData, fertilizersApplied: e.target.value })}
                placeholder="e.g. DAP 50kg basal + 1st Urea top-dress"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Field Notes & Observations</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Record tillering density, weed management, or pest observations..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              icon={Save}
            >
              {activeRecord ? 'Save Changes' : 'Create Record'}
            </Button>
          </div>

        </form>
      </Modal>

      {/* ========================================== */}
      {/* 2. VIEW RECORD DETAILS MODAL              */}
      {/* ========================================== */}
      {activeRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Farming Record • ${activeRecord.cropName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            
            {/* Image Banner */}
            {activeRecord.cropImage && (
              <div className="h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                <img
                  src={activeRecord.cropImage}
                  alt={activeRecord.cropName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">{activeRecord.id}</span>
                <h3 className="text-xl font-black text-slate-900">{activeRecord.cropName}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                  {activeRecord.status}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {activeRecord.season} Season
                </span>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Area Cultivated</span>
                <span className="font-extrabold text-slate-800">{activeRecord.farmArea} {activeRecord.landUnit || 'Acres'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Sowing Date</span>
                <span className="font-extrabold text-slate-800">{activeRecord.sowingDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Soil Type</span>
                <span className="font-semibold text-slate-800">{activeRecord.soilType || 'Medium Black Loam'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Irrigation</span>
                <span className="font-semibold text-slate-800">{activeRecord.irrigationType || 'Drip Irrigation'}</span>
              </div>
            </div>

            {activeRecord.projectedYield && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-950 block">Harvest Yield:</span>
                <span className="text-emerald-800 font-extrabold text-sm">{activeRecord.projectedYield}</span>
              </div>
            )}

            {activeRecord.fertilizersApplied && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                <span className="font-bold text-blue-950 block">Fertilizers & Nutrients Applied:</span>
                <span className="text-blue-800">{activeRecord.fertilizersApplied}</span>
              </div>
            )}

            {activeRecord.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Farmer Field Notes:</span>
                <p className="text-slate-600 leading-relaxed italic">{activeRecord.notes}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                IndexedDB Record
              </span>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* ========================================== */}
      {/* 3. DELETE CONFIRMATION MODAL              */}
      {/* ========================================== */}
      {activeRecord && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete Record"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600">
              Are you sure you want to delete the record for <strong>{activeRecord.cropName}</strong> ({activeRecord.id})?
            </p>
            <p className="text-red-600 font-semibold text-xs">
              This action will remove the record and any associated image from your browser's IndexedDB.
            </p>
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

