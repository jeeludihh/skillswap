import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Zap, Star, CheckCircle2 } from 'lucide-react';
import BrutalistBackground from '../components/BrutalistBackground';

export default function Chat() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [hasBeenRated, setHasBeenRated] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let msgChannel: any;
    let reqChannel: any;

    async function setupChat() {
      try {
        setLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return navigate('/');
        setUser(currentUser);

        await fetchRequestData(currentUser.id);

        msgChannel = supabase.channel(`messages_${requestId}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            if (payload.new.request_id.toString() === requestId) setMessages(prev => [...prev, payload.new]);
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
            setHasBeenRated(true); 
          }).subscribe();

        reqChannel = supabase.channel(`requests_${requestId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${requestId}` }, () => {
            fetchRequestData(currentUser.id); 
          }).subscribe();

      } catch (err) {
        console.error("Setup Error:", err);
      } finally {
        setLoading(false);
      }
    }

    setupChat();

    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (reqChannel) supabase.removeChannel(reqChannel);
    };
  }, [requestId, navigate]);

  const fetchRequestData = async (currentUserId: string) => {
    try {
      const { data: reqData, error: reqError } = await supabase
        .from('requests')
        .select(`id, requester_id, receiver_id, status, requester_completed, receiver_completed, swaps!fk_requests_swaps (title), sender:requester_id (full_name), receiver:receiver_id (full_name)`)
        .eq('id', requestId)
        .single();

      if (reqError) throw reqError;
      setRequestDetails(reqData);

      const isReq = currentUserId === reqData.requester_id;
      const targetId = isReq ? reqData.receiver_id : reqData.requester_id;
      setTargetUserId(targetId);

      try {
        const { data: reviewData } = await supabase.from('reviews')
          .select('id')
          .eq('reviewer_id', reqData.requester_id)
          .eq('reviewee_id', reqData.receiver_id)
          .maybeSingle();
          
        if (reviewData) setHasBeenRated(true);
      } catch (rErr) {
        console.warn("Rating check skipped or failed:", rErr);
      }

      const { data: msgData } = await supabase.from('messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
      setMessages(msgData || []);
    } catch (e) {
      console.error("Fetch Data Error:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !targetUserId) return;
    const msgContent = newMessage;
    setNewMessage(''); 
    await supabase.from('messages').insert([{ request_id: requestId, sender_id: user.id, receiver_id: targetUserId, content: msgContent }]);
  };

  const handleMarkComplete = async () => {
    if (!user || !requestDetails) return;
    
    try {
      const { data: liveReq, error: fetchErr } = await supabase.from('requests').select('*').eq('id', requestId).single();
      if (fetchErr) throw fetchErr;

      const isRequester = user.id === liveReq.requester_id;
      const updatePayload: any = {};
      
      if (isRequester) updatePayload.requester_completed = true;
      else updatePayload.receiver_completed = true;

      const partnerCompleted = isRequester ? liveReq.receiver_completed : liveReq.requester_completed;
      if (partnerCompleted) {
        updatePayload.status = 'completed';
      }

      const { data: updatedReq, error: updateErr } = await supabase
        .from('requests')
        .update(updatePayload)
        .eq('id', requestId)
        .select()
        .single();

      if (updateErr) throw updateErr;

      setRequestDetails({ ...requestDetails, ...updatedReq });
    } catch (err: any) {
      console.error("Complete Error:", err);
      alert(`SYSTEM ERROR: ${err.message}`);
    }
  };

  const handleRate = async (stars: number) => {
    if (!user || !targetUserId) return;
    
    try {
      const { error: ratingErr } = await supabase.from('reviews').upsert({ reviewer_id: user.id, reviewee_id: targetUserId, rating: stars });
      if (ratingErr) throw ratingErr;
      
      const { error: wipeErr } = await supabase.from('messages').delete().eq('request_id', requestId);
      if (wipeErr) console.error("Wipe Error:", wipeErr);
      
      setHasBeenRated(true);
    } catch (err: any) {
      alert(`RATING ERROR: ${err.message}`);
    }
  };

  if (loading || !requestDetails) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-4xl uppercase">Connecting...</div>;

  const isRequester = user.id === requestDetails.requester_id;
  const partnerName = isRequester ? requestDetails.receiver?.full_name : requestDetails.sender?.full_name;
  const myCompletionStatus = isRequester ? requestDetails.requester_completed : requestDetails.receiver_completed;
  const partnerCompletionStatus = isRequester ? requestDetails.receiver_completed : requestDetails.requester_completed;

  // THE LOCKDOWN SCREEN
  if (requestDetails?.status === 'completed' && hasBeenRated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden text-black font-black text-center">
        <BrutalistBackground />
        <div className="relative z-10 bg-white border-8 border-black p-8 md:p-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full animate-brutal-in">
          <h1 className="text-5xl md:text-8xl uppercase tracking-tighter mb-6 text-red-500">CHAT DESTROYED</h1>
          <p className="text-xl md:text-3xl uppercase text-gray-700 mb-12">This swap is complete and has been rated. The transmission log has been wiped.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-black text-white px-8 py-4 border-4 border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_#ec4899] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-0 px-4 sm:px-6 relative overflow-hidden text-black font-black flex flex-col">
      <BrutalistBackground />

      {/* 1. THE BUYER'S RATING MODAL */}
      {requestDetails?.status === 'completed' && !hasBeenRated && isRequester && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-black p-8 md:p-12 max-w-xl w-full shadow-[16px_16px_0px_0px_#ec4899] animate-brutal-in text-center flex flex-col items-center">
            <CheckCircle2 size={80} className="text-lime-400 mb-6 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 leading-none tracking-tighter">Job Done!</h2>
            <p className="text-xl mb-12 font-bold text-gray-600 uppercase">Rate your experience with {partnerName?.split(' ')[0]}.</p>
            
            <div className="flex justify-center gap-2 md:gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={48} 
                  onClick={() => handleRate(star)} 
                  className="cursor-pointer transition-all hover:scale-110 hover:-translate-y-2 fill-yellow-400 text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" 
                />
              ))}
            </div>
            <p className="text-xs font-black uppercase text-gray-400 bg-gray-100 border-2 border-gray-300 px-4 py-2">
              Warning: Submitting a rating will permanently destroy this chat log.
            </p>
          </div>
        </div>
      )}

      {/* 2. THE SELLER'S WAITING MODAL */}
      {requestDetails?.status === 'completed' && !hasBeenRated && !isRequester && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-black p-8 md:p-12 max-w-xl w-full shadow-[16px_16px_0px_0px_rgba(163,230,53,1)] animate-brutal-in text-center flex flex-col items-center">
            <div className="animate-spin mb-6"><Zap size={64} className="text-yellow-400 fill-current drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" /></div>
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 leading-none tracking-tighter">Job Complete!</h2>
            <p className="text-xl font-bold text-gray-600 uppercase mb-8">Waiting for {partnerName?.split(' ')[0]} to submit their rating...</p>
            <p className="text-xs font-black uppercase text-gray-400 bg-gray-100 border-2 border-gray-300 px-4 py-2">
              Once they rate you, this chat will self-destruct.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col h-[calc(100vh-100px)] w-full border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
        
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
                <Zap size={10} className="text-yellow-300 fill-current" /> {requestDetails?.swaps?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {myCompletionStatus ? (
              <div className="bg-yellow-300 border-4 border-black px-4 py-2 text-xs uppercase font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <span className="animate-pulse">⏳</span> WAITING ON PARTNER...
              </div>
            ) : (
              <button 
                onClick={handleMarkComplete}
                className={`border-4 border-black px-4 py-2 text-sm uppercase font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${partnerCompletionStatus ? 'bg-pink-500 text-white hover:bg-black animate-pulse' : 'bg-white hover:bg-lime-300'}`}
              >
                {partnerCompletionStatus ? 'PARTNER CONFIRMED! CLICK TO COMPLETE ⚡' : 'MARK JOB DONE'}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 uppercase italic mt-10 text-xl">No messages yet.</div>
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
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} 
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