import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Coins, Zap, MessageSquare, Trash2, X } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Coding', credit_value: 1 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Profile Data
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileData) setProfile(profileData);

    // 2. Active Skills
    const { data: skillsData } = await supabase.from('swaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (skillsData) setMySkills(skillsData);

    // 3. Pending Incoming Requests count
    const { count } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('status', 'pending');
    setPendingRequests(count || 0);

    setLoading(false);
  }

  const handlePostSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('swaps').insert([{
      user_id: user.id,
      ...formData
    }]).select().single();

    if (!error && data) {
      setMySkills([data, ...mySkills]);
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'Coding', credit_value: 1 });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm("REMOVE FROM GRID?")) return;
    await supabase.from('swaps').delete().eq('id', id);
    setMySkills(mySkills.filter(s => s.id !== id));
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-4xl uppercase">Accessing Mainframe...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 border-4 border-black bg-lime-400 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            YO, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <div className="mt-4 bg-black text-white px-4 py-2 inline-block text-xl uppercase tracking-widest italic">
            CREDIT BALANCE: {profile?.credits} HOURS
          </div>
        </header>

        {/* THE 3 BOX LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* BOX 1: TIME BANK */}
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Coins size={40} className="mb-4 text-yellow-400" />
            <h2 className="text-3xl uppercase mb-2">TIME BANK</h2>
            <div className="text-6xl font-black mb-4">{profile?.credits}</div>
            <p className="text-gray-400 uppercase text-xs">Available Credits</p>
          </div>

          {/* BOX 2: OFFER SKILL */}
          <div className="bg-pink-500 text-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <Zap size={40} className="mb-4 text-yellow-300 fill-current" />
              <h2 className="text-3xl uppercase mb-6">OFFER YOUR SKILL</h2>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="w-full bg-black text-white py-4 border-4 border-black uppercase hover:bg-white hover:text-black transition-colors">
              {showForm ? 'CANCEL' : '+ POST NOW'}
            </button>
          </div>

          {/* BOX 3: INBOX ALERTS */}
          <div className="bg-blue-400 text-black border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <MessageSquare size={40} className="mb-4" />
              <h2 className="text-3xl uppercase mb-2 leading-none">SWAP REQUESTS</h2>
              <p className="font-bold uppercase text-sm mb-6">You have {pendingRequests} pending.</p>
            </div>
            <Link to="/inbox" className="w-full bg-yellow-300 text-black py-4 border-4 border-black uppercase text-center hover:bg-black hover:text-white transition-colors block">
              VIEW ALERTS!
            </Link>
          </div>
        </div>

        {/* INLINE FORM (Appears when POST NOW is clicked) */}
        {showForm && (
          <form onSubmit={handlePostSkill} className="bg-white border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_#ec4899] mb-16 relative mt-8 animate-brutal-in">
            {/* CLOSE BUTTON */}
            <button type="button" onClick={() => setShowForm(false)} className="absolute -top-6 -right-6 bg-red-500 text-white border-4 border-black p-3 hover:bg-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none z-10">
              <X size={32} strokeWidth={3} />
            </button>
            
            <div className="flex items-center gap-4 mb-8 border-b-8 border-black pb-4">
              <Zap size={48} className="text-pink-500 fill-current" />
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Deploy a Skill</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* TITLE */}
              <div className="flex flex-col gap-2">
                <label className="font-black uppercase text-sm tracking-widest">Skill Title</label>
                <input required type="text" placeholder="e.g. Advanced React Tutor" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:text-gray-300" />
              </div>

              {/* CATEGORY */}
              <div className="flex flex-col gap-2">
                <label className="font-black uppercase text-sm tracking-widest">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all bg-white cursor-pointer">
                  <option>Coding</option><option>Design</option><option>Music</option><option>Languages</option><option>Marketing</option><option>Consulting</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-black uppercase text-sm tracking-widest">The Details</label>
                <textarea required placeholder="What exactly will you do for them? Be specific..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all h-32 resize-none placeholder:text-gray-300"></textarea>
              </div>

              {/* CREDIT COST */}
              <div className="flex items-center justify-between border-4 border-black bg-yellow-300 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col">
                  <label className="font-black uppercase tracking-widest text-lg">Credit Cost</label>
                  <span className="text-xs uppercase font-bold">1 Credit = 1 Hour</span>
                </div>
                <input required type="number" min="1" max="10" value={formData.credit_value} onChange={e => setFormData({...formData, credit_value: parseInt(e.target.value)})} className="border-4 border-black w-24 p-2 text-center text-3xl font-black outline-none focus:bg-pink-200" />
              </div>

              {/* SUBMIT BUTTON */}
              <button type="submit" className="bg-black text-white p-4 border-4 border-black uppercase font-black text-3xl shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] hover:bg-pink-500 hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3">
                SUBMIT TO GRID <Zap size={28} className="fill-current" />
              </button>
            </div>
          </form>
        )}

        {/* ACTIVE GRID SECTION */}
        <div className="mt-16 border-t-8 border-black pt-12">
          <h2 className="text-4xl uppercase mb-8">My Active Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mySkills.map((skill) => (
              <div key={skill.id} className="bg-white border-8 border-black p-6 flex justify-between items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <span className="bg-lime-400 border-2 border-black px-2 py-0.5 text-[10px] uppercase mb-2 inline-block">{skill.category}</span>
                  <h3 className="text-2xl uppercase leading-none">{skill.title}</h3>
                </div>
                <button onClick={() => handleDeleteSkill(skill.id)} className="bg-white border-4 border-black p-3 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}