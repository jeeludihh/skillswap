import { useEffect, useState } from 'react';
import { User, LogOut, Mic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    // Listen for Auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full h-[80px] bg-yellow-300 border-b-4 border-black flex justify-between items-center px-6 z-50 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* LEFT SECTION: LOGO & LINKS */}
      <div className="flex items-center gap-8">
        <Link to="/" className="group relative flex items-center">
          <div className="bg-black text-white px-5 py-2 border-[4px] border-black shadow-[6px_6px_0px_0px_#ec4899] group-hover:shadow-none group-hover:translate-x-[6px] group-hover:translate-y-[6px] transition-all">
            <span className="text-2xl font-black uppercase tracking-tighter italic leading-none">
              SKILL<span className="text-yellow-300 font-black">SWAP</span>
            </span>
          </div>
        </Link>
        
        <ul className="hidden lg:flex gap-6 text-black font-black uppercase text-sm tracking-tight italic">
          <li><Link to="/marketplace" className="hover:text-pink-600 transition-colors">The Grid</Link></li>
          <li><Link to="/how-it-works" className="hover:text-pink-600 transition-colors">Manifesto</Link></li>
        </ul>
      </div>

      {/* RIGHT SECTION: SEARCH & AUTH */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* SEARCH BAR */}
        <div className="relative hidden md:flex items-center group">
          <input 
            type="text" 
            placeholder="SEARCH SKILLS..." 
            className="pl-4 pr-10 py-2 border-4 border-black bg-white text-black font-black uppercase w-40 lg:w-60 focus:bg-lime-300 outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]"
          />
          <Mic className="absolute right-3 text-black w-5 h-5 group-hover:text-pink-500 transition-colors" />
        </div>

        {/* USER ACTIONS */}
        <div className="flex gap-3 items-center">
          {!user ? (
            <>
              <Link to="/login" className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Sign In
              </Link>
              <Link to="/signup" className="bg-pink-500 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Join Now
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* USER PROFILE BOX */}
              <Link 
                to="/dashboard" 
                className="flex items-center gap-3 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <div className="w-8 h-8 bg-lime-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <User size={18} strokeWidth={3} className="text-black" />
                </div>
                <span className="font-black uppercase text-sm tracking-tighter hidden sm:block">
                  {profile?.full_name?.split(' ')[0] || 'GRID USER'}
                </span>
              </Link>

              {/* LOGOUT BUTTON */}
              <button 
                onClick={handleSignOut}
                className="p-2 bg-pink-500 border-4 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <LogOut size={20} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}