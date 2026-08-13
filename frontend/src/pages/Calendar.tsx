import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Clock, 
  MapPin,
  HelpCircle
} from 'lucide-react';

interface EventItem {
  hackathonId: string;
  title: string;
  type: 'registration_deadline' | 'hackathon_start' | 'hackathon_end' | 'round_date';
  time?: string;
  location?: string;
}

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hackathons, setHackathons] = useState<any[]>(() => {
    return api.getCached('/hackathons') || [];
  });
  const [loading, setLoading] = useState(() => {
    return !api.getCached('/hackathons');
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.get('/hackathons');
        setHackathons(data);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if two dates represent the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null); // padding for previous month offset
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(new Date(year, month, i));
  }

  // Retrieve all events occurring on a specific date
  const getEventsForDate = (date: Date): EventItem[] => {
    const events: EventItem[] = [];

    hackathons.forEach((hack) => {
      // 1. Registration Deadline
      if (hack.registration_deadline) {
        const regDate = new Date(hack.registration_deadline);
        if (isSameDay(regDate, date)) {
          events.push({
            hackathonId: hack.id,
            title: `Reg: ${hack.name}`,
            type: 'registration_deadline',
            time: regDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          });
        }
      }

      // 2. Start Date
      if (hack.start_date) {
        const startDate = new Date(hack.start_date);
        if (isSameDay(startDate, date)) {
          events.push({
            hackathonId: hack.id,
            title: `Start: ${hack.name}`,
            type: 'hackathon_start',
            time: startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            location: hack.location
          });
        }
      }

      // 3. End Date
      if (hack.end_date) {
        const endDate = new Date(hack.end_date);
        if (isSameDay(endDate, date)) {
          events.push({
            hackathonId: hack.id,
            title: `End: ${hack.name}`,
            type: 'hackathon_end'
          });
        }
      }

      // 4. Rounds Date
      if (hack.hackathon_rounds) {
        hack.hackathon_rounds.forEach((round: any) => {
          if (round.date) {
            const roundDate = new Date(round.date);
            if (isSameDay(roundDate, date)) {
              events.push({
                hackathonId: hack.id,
                title: `${round.round_name} (${hack.name})`,
                type: 'round_date',
                time: round.start_time || undefined
              });
            }
          }
        });
      }
    });

    return events;
  };

  const getEventBadgeClass = (type: EventItem['type']) => {
    switch (type) {
      case 'registration_deadline': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'hackathon_start': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'hackathon_end': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      case 'round_date': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default: return 'bg-white/5 text-gray-300';
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Building calendar cells...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up select-none">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">Track deadlines and event timings visually.</p>
        </div>

        <div className="flex items-center space-x-4 bg-[#0d1321]/60 border border-cardBorder rounded-2xl p-1.5 shrink-0">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-extrabold text-white min-w-32 text-center font-outfit">
            {monthName} {year}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="glass-panel rounded-3xl border border-cardBorder overflow-hidden shadow-xl">
        {/* Days of Week label */}
        <div className="grid grid-cols-7 border-b border-cardBorder bg-[#090d16]/50 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Date Boxes */}
        <div className="grid grid-cols-7 grid-rows-5 gap-px bg-cardBorder">
          {daysArray.map((day, idx) => {
            const isToday = day ? isSameDay(day, new Date()) : false;
            const events = day ? getEventsForDate(day) : [];

            return (
              <div 
                key={idx} 
                className={`min-h-[100px] md:min-h-[130px] p-2 bg-[#090d16]/30 flex flex-col justify-between ${
                  day ? 'text-gray-200' : 'text-gray-700 bg-[#060a12]/10'
                }`}
              >
                {day ? (
                  <>
                    {/* Day number */}
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-indigoAccent text-white shadow-glow' 
                          : 'text-gray-400'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Day events */}
                    <div className="flex-1 mt-2 space-y-1 overflow-y-auto max-h-[70px] md:max-h-[90px] pr-0.5">
                      {events.map((ev, eIdx) => (
                        <Link
                          key={eIdx}
                          to={`/hackathons/${ev.hackathonId}`}
                          className={`block p-1 text-[9px] rounded font-bold truncate transition-all hover:scale-[1.02] ${getEventBadgeClass(ev.type)}`}
                          title={`${ev.title}${ev.time ? ` at ${ev.time}` : ''}`}
                        >
                          {ev.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend guide */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center sm:justify-start">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-rose-500/10 border border-rose-500/20 block"></span>
          <span>Registration Deadline</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/20 block"></span>
          <span>Event Start Date</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-indigo-500/10 border border-indigo-500/20 block"></span>
          <span>Rounds Date</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-gray-500/10 border border-gray-500/20 block"></span>
          <span>Event End Date</span>
        </div>
      </div>
    </div>
  );
};
export default Calendar;
