import { MapPin, Zap, Flame } from 'lucide-react';

export default function Hero() {
  return (
    <header className="pt-32 pb-20 px-5 text-center max-w-4xl mx-auto flex flex-col items-center">
      <div className="bg-white border-4 border-black text-black px-4 py-1 font-black uppercase tracking-widest mb-8 shadow-[4px_4px_0px_0px_#ff00ff] transform -rotate-2">
        V 1.0 // Beta Is For Cowards
      </div>
      
      <h1 className="text-7xl md:text-8xl font-black text-black leading-none mb-8 uppercase tracking-tighter">
        Trade Skills.<br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 stroke-black stroke-2 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          Not Money.
        </span>
      </h1>
      
      <p className="text-xl text-black font-bold mb-10 max-w-2xl bg-lime-300 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        A hyper-local marketplace for broke students. Swap Python lessons for guitar chords or moving help. Stop paying for stuff!
      </p>
      
      <div className="mb-12">
        <button className="bg-white border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          <MapPin className="text-pink-500 w-6 h-6" />
          <span>Find Swappers Near Me</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
        <button className="flex-1 flex justify-center items-center gap-3 px-8 py-5 border-4 border-black font-black text-black bg-lime-400 text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-rotate-1">
          <Zap className="w-6 h-6 fill-black" />
          OFFER A SKILL
        </button>
        <button className="flex-1 flex justify-center items-center gap-3 px-8 py-5 border-4 border-black font-black text-white bg-pink-500 text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:rotate-1">
          <Flame className="w-6 h-6 fill-white" />
          REQUEST A JOB
        </button>
      </div>
    </header>
  );
}