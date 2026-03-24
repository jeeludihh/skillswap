import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, User, ArrowUpRight, Loader2 } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Marketplace() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data, error } = await supabase
          .from('swaps')
          .select('*, profiles:user_id(full_name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSkills(data || []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchSkills();
  }, []);

  const handleRequestSwap = async (skill: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setToast({ show: true, msg: "LOG IN FIRST!", type: 'error' }); return; }
    
    const { error } = await supabase.from('requests').insert([{
      skill_id: skill.id,
      requester_id: user.id,
      receiver_id: skill.user_id
    }]);

    if (!error) setToast({ show: true, msg: "REQUEST SENT!", type: 'success' });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden">
      <BrutalistBackground />
      {toast.show && <BrutalToast message={toast.msg} type={toast.type} onClose={() => setToast({...toast, show: false})} />}
      
      <div className="max-w-7xl mx-auto relative z-10 text-black">
        <div className="mb-12 border-b-4 border-black pb-6">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">The Grid</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-pink-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <div key={skill.id} className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_#84cc16] transition-all group relative">
                <div className="absolute -top-4 -right-4 bg-yellow-300 border-2 border-black px-3 py-1 font-black uppercase text-[10px] rotate-6">{skill.category}</div>
                <h3 className="text-3xl font-black uppercase leading-none mb-4 group-hover:text-pink-600 transition-colors">{skill.title}</h3>
                <p className="font-bold text-gray-700 line-clamp-3 h-[4rem] text-sm mb-6 uppercase">{skill.description}</p>
                <div className="flex justify-between items-center border-t-2 border-black pt-4 font-black uppercase text-xs">
                  <div className="flex items-center gap-2"><User size={16} /> {skill.profiles?.full_name?.split(' ')[0]}</div>
                  <div className="flex items-center gap-1 text-pink-600 italic"><Clock size={16} /> {skill.credit_value} HR</div>
                </div>
                <button onClick={() => handleRequestSwap(skill)} className="w-full mt-6 bg-black text-white border-2 border-black py-3 font-black uppercase text-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                  REQUEST <ArrowUpRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}