import { useEffect, useState } from 'react';
import { Search, Mic, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
        <Link to="/" className="text-3xl font-black text-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_#fff]">
          Skill<span className="text-pink-500">Swap</span>
        </Link>
        <ul className="hidden md:flex gap-6 text-black font-bold uppercase tracking-wide">
          <li><Link to="/" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">Explore</Link></li>
          <li><Link to="/how-it-works" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">How it Works</Link></li>
        </ul>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:flex items-center">
          <input 
            type="text" 
            placeholder="SEARCH SKILLS..." 
            className="pl-4 pr-10 py-2 border-4 border-black bg-white text-black font-bold uppercase w-60 focus:bg-lime-300 outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Mic className="absolute right-3 text-black w-5 h-5 cursor-pointer hover:text-pink-600 transition-colors" />
        </div>

        <div className="flex gap-4 items-center">
          {/* CONDITIONAL RENDERING: LOGIN/SIGNUP vs PROFILE */}
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="bg-yellow-300 text-black border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Sign In
              </Link>
              
              <Link 
                to="/signup" 
                className="bg-pink-400 text-white border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Join Now
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Profile Avatar Button */}
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="w-8 h-8 bg-lime-400 border-2 border-black flex items-center justify-center">
                  <User size={20} className="text-black" />
                </div>
                <span className="font-black uppercase text-xs hidden sm:block">Dashboard</span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleSignOut}
                className="p-2 bg-pink-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group"
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}