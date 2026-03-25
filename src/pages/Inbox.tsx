import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  async function fetchRequests() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase.from('requests').select(`
          id, status, skill_id, requester_id, receiver_id,
          swaps!fk_requests_swaps (title, credit_value),
          sender:requester_id (full_name),
          receiver:receiver_id (full_name)
        `);

      if (activeTab === 'incoming') {
        // INCOMING: Only show pending requests that need your action
        query = query.eq('receiver_id', user.id).eq('status', 'pending');
      } else {
        // OUTGOING: Show everything you sent so you can track the status
        query = query.eq('requester_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      setRequests(data || []);
    } catch (err: any) {
      console.error("Fetch Inbox Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (req: any, newStatus: 'accepted' | 'declined') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Process Transaction
      if (newStatus === 'accepted') {
        const { error: rpcError } = await supabase.rpc('accept_swap_request', {
          target_request_id: req.id,
          credit_amount: req.swaps?.credit_value || 1,
          seller_id: user.id,
          buyer_id: req.requester_id
        });
        if (rpcError) throw new Error("TRANSACTION FAILED: CHECK BALANCE");
      } else {
        const { error: updateError } = await supabase
          .from('requests')
          .update({ status: 'declined' })
          .eq('id', req.id);
        if (updateError) throw updateError;
      }

      // 2. Fetch Your Name for the Notification
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const myName = profile?.full_name?.split(' ')[0] || 'THE PROVIDER';
      const actionText = newStatus === 'accepted' ? 'ACCEPTED' : 'DECLINED';

      // 3. Fire Custom Notification back to the Requester
      const { error: notifError } = await supabase.from('notifications').insert([{
        user_id: req.requester_id,
        message: `${myName.toUpperCase()} ${actionText} YOUR REQUEST FOR: ${req.swaps?.title.toUpperCase()}`,
        type: newStatus === 'accepted' ? 'accept' : 'decline'
      }]);

      if (notifError) console.error("NOTIFICATION FAILED:", notifError);

      setToast({ show: true, msg: `SWAP ${newStatus.toUpperCase()}!`, type: 'success' });
      
      // Refresh the list immediately to remove the card from 'Incoming'
      fetchRequests(); 
      
    } catch (err: any) {
      console.error("ACTION ERROR:", err);
      setToast({ show: true, msg: err.message || "TRANSACTION FAILED", type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      {toast.show && <BrutalToast message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 border-b-8 border-black pb-4 leading-none">
          SWAP <span className="text-blue-600 italic">CENTER</span>
        </h1>

        {/* TAB NAVIGATION */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <button 
            onClick={() => setActiveTab('incoming')} 
            className={`flex-1 py-4 border-4 border-black font-black uppercase text-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'incoming' ? 'bg-yellow-300 translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'}`}
          >
            <ArrowDownLeft size={28} /> Action Required
          </button>
          <button 
            onClick={() => setActiveTab('outgoing')} 
            className={`flex-1 py-4 border-4 border-black font-black uppercase text-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'outgoing' ? 'bg-pink-500 text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'}`}
          >
            <ArrowUpRight size={28} /> Sent Requests
          </button>
        </div>

        {/* REQUEST LIST */}
        {loading ? (
          <div className="text-3xl animate-pulse uppercase tracking-widest text-center py-12">Reading Data...</div>
        ) : requests.length === 0 ? (
          <div className="border-8 border-black border-dashed p-16 text-center bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
            <p className="text-3xl font-black text-gray-300 uppercase italic">
              {activeTab === 'incoming' ? "No pending requests." : "You haven't requested any skills."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-white border-8 border-black p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-brutal-in relative group transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                
                <div className="flex-1">
                  {/* STATUS BADGE FOR OUTGOING */}
                  {activeTab === 'outgoing' && (
                    <div className="mb-4">
                      {req.status === 'accepted' && <span className="bg-lime-400 border-4 border-black px-3 py-1 text-sm font-black uppercase inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><CheckCircle2 size={16}/> ACCEPTED</span>}
                      {req.status === 'declined' && <span className="bg-red-400 text-white border-4 border-black px-3 py-1 text-sm font-black uppercase inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><XCircle size={16}/> DECLINED</span>}
                      {req.status === 'pending' && <span className="bg-yellow-300 border-4 border-black px-3 py-1 text-sm font-black uppercase inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Clock size={16}/> PENDING</span>}
                    </div>
                  )}

                  <h3 className="text-3xl md:text-4xl font-black uppercase leading-[0.9] mb-2">
                    {activeTab === 'incoming' ? req.sender?.full_name?.split(' ')[0] : `Target: ${req.receiver?.full_name?.split(' ')[0]}`}
                  </h3>
                  <div className="inline-block bg-black text-white px-3 py-1 uppercase text-sm font-black tracking-widest mt-2 border-2 border-black">
                    SKILL: {req.swaps?.title}
                  </div>
                </div>

                {/* ACTION BUTTONS (Only for Incoming Pending) */}
                {activeTab === 'incoming' && req.status === 'pending' && (
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => handleAction(req, 'declined')} 
                      className="flex-1 md:w-16 h-16 bg-white border-4 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      <X size={32} strokeWidth={4} />
                    </button>
                    <button 
                      onClick={() => handleAction(req, 'accepted')} 
                      className="flex-1 md:w-16 h-16 bg-lime-400 border-4 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                      <Check size={32} strokeWidth={4} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}