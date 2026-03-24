import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Clock, Mail, Loader2 } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Inbox() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('requests')
        .select(`
          id,
          status,
          skill_id,
          requester_id,
          swaps!fk_requests_swaps (title, credit_value),
          profiles:requester_id (full_name, email)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Inbox Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (req: any, newStatus: 'accepted' | 'declined') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (newStatus === 'accepted') {
        // CALL THE SQL BANKER FUNCTION
        const { error } = await supabase.rpc('accept_swap_request', {
          target_request_id: req.id,
          credit_amount: req.swaps?.credit_value || 1,
          seller_id: user.id,
          buyer_id: req.requester_id
        });

        if (error) throw new Error("TRANSACTION FAILED: DATABASE ERROR");
      } else {
        // Just decline
        const { error } = await supabase
          .from('requests')
          .update({ status: 'declined' })
          .eq('id', req.id);
        if (error) throw error;
      }

      setToast({ 
        show: true, 
        msg: newStatus === 'accepted' ? "SWAP ACCEPTED & CREDITS MOVED!" : "REQUEST DECLINED", 
        type: newStatus === 'accepted' ? 'success' : 'error' 
      });
      
      fetchRequests();
    } catch (err: any) {
      setToast({ show: true, msg: err.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      {toast.show && <BrutalToast message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-4">
          Incoming <span className="text-blue-600 italic">Alerts</span>
        </h1>

        {loading ? (
          <div className="flex flex-col items-center py-20 uppercase tracking-widest text-xl">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
            Intercepting Signals...
          </div>
        ) : requests.length === 0 ? (
          <div className="border-8 border-black border-dashed p-16 text-center bg-gray-50 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
            <p className="text-3xl font-black text-gray-300 uppercase italic">Your inbox is a ghost town.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {requests.map((req) => (
              <div key={req.id} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-brutal-in relative hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex-1">
                    <div className="bg-pink-500 text-white border-4 border-black px-4 py-1 font-black uppercase text-xs inline-block mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                      New Swap Request
                    </div>
                    <h3 className="text-4xl font-black uppercase leading-[0.9] mb-4">
                      {req.profiles?.full_name?.split(' ')[0]} <span className="text-gray-400">wants</span>
                    </h3>
                    <div className="bg-yellow-300 border-4 border-black px-4 py-2 inline-block font-black text-2xl md:text-3xl uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {req.swaps?.title}
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => handleAction(req, 'declined')} className="flex-1 md:w-20 h-20 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white transition-colors"><X size={40} strokeWidth={4} /></button>
                    <button onClick={() => handleAction(req, 'accepted')} className="flex-1 md:w-20 h-20 bg-lime-400 border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"><Check size={40} strokeWidth={4} /></button>
                  </div>
                </div>
                <div className="mt-10 pt-6 border-t-4 border-black border-dotted flex flex-wrap gap-6 font-black uppercase text-xs tracking-tight">
                  <div className="flex items-center gap-2 bg-black text-white px-3 py-1 border-2 border-black tracking-widest"><Clock size={16} /> {req.swaps?.credit_value} HR VALUE</div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 border-2 border-black underline"><Mail size={16} /> {req.profiles?.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}