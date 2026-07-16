import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Upload, X, MapPin, Calendar, Image as ImageIcon,
  Phone, Mail, ArrowLeft, Loader2, PackagePlus, Zap, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const CATEGORIES = [
  { value: '', label: 'Select a category' },
  { value: 'ID Cards', label: 'ID Cards' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Stationery', label: 'Stationery' },
  { value: 'Wallets', label: 'Wallets' },
  { value: 'Water Bottles', label: 'Water Bottles' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Others', label: 'Others' }
];

export default function ReportFoundItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    building: '',
    room: '',
    dateFound: '',
    finderName: user?.name || '',
    finderPhone: user?.phone || '',
    finderEmail: user?.email || ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = async (currentForm) => {
    if (!currentForm.name && !currentForm.category && !currentForm.building) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const params = new URLSearchParams({ type: 'lost' });
      if (currentForm.name) params.append('q', currentForm.name);
      if (currentForm.category) params.append('category', currentForm.category);
      if (currentForm.building) params.append('building', currentForm.building);
      
      const res = await api.get(`/items/search?${params.toString()}`);
      setSuggestions((res.data?.items || res.data || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(newForm);
      }, 500);
      return newForm;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Item name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description.trim() || form.description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters';
    if (!form.building.trim()) newErrors.building = 'Building/location is required';
    if (!form.dateFound) newErrors.dateFound = 'Date found is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let imagePath = '';
      if (image) {
        const uploadData = new FormData();
        uploadData.append('image', image);
        const uploadRes = await api.post('/upload/image', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagePath = uploadRes.data.imagePath;
      }

      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        location: form.room ? `${form.building}, ${form.room}` : form.building,
        dateFound: form.dateFound,
        finderContact: {
          name: form.finderName,
          phone: form.finderPhone,
          email: form.finderEmail
        },
        imagePath
      };

      await api.post('/items/found', payload);

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to submit. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h2>
          <p className="text-slate-500 dark:text-slate-400">Your found item has been reported. Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#1E3A5F] dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Go Back</span>
      </motion.button>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
            <PackagePlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-white">Report a Found Item</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 ml-[52px]">
          Help reunite someone with their belongings by providing item details.
        </p>
      </motion.div>

      {/* Form and Suggestions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm"
                >
                  {errors.submit}
                </motion.div>
              )}

              {/* Item Name */}
              <Input
                label="Item Name"
                type="text"
                placeholder="e.g., Black Leather Wallet"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
              />

              {/* Category */}
              <Input
                label="Category"
                type="select"
                value={form.category}
                onChange={handleChange('category')}
                error={errors.category}
                options={CATEGORIES}
              />

              {/* Description */}
              <Input
                label="Description"
                type="textarea"
                placeholder="Describe the item — color, brand, contents, any identifying features..."
                value={form.description}
                onChange={handleChange('description')}
                error={errors.description}
              />

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Building"
                  type="text"
                  placeholder="e.g., Library"
                  value={form.building}
                  onChange={handleChange('building')}
                  error={errors.building}
                />
                <Input
                  label="Room / Area"
                  type="text"
                  placeholder="e.g., Reading Room 2"
                  value={form.room}
                  onChange={handleChange('room')}
                />
              </div>

              {/* Date Found */}
              <Input
                label="Date Found"
                type="date"
                value={form.dateFound}
                onChange={handleChange('dateFound')}
                error={errors.dateFound}
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Upload Image (Optional)
                </label>
                {!imagePreview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      dragOver
                        ? 'border-[#14B8A6] bg-teal-50 dark:bg-teal-900/10'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-[#14B8A6]' : 'text-slate-400'}`} />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Drag & drop an image or <span className="text-emerald-500">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                  className="hidden"
                />
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
              </div>

              {/* Finder Contact Info */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Finder Contact Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    type="text"
                    placeholder="Your full name"
                    value={form.finderName}
                    onChange={handleChange('finderName')}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Phone"
                      type="text"
                      placeholder="Your phone number"
                      value={form.finderPhone}
                      onChange={handleChange('finderPhone')}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="Your email"
                      value={form.finderEmail}
                      onChange={handleChange('finderEmail')}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Submit Found Item Report
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Suggestions Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1E3A5F] dark:text-white mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              Potential Matches
            </h3>
            
            {loadingSuggestions ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <Loader2 className="w-8 h-8 text-[#14B8A6] animate-spin mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Searching reported lost items...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((item) => (
                  <Card key={item._id} className="p-4 hover:border-[#14B8A6]/50 transition-colors cursor-pointer" onClick={() => navigate(`/items/${item._id}`)}>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 m-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3" /> {item.building || 'Unknown location'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(item.dateLost || item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">No matches yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start typing item details to see potential matches here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
