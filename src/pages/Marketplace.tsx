import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Clock, User, ArrowRight, Star } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Marketplace() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('swaps')
        // UPDATED: Now grabbing avg_rating and rating_count
        .select(`*, profiles:user_id (full_name, avg_rating, rating_count)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (err) {
      console.error("Fetch Skills Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRequest = async (skill: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setToast({ show: true, msg: "LOG IN TO SWAP!", type: 'error' }); return; }
      if (user.id === skill.user_id) { setToast({ show: true, msg: "CAN'T SWAP WITH YOURSELF!", type: 'error' }); return; }

      const { error: reqError } = await supabase.from('requests').insert([{ skill_id: skill.id, requester_id: user.id, receiver_id: skill.user_id, status: 'pending' }]);
      if (reqError) {
        if (reqError.code === '23505') throw new Error("ALREADY REQUESTED!");
        throw reqError;
      }

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      const senderName = profile?.full_name?.split(' ')[0] || 'A USER';

      await supabase.from('notifications').insert([{ user_id: skill.user_id, message: `${senderName.toUpperCase()} WANTS: ${skill.title.toUpperCase()}`, type: 'request' }]);
      setToast({ show: true, msg: "REQUEST SENT TO THE GRID!", type: 'success' });
    } catch (err: any) {
      setToast({ show: true, msg: err.message || "ERROR SENDING REQUEST!", type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      {toast.show && <BrutalToast message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12">
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none flex items-center gap-4">
            THE <span className="text-pink-500 italic">GRID</span> <Zap size={64} className="text-yellow-400 fill-current" />
          </h1>
          <p className="text-xl bg-black text-white inline-block px-4 py-1 uppercase italic shadow-[4px_4px_0px_0px_#ec4899]">
            Available Skills for Swap
          </p>
        </header>

        {loading ? (
          <div className="text-4xl animate-pulse uppercase tracking-widest">Accessing Mainframe...</div>
        ) : skills.length === 0 ? (
          <div className="border-8 border-black border-dashed p-16 text-center bg-gray-50">
            <p className="text-3xl text-gray-400 uppercase italic">The Grid is currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <div key={skill.id} className="group bg-white border-8 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-lime-400 border-4 border-black px-3 py-1 text-sm uppercase italic font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {skill.category}
                    </div>
                    <div className="flex items-center gap-1 font-black bg-yellow-300 border-4 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Clock size={16} /> {skill.credit_value} HR
                    </div>
                  </div>
                  <h3 className="text-3xl font-black uppercase mb-4 leading-none group-hover:text-pink-500 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="font-bold text-gray-600 mb-6 line-clamp-3 uppercase text-sm">
                    {skill.description}
                  </p>
                </div>

                <div className="pt-6 border-t-4 border-black border-dashed flex items-center justify-between mt-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-black text-white border-2 border-black rounded-full flex items-center justify-center">
                        <User size={12} />
                      </div>
                      <span className="text-xs uppercase tracking-tighter font-black">
                        {skill.profiles?.full_name?.split(' ')[0]}
                      </span>
                    </div>
                    {/* NEW: STAR RATING BADGE */}
                    <div className="flex items-center gap-1 text-[10px] uppercase font-black bg-gray-100 border-2 border-black px-1.5 py-0.5 w-max mt-1">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" /> 
                      {skill.profiles?.rating_count > 0 
                        ? `${skill.profiles?.avg_rating} (${skill.profiles?.rating_count})` 
                        : 'NEW USER'}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRequest(skill)}
                    className="bg-black text-white px-4 py-2 border-4 border-black flex items-center gap-2 hover:bg-pink-500 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    REQUEST <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}