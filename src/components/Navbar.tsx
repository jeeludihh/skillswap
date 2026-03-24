import { Search, Mic } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-[80px] bg-yellow-300 border-b-4 border-black flex justify-between items-center px-6 z-50">
      <div className="flex items-center gap-8">
        <a href="/" className="text-3xl font-black text-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_#fff]">
          Skill<span className="text-pink-500">Swap</span>
        </a>
        <ul className="hidden md:flex gap-6 text-black font-bold uppercase tracking-wide">
          <li><a href="/" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">Explore</a></li>
          <li><a href="/how-it-works" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">How it Works</a></li>
          <li><a href="/faq" className="hover:underline decoration-4 decoration-pink-500 underline-offset-4">FAQ</a></li>
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
          <a href="/login" className="text-black font-black uppercase text-sm hover:-translate-y-1 transition-transform">Sign In</a>
          <a href="/signup" className="bg-pink-500 text-black border-4 border-black px-6 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            Join Now
          </a>
        </div>
      </div>
    </nav>
  );
}