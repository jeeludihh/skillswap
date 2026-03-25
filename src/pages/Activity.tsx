import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle2, XCircle, Zap, Trash2 } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Activity() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setNotifications(data || []);
    }
    setLoading(false);
  }

  async function markAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      // FIRE THE INSTANT UPDATE EVENT
      window.dispatchEvent(new Event('notifications-updated'));
    }
  }

  async function deleteNotification(id: number) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
    // FIRE THE INSTANT UPDATE EVENT
    window.dispatchEvent(new Event('notifications-updated'));
  } 

  const getIcon = (type: string) => {
    if (type === 'accept') return <CheckCircle2 className="text-lime-500" size={32} />;
    if (type === 'decline') return <XCircle className="text-red-500" size={32} />;
    if (type === 'request') return <Zap className="text-yellow-400" size={32} fill="currentColor" />;
    return <Bell size={32} />;
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6 relative overflow-hidden text-black font-black">
      <BrutalistBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 border-b-8 border-black pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">THE <span className="text-blue-600 italic">FEED</span></h1>
          </div>
        </header>

        {loading ? (
          <div className="text-3xl animate-pulse uppercase italic">Syncing with The Grid...</div>
        ) : notifications.length === 0 ? (
          <div className="border-8 border-black border-dashed p-20 text-center bg-gray-50">
            <p className="text-4xl font-black text-gray-300 uppercase italic">Silence in the wires.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white border-8 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-start gap-6 relative group">
                <div className="bg-black text-white p-3 border-4 border-black">{getIcon(notif.type)}</div>
                
                <div className="flex-1">
                  <span className="text-xs font-black uppercase tracking-widest bg-gray-100 border-2 border-black px-2 py-0.5 mb-2 inline-block">
                    {notif.type}
                  </span>
                  <h3 className="text-2xl font-black uppercase leading-none mb-4">{notif.message}</h3>
                </div>

                {/* DELETE BUTTON */}
                <button 
                  onClick={() => deleteNotification(notif.id)}
                  className="bg-white border-4 border-black p-3 hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  title="Dismiss Notification"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}