import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Shield, Search, CheckCircle, Clock } from 'lucide-react';

export default function SecurityDashboard() {
  const [recentItems, setRecentItems] = useState({ lost: [], found: [] });
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [itemsRes, claimsRes] = await Promise.all([
          api.get('/admin/items'),
          api.get('/claims?status=Pending')
        ]);
        setRecentItems(itemsRes.data);
        setClaims(claimsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching items for security:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await api.put(`/items/${itemId}/status`, { status: newStatus });
      // Quick local update
      const updateList = (list) => list.map(i => i._id === itemId ? { ...i, status: newStatus } : i);
      setRecentItems({
        lost: updateList(recentItems.lost),
        found: updateList(recentItems.found)
      });
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleClaimAction = async (claimId, action) => {
    try {
      await api.put(`/claims/${claimId}/${action}`);
      setClaims(claims.filter(c => c._id !== claimId));
      // Also refresh items to update statuses
      const res = await api.get('/admin/items');
      setRecentItems(res.data);
    } catch (error) {
      alert(`Error ${action}ing claim`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading security panel...</div>;

  const pendingVerification = claims.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white flex items-center gap-3">
          Security Panel <Badge variant="warning">Staff</Badge>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Verify ownership and update item statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-slate-800 to-navy-900 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">Pending Verifications</p>
              <h3 className="text-3xl font-bold mt-1">{pendingVerification}</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl"><Shield size={24} /></div>
          </div>
        </Card>
        
        <Card className="p-6">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Recently Found Items</p>
              <h3 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">{recentItems.found.length}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Search size={24} /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Queue */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-amber-500" /> Action Required (Pending Verification)
          </h2>
          
          <div className="space-y-4">
            {claims.map(claim => (
              <div key={claim._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-navy-900 dark:text-white">Claim for: {claim.item?.name}</h4>
                  <Badge variant="warning">Action Required</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Claimant: {claim.claimedBy?.name} ({claim.claimedBy?.usn})</p>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-sm space-y-2 mb-4">
                  <p><strong>Description:</strong> {claim.description}</p>
                  {claim.answers && (
                    <>
                      <p><strong>Color:</strong> {claim.answers.color || 'N/A'}</p>
                      <p><strong>Location Lost:</strong> {claim.answers.locationLost || 'N/A'}</p>
                      <p><strong>Unique Marks:</strong> {claim.answers.uniqueMarks || 'N/A'}</p>
                    </>
                  )}
                  {claim.proof && (
                    <div className="mt-2">
                      <strong>Proof Image:</strong>
                      <a href={claim.proof} target="_blank" rel="noreferrer" className="block mt-1 text-teal-600 hover:underline">View Image</a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleClaimAction(claim._id, 'approve')} className="flex-1 justify-center bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                    <CheckCircle size={16} className="mr-2"/> Verify & Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleClaimAction(claim._id, 'reject')} className="flex-1 justify-center border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {pendingVerification === 0 && (
               <div className="text-center p-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">No claims pending verification.</div>
            )}
          </div>
        </Card>

        {/* Recently Found Items */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Recently Found by Students</h2>
          <div className="space-y-3">
            {recentItems.found.slice(0, 5).map(item => (
              <div key={item._id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm text-navy-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500">{item.location} • {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={item.status === 'Active' ? 'info' : 'success'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
