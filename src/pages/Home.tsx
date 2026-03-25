import { MapPin, Zap, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Home() {
  const navigate = useNavigate();

  // THE LOCATION RADAR FUNCTION
  const handleFindNearMe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("YOU MUST BE LOGGED IN TO USE THE LOCAL RADAR.");
      navigate('/login');
      return;
    }

    if (!navigator.geolocation) {
      alert("Your device doesn't support geolocation.");
      navigate('/marketplace');
      return;
    }

    // Ask for browser GPS permission
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Save location to their profile (Now permitted by SQL!)
      const { error } = await supabase.from('profiles').update({ lat: latitude, lng: longitude }).eq('id', user.id);
      if (error) console.error("DB Save Error:", error);
      
      // INSTANT PASS: Send coordinates directly to the marketplace URL
      navigate(`/marketplace?local=true&lat=${latitude}&lng=${longitude}`);
    }, (error) => {
      console.error(error);
      alert("Location access denied! Showing global grid instead.");
      navigate('/marketplace');
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-between">
      <BrutalistBackground />
      
      <header className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-5 text-center max-w-4xl mx-auto relative z-10 animate-brutal-in">
        {/* Version Badge */}
        <div className="bg-white border-4 border-black text-black px-4 py-1 font-black uppercase tracking-widest mb-8 shadow-[4px_4px_0px_0px_#ff00ff] transform -rotate-2">
          V 1.0 // Beta Is For Cowards
        </div>
        
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-black text-black leading-none mb-8 uppercase tracking-tighter">
          Trade Skills.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 stroke-black stroke-2 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '2px black' }}>
            Not Money.
          </span>
        </h1>
        
        {/* Intro Box */}
        <p className="text-lg md:text-xl text-black font-bold mb-10 max-w-2xl bg-lime-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          A hyper-local marketplace for broke students. Swap Python lessons for guitar chords or moving help. Stop paying for stuff!
        </p>
        
        {/* THE RADAR BUTTON */}
        <div className="mb-12 w-full">
          <button 
            onClick={handleFindNearMe}
            className="bg-white border-8 border-black px-6 py-4 font-black uppercase flex items-center justify-center gap-4 mx-auto text-xl md:text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none hover:bg-black hover:text-white transition-all group w-full md:w-auto"
          >
            <MapPin className="text-pink-500 w-8 h-8 group-hover:text-yellow-400 transition-colors" />
            <span>Find Swappers Near Me</span>
          </button>
        </div>
        
        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
          <Link 
            to="/marketplace"
            className="flex-1 flex justify-center items-center gap-3 px-8 py-5 border-4 border-black font-black text-black bg-lime-400 text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-rotate-1"
          >
            <Zap className="w-6 h-6 fill-black" />
            OFFER A SKILL
          </Link>
          
          <Link 
            to="/marketplace"
            className="flex-1 flex justify-center items-center gap-3 px-8 py-5 border-4 border-black font-black text-white bg-pink-500 text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:rotate-1"
          >
            <Flame className="w-6 h-6 fill-white" />
            REQUEST A JOB
          </Link>
        </div>
      </header>

      {/* Decorative Bottom Marquee */}
      <div className="w-full bg-black py-3 overflow-hidden whitespace-nowrap border-t-8 border-black z-50 mt-auto">
        <div className="animate-marquee flex items-center text-white font-black uppercase md:text-xl tracking-widest">
          <span className="mx-4">* JOIN THE GRID * NO CASH REQUIRED * TRADE YOUR SKILLS * 3 FREE CREDITS ON SIGNUP * TRADE YOUR SKILLS *</span>
          <span className="mx-4">* JOIN THE GRID * NO CASH REQUIRED * TRADE YOUR SKILLS * 3 FREE CREDITS ON SIGNUP * TRADE YOUR SKILLS *</span>
          <span className="mx-4">* JOIN THE GRID * NO CASH REQUIRED * TRADE YOUR SKILLS * 3 FREE CREDITS ON SIGNUP * TRADE YOUR SKILLS *</span>
          <span className="mx-4">* JOIN THE GRID * NO CASH REQUIRED * TRADE YOUR SKILLS * 3 FREE CREDITS ON SIGNUP * TRADE YOUR SKILLS *</span>
        </div>
      </div>
    </div>
  );
}