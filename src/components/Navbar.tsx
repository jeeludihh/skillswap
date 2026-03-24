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

    // Listen for Auth changes
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
    <nav className="fixed top-0 w-full h-[80px] bg-yellow-300 border-b-4 border-black flex justify-between items-center px-6 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="group relative flex items-center">
          <div className="bg-black text-white px-5 py-2 border-[4px] border-black shadow-[6px_6px_0px_0px_#ec4899] group-hover:shadow-none group-hover:translate-x-[6px] group-hover:translate-y-[6px] transition-all">
            <span className="text-2xl font-black uppercase tracking-tighter italic leading-none">
              Skill<span className="text-yellow-300">Swap</span>
            </span>
          </div>
        </Link>
        
        <ul className="hidden lg:flex gap-6 text-black font-black uppercase text-sm tracking-tight">
          <li><Link to="/marketplace" className="hover:underline decoration-4 underline-offset-4">Explore</Link></li>
          <li><Link to="/how-it-works" className="hover:underline decoration-4 underline-offset-4">How it Works</Link></li>
        </ul>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden md:flex items-center">
          <input 
            type="text" 
            placeholder="SEARCH..." 
            className="pl-4 pr-10 py-2 border-4 border-black bg-white text-black font-bold uppercase w-40 lg:w-60 focus:bg-lime-300 outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Mic className="absolute right-3 text-black w-5 h-5" />
        </div>

        <div className="flex gap-3 items-center">
          {!user ? (
            <>
              <Link to="/login" className="bg-white text-black border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Sign In
              </Link>
              <Link to="/signup" className="bg-pink-500 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Join
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <div className="w-8 h-8 bg-lime-400 border-2 border-black flex items-center justify-center">
                  <User size={20} className="text-black" />
                </div>
                <span className="font-black uppercase text-xs hidden sm:block">
                  {profile?.full_name?.split(' ')[0] || 'GRID USER'}
                </span>
              </Link>

              <button 
                onClick={handleSignOut}
                className="p-2 bg-pink-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}