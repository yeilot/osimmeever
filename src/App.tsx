/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Phone,
  School,
  User,
  MessageCircle,
  Link2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from './lib/utils';

// Constants
const TARGET_DEEDS = 250;
const END_DATE = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyjYr2RZznyQFeSnuUjLNVmMwiViSm4D72LmS-hY81NH_IvKWKBAkbhJfTU7eJmUjefCQ/exec';

interface Participant {
  id: string;
  name: string;
  deed: string;
  createdAt: string | Date;
}

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalDeeds, setTotalDeeds] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Google Sheets
  const fetchData = async () => {
    if (SCRIPT_URL === 'YOUR_NEW_SCRIPT_URL_HERE') {
      setError('יש להגדיר כתובת סקריפט ב-App.tsx');
      return;
    }
    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      if (!Array.isArray(data)) return;

      const mappedData: Participant[] = data.map((item: any, index: number) => ({
        id: `p-${index}`,
        name: item.name || 'אנונימי',
        deed: item.deed || '',
        createdAt: item.Timestamp ? new Date(item.Timestamp) : new Date()
      }));

      setParticipants(mappedData.reverse());
      setTotalDeeds(mappedData.length);
      setError(null);
    } catch (err) {
      setError('טוען נתונים...');
    }
  };

  // Safe date formatter to prevent white screen
  const safeFormatDistance = (dateStr: string | Date) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'עכשיו';
      return formatDistanceToNow(date, { addSuffix: true, locale: he });
    } catch (e) {
      return 'עכשיו';
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds for better responsiveness during testing
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = END_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    deed: '',
    phone: ''
  });

  const progress = Math.min((totalDeeds / TARGET_DEEDS) * 100, 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deed) return;

    setIsSubmitting(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(formData),
      });

      setFormData({ name: '', deed: '', phone: '' });
      setIsModalOpen(false);
      setShowShareModal(true);
      setTimeout(() => fetchData(), 1200);
    } catch (err) {
      alert('שגיאה בשליחת הנתונים.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a2a3a] font-sans selection:bg-amber-100 relative" dir="rtl">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-[#1a2a3a] text-white py-16 md:py-24 px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&q=80&w=1920" 
            alt="Background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a3a]/95 to-[#fdfbf7]"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center gap-8 mb-8">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-400 overflow-hidden shadow-xl bg-slate-200">
                  <img src="/guy.jpg" alt={'גיא לודר הי"ד'} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.src = 'https://picsum.photos/seed/guy/300/300'} />
               </div>
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white p-2 border-4 border-amber-400 shadow-xl flex items-center justify-center">
                  <img src="/maglan.png" alt="רבנות מגלן" className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.src = 'https://picsum.photos/seed/maglan/300/300'} />
               </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-amber-400 drop-shadow-2xl">
              עושים מעבר
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">לעילוי נשמת גיא לודר הי"ד</h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'עושים מעבר - לעילוי נשמת גיא לודר הי"ד',
                      text: 'גיא היה לוחם של מעבר, בואו ניקח לזכותו מעשה טוב שהוא "מעבר" למה שאנחנו רגילים.',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('הקישור הועתק!');
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Users className="w-5 h-5" />
                שתפו את המיזם
              </button>

              <a 
                href={`https://wa.me/?text=${encodeURIComponent('לקחתי חלק במיזם "עושים מעבר" לעילוי נשמת גיא לודר הי"ד. הצטרפו אלינו והוסיפו מעשה טוב שהוא "מעבר" לרגיל!\n' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                שתפו בוואטסאפ
              </a>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('הקישור הועתק בהצלחה!');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Link2 className="w-5 h-5" />
                העתקת קישור
              </button>
            </div>

            <div className="inline-block px-8 py-3 border-y-2 border-amber-400/40 text-amber-200 italic text-lg">
              המיזם מטעם רבנות יחידת מגלן
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 -mt-12 relative z-20 pb-20">
        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border border-amber-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-center">
            <div className="space-y-2">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">היעד שלנו</div>
              <div className="text-4xl font-bold text-[#1a2a3a]">{TARGET_DEEDS} <span className="text-lg font-normal">מעשים</span></div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">נעשו עד כה</div>
              <div className="text-4xl font-bold text-amber-600">{totalDeeds} <span className="text-lg font-normal">מעשים</span></div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">משתתפים</div>
              <div className="text-4xl font-bold text-[#1a2a3a]">{participants.length}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-14 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-10 border border-slate-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-400 to-amber-600 flex items-center justify-end px-6 text-white font-bold text-lg shadow-lg min-w-[2rem]"
            >
              <span className="whitespace-nowrap">{Math.round(progress)}%</span>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-slate-600 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full md:w-auto">
              <Calendar className="w-6 h-6 text-amber-600 shrink-0" />
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">זמן נותר ליעד</div>
                <div className="text-lg font-bold text-[#1a2a3a] tabular-nums">
                  {timeLeft ? `${timeLeft.days} ימים, ${timeLeft.hours}:${timeLeft.minutes.toString().padStart(2, '0')}` : 'טוען...'}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-10 py-5 bg-[#1a2a3a] text-white rounded-2xl font-bold text-xl hover:bg-[#2a3a4a] transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3 group"
            >
              <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              גם אני עושה מעבר
            </button>
          </div>
        </motion.div>

        {/* Recent Participants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#1a2a3a]">
              <Users className="w-6 h-6 text-amber-600" />
              המעשים האחרונים
            </h2>
            <div className="space-y-4">
              {participants.slice(0, 15).map((p, idx) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl">
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-[#1a2a3a]">{p.name}</div>
                      <div className="text-sm text-slate-500 italic">"{p.deed}"</div>
                    </div>
                  </div>
                  <div className="text-left text-xs text-slate-400">
                    {safeFormatDistance(p.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
              <h3 className="font-bold text-xl mb-4 text-amber-900">למה "מעבר"?</h3>
              <p className="text-amber-800 leading-relaxed">
                גיא תמיד עשה מעבר למה שנדרש ממנו. בואו נמשיך את דרכו ונוסיף טוב בעולם במעשים שהם קצת מעבר לרגיל שלנו.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#1a2a3a]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                <h2 className="text-2xl font-bold">הוספת מעשה טוב</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">שם מלא (חובה)</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="ישראל ישראלי" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">איזה מעשה טוב לקחת? (חובה)</label>
                  <textarea required value={formData.deed} onChange={(e) => setFormData({...formData, deed: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none h-24" placeholder="לדוגמה: עזרתי לשכן, התפללתי בכוונה..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">מספר טלפון (רשות)</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="050-0000000" />
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg disabled:opacity-50">
                  {isSubmitting ? 'שומר...' : 'גם אני עושה מעבר'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)} className="absolute inset-0 bg-[#1a2a3a]/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12" /></div>
              <h2 className="text-3xl font-bold mb-4 text-[#1a2a3a]">אשריך!</h2>
              <p className="text-xl text-slate-600 mb-8">תודה על המעשה הטוב! בואו נגיע ליעד ביחד.</p>
              <a href={`https://wa.me/?text=${encodeURIComponent('לקחתי חלק במיזם "עושים מעבר" לעילוי נשמת גיא לודר הי"ד. הצטרפו אלינו והוסיפו מעשה טוב שהוא "מעבר" לרגיל!\nhttps://mitnadvimbetora.vercel.app/')}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6" /> שתף בוואטסאפ
              </a>
              <button onClick={() => setShowShareModal(false)} className="mt-4 text-slate-400 font-medium">סגור</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-100 py-12 px-4 text-center border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-amber-600 font-bold text-2xl mb-4 italic">"עושים מעבר - לעילוי נשמת גיא לודר הי\"ד"</div>
          <p className="text-slate-500">המיזם מטעם רבנות יחידת מגלן</p>
        </div>
      </footer>
    </div>
  );
}
