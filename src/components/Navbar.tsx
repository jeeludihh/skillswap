import { Search, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-[80px] bg-yellow-300 border-b-4 border-black flex justify-between items-center px-6 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-3xl font-black text-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_#fff]">
          Skill<span className="text-pink-500">Swap</span>
        </Link>
        <ul className="hidden md:flex gap-6 text-black font-bold uppercase tracking-wide">
          <li><Link to="/" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">Explore</Link></li>
          <li><Link to="/how-it-works" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">How it Works</Link></li>
          <li><Link to="/faq" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">FAQ</Link></li>
        </ul>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:flex items-center">
          <input 
            type="text" 
            placeholder="SEARCH SKILLS..." 
            className="pl-4 pr-10 py-2 border-4 border-black bg-white text-black font-bold uppercase w-60 focus:bg-lime-300 outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Mic className="absolute right-3 text-black w-5 h-5 cursor-pointer hover:text-pink-600 transition-colors" title="Voice Search" />
        </div>

        <div className="flex gap-4 items-center">
          {/* Matches the Login Page Background */}
          <Link 
            to="/login" 
            className="bg-yellow-300 text-black border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Sign In
          </Link>
          
          {/* Matches the Signup Page Background */}
          <Link 
            to="/signup" 
            className="bg-pink-400 text-white border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Join Now
          </Link>
        </div>
      </div>
    </nav>
  );
}