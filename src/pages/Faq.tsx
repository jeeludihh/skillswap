import BrutalistBackground from '../components/BrutalistBackground';
import { Zap, Shield, HelpCircle, AlertTriangle } from 'lucide-react';

export default function Faq() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
            WHAT IS <span className="text-yellow-400 italic">THIS?</span>
          </h1>
          <p className="text-2xl bg-black text-white inline-block px-6 py-2 uppercase italic shadow-[4px_4px_0px_0px_rgba(163,230,53,1)]">
            Frequently Asked Questions
          </p>
        </header>

        <div className="space-y-8">
          <details className="group bg-white border-8 border-black p-6 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] [&_summary::-webkit-details-marker]:hidden open:bg-yellow-100 transition-colors">
            <summary className="text-2xl md:text-4xl uppercase flex justify-between items-center outline-none">
              Is real money ever involved?
              <span className="transition group-open:rotate-180 bg-lime-400 border-4 border-black p-2"><HelpCircle size={32} /></span>
            </summary>
            <div className="mt-6 pt-6 border-t-8 border-black text-xl md:text-2xl uppercase text-gray-700 leading-tight">
              Nope! SkillSwap is strictly a barter economy. We use "Time Credits" just to keep things fair (1 hour of work = 1 Credit), but you can't buy credits with cash.
            </div>
          </details>

          <details className="group bg-white border-8 border-black p-6 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] [&_summary::-webkit-details-marker]:hidden open:bg-pink-100 transition-colors">
            <summary className="text-2xl md:text-4xl uppercase flex justify-between items-center outline-none">
              What if someone ghosts me?
              <span className="transition group-open:rotate-180 bg-pink-500 text-white border-4 border-black p-2"><AlertTriangle size={32} /></span>
            </summary>
            <div className="mt-6 pt-6 border-t-8 border-black text-xl md:text-2xl uppercase text-gray-700 leading-tight">
              We have a ruthless review system. If "Mike" fixes your bike poorly, you can leave a 1-star review. If Mike ghosts you, we ban Mike. Don't be like Mike.
            </div>
          </details>

          <details className="group bg-white border-8 border-black p-6 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] [&_summary::-webkit-details-marker]:hidden open:bg-blue-100 transition-colors">
            <summary className="text-2xl md:text-4xl uppercase flex justify-between items-center outline-none">
              Can I swap items instead of skills?
              <span className="transition group-open:rotate-180 bg-blue-400 border-4 border-black p-2"><Zap size={32} /></span>
            </summary>
            <div className="mt-6 pt-6 border-t-8 border-black text-xl md:text-2xl uppercase text-gray-700 leading-tight">
              Currently, we focus on services (Skills). However, if you want to trade your old textbook for a haircut, we won't stop you. Just mark it clearly in the description.
            </div>
          </details>

          <details className="group bg-white border-8 border-black p-6 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] [&_summary::-webkit-details-marker]:hidden open:bg-lime-100 transition-colors">
            <summary className="text-2xl md:text-4xl uppercase flex justify-between items-center outline-none">
              Is this safe?
              <span className="transition group-open:rotate-180 bg-white border-4 border-black p-2"><Shield size={32} /></span>
            </summary>
            <div className="mt-6 pt-6 border-t-8 border-black text-xl md:text-2xl uppercase text-gray-700 leading-tight">
              We require Google Authentication to sign up. We also strongly recommend meeting in public campus spots like the gazebo, library, or student union when doing in-person swaps.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}