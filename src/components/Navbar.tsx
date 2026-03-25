import { useEffect, useState } from 'react';
import { User, LogOut, Bell, Mic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchUnreadCount(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
        fetchUnreadCount(currentUser.id);
      } else {
        setProfile(null);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      if (user) fetchUnreadCount(user.id);
    };
    
    window.addEventListener('notifications-updated', handleUpdate);
    return () => window.removeEventListener('notifications-updated', handleUpdate);
  }, [user]);

  // REALTIME NOTIFICATION LISTENER
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
        () => {
          fetchUnreadCount(user.id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value.trim();
    if (query) {
      navigate(`/marketplace?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/marketplace`);
    }
  };

  return (
    <nav className="fixed top-0 w-full h-[80px] bg-yellow-300 border-b-4 border-black flex justify-between items-center px-6 z-50 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* LEFT: LOGO & LINKS */}
      <div className="flex items-center gap-8">
        <Link to="/" className="group">
          <div className="bg-black text-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#ec4899] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
            <span className="text-xl font-black uppercase italic tracking-tighter">
              SKILL<span className="text-yellow-300">SWAP</span>
            </span>
          </div>
        </Link>
        <ul className="hidden md:flex gap-6 font-black uppercase italic text-sm">
          <li><Link to="/marketplace" className="smooth-hover">The Grid</Link></li>
          <li><Link to="/how-it-works" className="smooth-hover">How It Works</Link></li>
          <li><Link to="/faq" className="smooth-hover">FAQ</Link></li>
        </ul>
      </div>

      {/* RIGHT: SEARCH & AUTH ACTIONS */}
      <div className="flex items-center gap-4">
        
        {/* FUNCTIONAL SEARCH BAR WITH SMOOTH FADE */}
        <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
          <input 
            type="text" 
            name="search"
            placeholder="SEARCH SKILLS..." 
            className="search-expand pl-3 pr-8 py-2 border-4 border-black font-black uppercase text-xs w-48 outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-400"
          />
          <button type="submit" className="absolute right-2 p-1 hover:text-pink-500 transition-colors">
            <Mic className="w-4 h-4 text-black" />
          </button>
        </form>

        {!user ? (
          /* LOGGED OUT STATE */
          <div className="flex gap-3">
            <Link to="/login" className="bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Sign In
            </Link>
            <Link to="/signup" className="bg-pink-500 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Join
            </Link>
          </div>
        ) : (
          /* LOGGED IN STATE */
          <div className="flex items-center gap-3">
            {/* INBOX LINK */}
            <Link to="/inbox" className="bg-white border-4 border-black px-3 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all hidden sm:block">
              Inbox
            </Link>

            {/* NOTIFICATION BELL */}
            <Link to="/activity" className="relative p-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <Bell size={22} fill={unreadCount > 0 ? "#ec4899" : "none"} className={unreadCount > 0 ? "animate-bounce" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-pink-500 text-white border-2 border-black px-1.5 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* DASHBOARD LINK */}
            <Link to="/dashboard" className="flex items-center gap-2 bg-white border-4 border-black px-3 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <User size={16} />
              <span className="hidden sm:inline">{profile?.full_name?.split(' ')[0] || 'USER'}</span>
            </Link>

            {/* LOGOUT */}
            <button onClick={handleSignOut} className="p-2 bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#ec4899] hover:bg-pink-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}