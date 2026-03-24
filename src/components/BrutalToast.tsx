interface BrutalToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export default function BrutalToast({ message, onClose, type = 'success' }: BrutalToastProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`
        ${type === 'success' ? 'bg-lime-300' : 'bg-pink-500'} 
        border-8 border-black p-8 max-w-sm w-full 
        shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] 
        animate-brutal-in relative
      `}>
        <div className="absolute -top-6 -right-6 bg-white border-4 border-black p-2 transform rotate-12 font-black">
          {type === 'success' ? '!!! NICE !!!' : '!!! ERROR !!!'}
        </div>
        
        <p className="text-xl font-black uppercase tracking-tight mb-6 leading-tight">
          {message}
        </p>

        <button 
          onClick={onClose}
          className="w-full bg-black text-white border-4 border-black py-2 font-black uppercase hover:bg-white hover:text-black transition-colors"
        >
          Got it, Boss
        </button>
      </div>
    </div>
  );
}