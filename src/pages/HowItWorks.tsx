import BrutalistBackground from '../components/BrutalistBackground';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
            THE <span className="text-pink-500 italic">LIFECYCLE</span>
          </h1>
          <p className="text-2xl bg-black text-white inline-block px-6 py-2 uppercase italic shadow-[4px_4px_0px_0px_#ec4899]">
            How to survive without actual money.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
            <span className="bg-black text-white px-4 py-2 text-4xl inline-block mb-6 border-4 border-black">01</span>
            <h3 className="text-4xl uppercase mb-4 leading-none">Realize you have no money</h3>
            <p className="text-xl uppercase text-gray-700">You checked your bank account. It was a tragedy. You need your bike fixed, but the repair shop wants $50. You consider crying.</p>
          </div>
          
          <div className="bg-yellow-300 border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
            <span className="bg-white text-black px-4 py-2 text-4xl inline-block mb-6 border-4 border-black">02</span>
            <h3 className="text-4xl uppercase mb-4 leading-none">Remember you have skills</h3>
            <p className="text-xl uppercase text-gray-800">Wait! You're an engineering student. You know Python. You also know how to make really good instant noodles, but let's stick to Python.</p>
          </div>

          <div className="bg-lime-400 border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
            <span className="bg-black text-white px-4 py-2 text-4xl inline-block mb-6 border-4 border-black">03</span>
            <h3 className="text-4xl uppercase mb-4 leading-none">The Swap</h3>
            <p className="text-xl uppercase text-gray-800">You find "Mike" on SkillSwap. Mike has tools. Mike needs to pass his coding exam. You teach Mike loops. Mike fixes your bike chain.</p>
          </div>

          <div className="bg-pink-500 text-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform">
            <span className="bg-white text-black px-4 py-2 text-4xl inline-block mb-6 border-4 border-black">04</span>
            <h3 className="text-4xl uppercase mb-4 leading-none">Profit (Emotionally)</h3>
            <p className="text-xl uppercase">No money changed hands. The tax man is confused. You ride your bike into the sunset. Life is good.</p>
          </div>
        </div>
      </div>
    </div>
  );
}   