import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      setToast({
        show: true,
        msg: "ACCESS GRANTED. WELCOME BACK TO THE GRID.",
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        show: true,
        msg: error.message.toUpperCase() || "AUTH FAILURE. CHECK YOUR CREDENTIALS.",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 font-sans text-black flex items-center justify-center p-6 relative overflow-hidden">
      <BrutalistBackground />

      {/* CUSTOM TOAST */}
      {toast.show && (
        <BrutalToast
          message={toast.msg}
          type={toast.type}
          onClose={() => {
            setToast({ ...toast, show: false });
            if (toast.type === 'success') navigate('/'); 
          }}
        />
      )}

      <div className="bg-white border-8 border-black p-8 md:p-12 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 animate-brutal-in">
        
        {/* Decorative Tape Element */}
        <div className="absolute -top-4 -left-4 bg-pink-500 text-white font-black px-4 py-1 border-4 border-black transform -rotate-6 text-sm">
          MEMBERS ONLY
        </div>

        <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 mt-4 leading-none">
          Sign <span className="text-yellow-400 stroke-black" style={{ WebkitTextStroke: '2px black' }}>In</span>
        </h2>
        <p className="font-bold text-lg mb-8 bg-black text-white inline-block px-2 uppercase">
          Time to get back to the hustle.
        </p>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-widest">University Email</label>
            <input 
              type="email" 
              required
              placeholder="BROKE@STUDENT.EDU" 
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-lime-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-widest">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-pink-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-lime-400 border-4 border-black text-black font-black uppercase text-xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> VERIFYING...
              </>
            ) : (
              'Enter The Grid'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-dashed border-black flex flex-col gap-4">
          <p className="text-center font-bold uppercase text-sm">
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