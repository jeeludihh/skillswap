import { ArrowRight, Hand, Clock } from 'lucide-react';

// Defining what data a card expects to receive
interface SwapCardProps {
  type: 'offer' | 'request';
  title: string;
  category: string;
  author: string;
  description: string;
  credits?: number;
}

export default function SwapCard({ type, title, category, author, description, credits }: SwapCardProps) {
  const isOffer = type === 'offer';
  
  // Dynamic colors based on type
  const cardBg = isOffer ? 'bg-white' : 'bg-white';
  const tagColor = isOffer ? 'bg-lime-300 text-black' : 'bg-pink-400 text-white';
  const btnColor = isOffer ? 'bg-lime-300' : 'bg-pink-400';

  return (
    <div className={`${cardBg} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}>
      
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`${tagColor} border-2 border-black px-3 py-1 text-xs font-black uppercase`}>
            {category}
          </span>
          {!isOffer && (
            <span className="flex items-center gap-1 font-black text-pink-500 bg-pink-100 border-2 border-pink-500 px-2 py-1 text-xs">
              <Clock className="w-3 h-3" /> {credits} CRD
            </span>
          )}
        </div>
        
        <h3 className="text-2xl font-black uppercase leading-tight mb-2 text-black">
          {title}
        </h3>
        <p className="text-black font-bold mb-6 border-l-4 border-gray-300 pl-3">
          {description}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t-4 border-dashed border-black">
        <div className="flex items-center gap-2 font-black uppercase text-sm">
          <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center ${tagColor}`}>
            {author[0]}
          </div>
          {author}
        </div>
        
        <button className={`${btnColor} border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`}>
          {isOffer ? <ArrowRight className="w-5 h-5 text-black" /> : <Hand className="w-5 h-5 text-black" />}
        </button>
      </div>
      
    </div>
  );
}