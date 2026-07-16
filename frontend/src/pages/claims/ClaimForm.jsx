import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Upload, ShieldCheck, ArrowLeft, ImageIcon, FileText, CheckCircle } from 'lucide-react';
import Input from '../../components/Input';

export default function ClaimForm() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [locationLost, setLocationLost] = useState('');
  const [uniqueMarks, setUniqueMarks] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${itemId}`);
        setItem(res.data);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Item not found');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItem();
  }, [itemId]);

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please describe how this item belongs to you');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters to prove ownership');
      return;
    }

    try {
      setSubmitting(true);

      // Upload proof image first if exists
      let proofPath = '';
      if (proofFile) {
        const formData = new FormData();
        formData.append('image', proofFile);
        const uploadRes = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        proofPath = uploadRes.data.imagePath;
      }

      // Determine item type from the item data
      const itemType = item?.dateLost ? 'lost' : 'found';

      await api.post('/claims', {
        itemId,
        itemType,
        description: description.trim(),
        proof: proofPath,
        answers: {
          color: color.trim(),
          locationLost: locationLost.trim(),
          uniqueMarks: uniqueMarks.trim()
        }
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading item details...
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-3">
              Claim Submitted Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Your claim has been submitted for review. An admin or security staff member will verify your ownership and you'll be notified of the result.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                View My Claims
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to item
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-teal-500" size={28} />
            Claim This Item
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Provide detailed proof of ownership so we can verify your claim.
          </p>
        </div>

        {/* Item Summary */}
        {item && (
          <Card className="p-5 mb-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                {item.imagePath ? (
                  <img src={item.imagePath} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-400" size={28} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navy-900 dark:text-white truncate">{item.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{item.category} • {item.location}</p>
                <Badge variant="info" className="mt-2">{item.status}</Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Claim Form */}
        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Verification Questions */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-4">
                <CheckCircle className="text-teal-500" size={20} />
                Verification Questions
              </h3>
              <p className="text-sm text-slate-500 mb-6">Answer these to help establish your ownership. The admin will cross-check this with the finder's details.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="What color is it?"
                  placeholder="e.g., Matte Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value || e)}
                />
                <Input
                  label="Where did you likely lose it?"
                  placeholder="e.g., CS Lab 2"
                  value={locationLost}
                  onChange={(e) => setLocationLost(e.target.value || e)}
                />
              </div>
              <Input
                label="Any unique marks or features?"
                placeholder="e.g., Scratch on the back, sticker of a cat..."
                value={uniqueMarks}
                onChange={(e) => setUniqueMarks(e.target.value || e)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">
                <FileText size={16} className="inline mr-2 text-slate-400" />
                Describe why this item is yours
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Provide specific details: color, brand, distinguishing marks, contents, serial number, when you last had it, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-navy-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Minimum 20 characters. The more detail you provide, the faster your claim can be verified.
              </p>
            </div>

            {/* Proof Image Upload */}
            <div>
              <label className="block text-sm font-medium text-navy-900 dark:text-white mb-2">
                <Upload size={16} className="inline mr-2 text-slate-400" />
                Upload Proof (Optional)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Upload a photo of receipt, packaging, or any proof that helps verify ownership.
              </p>

              {proofPreview ? (
                <div className="relative">
                  <img
                    src={proofPreview}
                    alt="Proof preview"
                    className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all">
                  <Upload className="text-slate-400 mb-2" size={28} />
                  <span className="text-sm text-slate-500">Click to upload proof image</span>
                  <span className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProofChange}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 text-base"
              loading={submitting}
            >
              <ShieldCheck size={18} className="mr-2" />
              Submit Claim
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
