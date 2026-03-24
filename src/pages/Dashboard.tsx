import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Coins, Zap, MessageSquare, Loader2, Plus } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';
import PostSkillModal from '../components/PostSkillModal';
import BrutalToast from '../components/BrutalToast';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }

        // Fetch Profile
        const { data: profData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profData);

        // Fetch Pending Requests (where user is the receiver)
        const { count } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
        
        setPendingCount(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase tracking-widest text-2xl">
      Syncing Profile...
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-6 relative overflow-hidden">
      <BrutalistBackground />
      
      {toast.show && <BrutalToast message={toast.msg} type={toast.type} onClose={() => setToast({...toast, show: false})} />}
      
      {isPosting && (
        <PostSkillModal 
          onClose={() => setIsPosting(false)} 
          onSuccess={(msg) => { 
            setIsPosting(false); 
            setToast({ show: true, msg, type: 'success' }); 
          }} 
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10 animate-brutal-in text-black">
        {/* WELCOME SECTION */}
        <div className="bg-lime-300 border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-12 relative">
          <div className="absolute -top-6 -right-6 bg-black text-white px-4 py-2 border-4 border-black font-black uppercase rotate-3 text-sm">
            Authenticated
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 leading-none">
            Yo, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-xl font-bold bg-black text-white inline-block px-3 py-1 uppercase italic tracking-tight">
            Credit Balance: {profile?.credits ?? 0} Hours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BALANCE CARD */}
          <div className="bg-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_#facc15]">
            <Coins size={32} className="mb-4" />
            <h3 className="text-2xl font-black uppercase leading-none">Time Bank</h3>
            <p className="text-6xl font-black mt-2">{profile?.credits ?? 0}</p>
            <p className="font-black text-xs uppercase text-gray-400 mt-2">Available Credits</p>
          </div>

          {/* ACTION CARD */}
          <div className="bg-pink-500 text-white border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <Zap size={32} className="mb-4 fill-white" />
              <h3 className="text-3xl font-black uppercase mb-2 leading-tight text-white">Offer Your<br/>Skill</h3>
            </div>
            <button 
              onClick={() => setIsPosting(true)}
              className="mt-6 bg-black text-white border-4 border-white py-3 font-black uppercase text-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Post Now
            </button>
          </div>

          {/* ALERTS CARD */}
          <div className="bg-blue-400 border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <MessageSquare size={32} className="mb-4" />
            <h3 className="text-3xl font-black uppercase mb-2 leading-tight">Swap<br/>Requests</h3>
            <p className="font-bold text-sm uppercase mb-6">You have {pendingCount} pending.</p>
            
            {pendingCount > 0 ? (
              <Link 
                to="/inbox" 
                className="bg-yellow-300 border-4 border-black p-3 text-center font-black animate-bounce block hover:bg-black hover:text-white transition-all uppercase text-sm"
              >
                View {pendingCount} New Alerts!
              </Link>
            ) : (
              <div className="bg-white/20 border-4 border-black border-dashed p-6 text-center">
                <p className="font-black text-xs uppercase tracking-widest opacity-60 italic">No Activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}