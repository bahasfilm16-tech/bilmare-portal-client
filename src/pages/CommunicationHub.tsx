import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Send, Loader2, MessageCircle, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const CommunicationHub = () => {
  const { messages, sendMessage, loadingMessages, project } = useAppContext();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await sendMessage(newMessage.trim());
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 6rem)' }}>
      <div className="shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Communication Hub</h1>
        <p className="text-slate-500 mt-1">Kirim pesan langsung ke Tim Bilmare yang menangani proyek Anda.</p>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white min-h-0">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex w-64 border-r border-slate-200 bg-slate-50 flex-col shrink-0">
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Project</p>
            <div className="flex items-center gap-3 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                #
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-indigo-900 truncate">{project?.name ?? 'Project Channel'}</p>
                <p className="text-xs text-indigo-600">Tim Bilmare</p>
              </div>
            </div>
          </div>
          <div className="p-4 flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Info</p>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p>Semua pesan Anda akan langsung diterima oleh tim Bilmare yang menangani proyek ini.</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                ⏱ Waktu respons tim Bilmare: <strong>1×24 jam kerja</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="h-14 border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                #
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Project Channel</h2>
                <p className="text-xs text-slate-500 hidden sm:block">Tim Bilmare & {project?.name?.split('—')[0]?.trim() ?? 'Klien'}</p>
              </div>
            </div>
            {/* Info button — mobile only */}
            <button onClick={() => setInfoOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
            {loadingMessages && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                <span className="text-sm text-slate-500">Memuat pesan...</span>
              </div>
            )}
            {!loadingMessages && messages.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada pesan.</p>
                <p className="text-sm mt-1">Mulai percakapan dengan tim Bilmare.</p>
              </div>
            )}
            {messages.map((msg: any, index: number) => {
              const isClient = !msg.isBilmare;
              const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
              return (
                <div key={msg.id} className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${isClient ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'}`}>
                      {isClient ? 'ME' : 'B'}
                    </div>
                  ) : <div className="w-8 shrink-0" />}
                  <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isClient ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">{isClient ? 'Anda' : 'Tim Bilmare'}</span>
                        <span className="text-xs text-slate-400">{format(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp), 'HH:mm')}</span>
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isClient ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                    {!showAvatar && (
                      <span className="text-[10px] text-slate-400 mt-0.5">{format(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp), 'HH:mm')}</span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder="Ketik pesan ke Tim Bilmare..."
                className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-[52px] max-h-32 leading-relaxed"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} />
              <button type="submit" disabled={!newMessage.trim() || sending}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shrink-0">
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center hidden sm:block">Enter untuk kirim · Shift+Enter untuk baris baru</p>
          </div>
        </div>
      </div>

      {/* Mobile Info Modal */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setInfoOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900">Info Channel</h3>
              <button onClick={() => setInfoOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">#</div>
                <div><p className="text-sm font-semibold text-indigo-900 truncate">{project?.name ?? 'Project Channel'}</p><p className="text-xs text-indigo-600">Tim Bilmare</p></div>
              </div>
              <p className="text-sm text-slate-600">Semua pesan Anda akan langsung diterima oleh tim Bilmare yang menangani proyek ini.</p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">⏱ Waktu respons: <strong>1×24 jam kerja</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
