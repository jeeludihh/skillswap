import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Coins, Zap, MessageCircle, Trash2, X, ArrowRight, AlertTriangle } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Coding', credit_value: 1 });
  
  // NEW: State to track which skill is being deleted for the modal
  const [skillToDelete, setSkillToDelete] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');

    // 1. Profile Data
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileData) setProfile(profileData);

    // 2. Active Skills
    const { data: skillsData } = await supabase.from('swaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (skillsData) setMySkills(skillsData);

    // 3. Active Chats (All accepted requests where user is involved)
    const { data: chatsData } = await supabase
      .from('requests')
      .select(`
        id, requester_id, receiver_id,
        swaps!fk_requests_swaps (title),
        sender:requester_id (full_name),
        receiver:receiver_id (full_name)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');
      
    if (chatsData) setActiveChats(chatsData);

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

  // Triggered when clicking the Trash icon (Opens Modal)
  const handleDeleteSkill = (id: number) => {
    setSkillToDelete(id);
  };

  // Triggered when confirming inside the Modal
  const confirmDelete = async () => {
    if (!skillToDelete) return;
    try {
      await supabase.from('swaps').delete().eq('id', skillToDelete);
      setMySkills(mySkills.filter(s => s.id !== skillToDelete));
    } catch (err: any) {
      console.error("Delete error:", err);
    } finally {
      setSkillToDelete(null); // Close modal
    }
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
          
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Coins size={40} className="mb-4 text-yellow-400" />
            <h2 className="text-3xl uppercase mb-2">TIME BANK</h2>
            <div className="text-6xl font-black mb-4">{profile?.credits}</div>
            <p className="text-gray-400 uppercase text-xs">Available Credits</p>
          </div>

          <div className="bg-pink-500 text-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <Zap size={40} className="mb-4 text-yellow-300 fill-current" />
              <h2 className="text-3xl uppercase mb-6">OFFER YOUR SKILL</h2>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="w-full bg-black text-white py-4 border-4 border-black uppercase hover:bg-white hover:text-black transition-colors">
              {showForm ? 'CANCEL' : '+ POST NOW'}
            </button>
          </div>

          {/* BOX 3: ACTIVE CHATS */}
          <div className="bg-blue-400 text-black border-8 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[280px]">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <MessageCircle size={32} />
              <h2 className="text-3xl uppercase leading-none">CHATBOX</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
              {activeChats.length === 0 ? (
                <p className="font-bold uppercase text-sm mt-2 text-blue-900">No active chats.</p>
              ) : (
                activeChats.map(chat => {
                  const partnerName = chat.requester_id === profile.id ? chat.receiver?.full_name : chat.sender?.full_name;
                  return (
                    <Link 
                      key={chat.id} 
                      to={`/chat/${chat.id}`} 
                      className="bg-white border-4 border-black p-3 font-black uppercase text-sm hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex justify-between items-center group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    >
                      <div className="flex flex-col">
                        <span>{partnerName?.split(' ')[0]}</span>
                        <span className="text-[10px] text-gray-500">{chat.swaps?.title}</span>
                      </div>
                      <ArrowRight size={20} className="group-hover:text-pink-500" />
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* INLINE FORM */}
        {showForm && (
          <form onSubmit={handlePostSkill} className="bg-white border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_#ec4899] mb-16 relative mt-8 animate-brutal-in">
            <button type="button" onClick={() => setShowForm(false)} className="absolute -top-6 -right-6 bg-red-500 text-white border-4 border-black p-3 hover:bg-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none z-10">
              <X size={32} strokeWidth={3} />
            </button>
            <div className="flex items-center gap-4 mb-8 border-b-8 border-black pb-4">
              <Zap size={48} className="text-pink-500 fill-current" />
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Deploy a Skill</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="font-black uppercase text-sm tracking-widest">Skill Title</label>
                <input required type="text" placeholder="e.g. Advanced React Tutor" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-black uppercase text-sm tracking-widest">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all cursor-pointer">
                  <option>Coding</option><option>Design</option><option>Music</option><option>Languages</option><option>Marketing</option><option>Consulting</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-black uppercase text-sm tracking-widest">The Details</label>
                <textarea required placeholder="What exactly will you do for them?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="border-4 border-black p-4 font-black uppercase w-full outline-none focus:bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all h-32 resize-none"></textarea>
              </div>
              <div className="flex items-center justify-between border-4 border-black bg-yellow-300 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col">
                  <label className="font-black uppercase tracking-widest text-lg">Credit Cost</label>
                  <span className="text-xs uppercase font-bold">1 Credit = 1 Hour</span>
                </div>
                <input required type="number" min="1" max="10" value={formData.credit_value} onChange={e => setFormData({...formData, credit_value: parseInt(e.target.value)})} className="border-4 border-black w-24 p-2 text-center text-3xl font-black outline-none focus:bg-pink-200" />
              </div>
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
                {/* Changed onClick to trigger the modal instead of native confirm */}
                <button onClick={() => handleDeleteSkill(skill.id)} className="bg-white border-4 border-black p-3 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- THE BRUTALIST DESTRUCTION MODAL --- */}
      {skillToDelete !== null && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-black p-8 md:p-12 max-w-md w-full shadow-[16px_16px_0px_0px_#ef4444] animate-brutal-in text-center flex flex-col items-center">
            
            <div className="w-16 h-16 bg-red-500 text-white border-4 border-black flex items-center justify-center rounded-full mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle size={32} strokeWidth={3} />
            </div>

            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 leading-none tracking-tighter text-red-500">
              Destroy Listing?
            </h2>
            
            <p className="text-lg font-bold text-gray-600 uppercase mb-8">
              This action is permanent. Your skill will be wiped from the grid forever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button 
                onClick={() => setSkillToDelete(null)} 
                className="flex-1 bg-white border-4 border-black py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-red-500 text-white border-4 border-black py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Destroy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}