import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BrutalistBackground from '../components/BrutalistBackground';
import BrutalToast from '../components/BrutalToast';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Create the user profile in our 'profiles' table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              credits: 3, // Starter credits
            },
          ]);

        if (profileError) throw profileError;

        setToast({
          show: true,
          msg: "SUCCESS! YOUR ACCOUNT IS LIVE. TIME TO SWAP SOME SKILLS.",
          type: 'success',
        });
      }
    } catch (error: any) {
      setToast({
        show: true,
        msg: error.message || "SYSTEM FAILURE. CHECK YOUR CONNECTION AND TRY AGAIN.",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-400 font-sans text-black flex items-center justify-center p-6 relative overflow-hidden">
      <BrutalistBackground />

      {/* CUSTOM BRUTAL TOAST */}
      {toast.show && (
        <BrutalToast
          message={toast.msg}
          type={toast.type}
          onClose={() => {
            setToast({ ...toast, show: false });
            if (toast.type === 'success') navigate('/login');
          }}
        />
      )}

      <div className="bg-white border-8 border-black p-8 md:p-12 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 animate-brutal-in">
        {/* Decorative Tape Element */}
        <div className="absolute -top-4 -right-4 bg-lime-400 text-black font-black px-4 py-1 border-4 border-black transform rotate-3 text-sm">
          FRESH MEAT
        </div>

        <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 mt-4 leading-none">
          Join <span className="text-pink-600 underline decoration-8 underline-offset-4">Us</span>
        </h2>
        <p className="font-bold text-lg mb-8 bg-black text-white inline-block px-2">
          Stop paying for stuff.
        </p>

        <form className="space-y-6" onSubmit={handleSignup}>
          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-widest">Full Name</label>
            <input
              type="text"
              required
              placeholder="JOHN DOE"
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2">
            <label className="font-black uppercase text-sm tracking-widest">University Email</label>
            <input
              type="email"
              required
              placeholder="BROKE@STUDENT.EDU"
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
              className="w-full border-4 border-black p-4 font-bold outline-none focus:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black border-4 border-black text-white font-black uppercase text-xl p-4 shadow-[6px_6px_0px_0px_#84cc16] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#84cc16] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> BOOTING UP...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-4 border-dashed border-black flex flex-col gap-4">
          <p className="text-center font-bold">
            Already in the club?{' '}
            <Link
              to="/login"
              className="text-pink-600 underline decoration-4 underline-offset-4 hover:text-black transition-colors"
            >
              Sign In.
            </Link>
          </p>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 font-black uppercase text-sm hover:-translate-x-2 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </Link>
        </div>
      </div>
    </div>
  );
}