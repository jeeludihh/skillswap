import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Zap, Star } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Chat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // RATING STATE
  const [myRating, setMyRating] = useState(0);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setupChat();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function setupChat() {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return navigate('/');
      setUser(currentUser);

      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select(`id, requester_id, receiver_id, status, swaps!fk_requests_swaps (title), sender:requester_id (full_name), receiver:receiver_id (full_name)`)
        .eq('id', requestId)
        .single();

      if (reqError || reqData.status !== 'accepted') throw new Error("Invalid chat room.");
      setRequestDetails(reqData);

      // Determine who you are talking to
      const targetId = currentUser.id === reqData.requester_id ? reqData.receiver_id : reqData.requester_id;
      setTargetUserId(targetId);

      // FETCH EXISTING RATING (If you already rated them)
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewer_id', currentUser.id)
        .eq('reviewee_id', targetId)
        .single();
      if (reviewData) setMyRating(reviewData.rating);

      const { data: msgData } = await supabase.from('messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
      setMessages(msgData || []);

      const channel = supabase.channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.new.request_id.toString() === requestId) setMessages(prev => [...prev, payload.new]);
        }).subscribe();

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
    if (!newMessage.trim() || !user || !targetUserId) return;

    const msgContent = newMessage;
    setNewMessage(''); 

    await supabase.from('messages').insert([{ request_id: requestId, sender_id: user.id, receiver_id: targetUserId, content: msgContent }]);
  };

  // THE RATING FUNCTION
  const handleRate = async (stars: number) => {
    if (!user || !targetUserId) return;
    
    // Optimistic UI update
    setMyRating(stars); 

    // UPSERT the review (Insert or Update if exists)
    const { error } = await supabase.from('reviews').upsert({
      reviewer_id: user.id,
      reviewee_id: targetUserId,
      rating: stars
    });

    if (error) {
      console.error("Rating Error:", error);
      alert("Failed to submit rating.");
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-4xl uppercase">Connecting...</div>;

  const isRequester = user.id === requestDetails.requester_id;
  const partnerName = isRequester ? requestDetails.receiver?.full_name : requestDetails.sender?.full_name;

  return (
    <div className="min-h-screen bg-white pt-24 pb-0 px-4 sm:px-6 relative overflow-hidden text-black font-black flex flex-col">
      <BrutalistBackground />
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col h-[calc(100vh-100px)] w-full border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
        
        {/* CHAT HEADER WITH RATING WIDGET */}
        <header className="bg-lime-400 border-b-8 border-black p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="bg-white border-4 border-black p-2 hover:bg-pink-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl uppercase tracking-tighter leading-none mb-1">
                CHAT // {partnerName?.split(' ')[0]}
              </h1>
              <span className="bg-black text-white px-2 py-0.5 text-[10px] md:text-xs uppercase tracking-widest inline-flex items-center gap-2">
                <Zap size={10} className="text-yellow-300 fill-current" /> {requestDetails.swaps?.title}
              </span>
            </div>
          </div>

          {/* THE STAR RATING COMPONENT */}
          <div className="bg-white border-4 border-black p-2 flex flex-col items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] uppercase font-black tracking-widest mb-1">Rate Partner</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={24} 
                  onClick={() => handleRate(star)}
                  className={`cursor-pointer transition-all hover:scale-110 ${myRating >= star ? 'fill-yellow-400 text-black' : 'text-gray-300'}`} 
                />
              ))}
            </div>
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