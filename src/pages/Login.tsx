import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Login() {
  return (
    <div className="min-h-screen bg-yellow-300 font-sans text-black flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. Add the interactive background */}
      <BrutalistBackground />
      
      {/* 2. Add the 'animate-brutal-in' class to the main box */}
      <div className="bg-white border-8 border-black p-8 md:p-12 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 animate-brutal-in">
        
        <div className="absolute -top-4 -left-4 bg-pink-500 text-white font-black px-4 py-1 border-4 border-black transform -rotate-6">
          MEMBERS ONLY
        </div>

        <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 mt-4">Sign In</h2>
        <p className="font-bold text-lg mb-8 bg-black text-white inline-block px-2">Time to get back to the hustle.</p>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-wider">University Email</label>
            <input 
              type="email" 
              placeholder="BROKE@STUDENT.EDU" 
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-lime-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-wider">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-pink-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              required
            />
          </div>

          <button type="submit" className="w-full bg-lime-400 border-4 border-black text-black font-black uppercase text-xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            Enter The Grid
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-dashed border-black flex flex-col gap-4">
          <p className="text-center font-bold">
            Don't have an account? <Link to="/signup" className="text-pink-600 underline decoration-4 underline-offset-4 hover:text-black transition-colors">Join the Resistance.</Link>
          </p>
          <Link to="/" className="flex items-center justify-center gap-2 font-black uppercase text-sm hover:-translate-x-2 transition-transform">
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </Link>
        </div>

      </div>
    </div>
  );
}