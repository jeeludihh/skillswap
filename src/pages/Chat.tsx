import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Zap } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Chat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupChat();
  }, [requestId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function setupChat() {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return navigate('/');
      setUser(currentUser);

      // 1. Get Request Details
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select(`
          id, requester_id, receiver_id, status,
          swaps!fk_requests_swaps (title),
          sender:requester_id (full_name),
          receiver:receiver_id (full_name)
        `)
        .eq('id', requestId)
        .single();

      if (reqError || reqData.status !== 'accepted') throw new Error("Invalid chat room.");
      setRequestDetails(reqData);

      // 2. Load History
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      setMessages(msgData || []);

      // 3. BULLETPROOF REALTIME LISTENER
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' }, 
          (payload) => {
            // Filter it perfectly on the frontend
            if (payload.new.request_id.toString() === requestId) {
              setMessages(prev => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } catch (err) {
      console.error(err);
      navigate('/inbox');
    } finally {
      setLoading(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !requestDetails) return;

    const targetUserId = user.id === requestDetails.requester_id 
      ? requestDetails.receiver_id 
      : requestDetails.requester_id;

    const msgContent = newMessage;
    setNewMessage(''); // Instant UI clear

    const { error } = await supabase.from('messages').insert([{
      request_id: requestId,
      sender_id: user.id,
      receiver_id: targetUserId,
      content: msgContent
    }]);

    if (error) console.error("Failed to send:", error);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-4xl uppercase">Connecting...</div>;

  const isRequester = user.id === requestDetails.requester_id;
  const partnerName = isRequester ? requestDetails.receiver?.full_name : requestDetails.sender?.full_name;

  return (
    <div className="min-h-screen bg-white pt-24 pb-0 px-4 sm:px-6 relative overflow-hidden text-black font-black flex flex-col">
      <BrutalistBackground />
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col h-[calc(100vh-100px)] w-full border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
        
        <header className="bg-lime-400 border-b-8 border-black p-4 md:p-6 flex items-center gap-4 shrink-0">
          <button onClick={() => navigate('/inbox')} className="bg-white border-4 border-black p-2 hover:bg-pink-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl uppercase tracking-tighter leading-none mb-1">
              CHAT // {partnerName?.split(' ')[0]}
            </h1>
            <span className="bg-black text-white px-2 py-0.5 text-xs uppercase tracking-widest inline-flex items-center gap-2">
              <Zap size={12} className="text-yellow-300 fill-current" /> {requestDetails.swaps?.title}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 uppercase italic mt-10 text-xl">Transmission started.</div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] border-4 border-black p-3 text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-bold tracking-tight ${isMine ? 'bg-yellow-300' : 'bg-white'}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="bg-white border-t-8 border-black p-4 flex gap-4 shrink-0">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="TYPE MESSAGE..." 
            className="flex-1 border-4 border-black p-3 md:p-4 outline-none focus:bg-pink-100 uppercase font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:text-gray-300"
          />
          <button type="submit" className="bg-black text-white border-4 border-black p-3 md:p-4 hover:bg-pink-500 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center">
            <Send size={28} strokeWidth={3} />
          </button>
        </form>
      </div>
    </div>
  );
}