import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PostSkillModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function PostSkillModal({ onClose, onSuccess }: PostSkillModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Design',
    credit_value: 1
  });

  const categories = ['Design', 'Coding', 'Marketing', 'Music', 'Academics', 'Fitness'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in first.");

      const { error } = await supabase.from('swaps').insert([{
        user_id: user.id,
        title: formData.title.toUpperCase(),
        description: formData.description.toUpperCase(),
        category: formData.category,
        credit_value: formData.credit_value,
        status: 'active'
      }]);

      if (error) throw error;
      onSuccess("SKILL BLASTED TO THE GRID! 🚀");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-8 border-black p-8 w-full max-w-lg shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-brutal-in relative text-black">
        <button onClick={onClose} className="absolute -top-6 -right-6 bg-pink-500 border-4 border-black p-2 hover:rotate-90 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <X size={24} className="text-white" />
        </button>

        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic">List a Skill</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="font-black uppercase text-xs">Title / What's the deal?</label>
            <input required maxLength={40} className="w-full border-4 border-black p-3 font-black outline-none focus:bg-yellow-200 uppercase" placeholder="E.G. LOGO DESIGN"
              onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-black uppercase text-xs">Category</label>
              <select className="w-full border-4 border-black p-3 font-black uppercase bg-lime-300 appearance-none cursor-pointer outline-none focus:bg-white transition-colors"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-black uppercase text-xs">Hours (1-5)</label>
              <input type="number" min="1" max="5" value={formData.credit_value} className="w-full border-4 border-black p-3 font-black outline-none focus:bg-yellow-200"
                onChange={(e) => setFormData({...formData, credit_value: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-black uppercase text-xs">The Details</label>
            <textarea required rows={3} className="w-full border-4 border-black p-3 font-black outline-none focus:bg-pink-100 uppercase text-sm resize-none" placeholder="TEACHING REACT BASICS..."
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <button disabled={loading} className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase text-xl shadow-[6px_6px_0px_0px_#84cc16] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <><Check size={24} /> Blast it to the Grid</>}
          </button>
        </form>
      </div>
    </div>
  );
}