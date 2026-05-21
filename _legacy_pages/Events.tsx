import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventCategory } from '../types';
import { CalendarDays, MapPin, Users, Check, Clock } from 'lucide-react';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  social: 'Social',
  academic: 'Acadêmico',
  sports: 'Esportes',
  cultural: 'Cultural'
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  social: 'bg-orange-100 text-orange-700',
  academic: 'bg-blue-100 text-blue-700',
  sports: 'bg-green-100 text-green-700',
  cultural: 'bg-purple-100 text-purple-700'
};

const CATEGORY_BORDER: Record<EventCategory, string> = {
  social: 'border-orange-200',
  academic: 'border-blue-200',
  sports: 'border-green-200',
  cultural: 'border-purple-200'
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const dayName = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNum = d.getDate();
  const month = d.toLocaleDateString('pt-BR', { month: 'short' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Hoje às ${time}`;
  if (isTomorrow) return `Amanhã às ${time}`;
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayNum} de ${month}`;
}

const Events: React.FC = () => {
  const { events, attendedEventIds, attendEvent } = useApp();
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all');

  const categories: Array<EventCategory | 'all'> = ['all', 'social', 'academic', 'sports', 'cultural'];

  const filtered = activeCategory === 'all'
    ? events
    : events.filter(e => e.category === activeCategory);

  const sortedEvents = [...filtered].sort((a, b) => a.date - b.date);

  const totalAttending = attendedEventIds.length;

  return (
    <div className="h-full bg-paper overflow-y-auto pb-6 font-sans">
      {/* Header */}
      <div className="bg-iesgo-blue px-5 pt-6 pb-8">
        <h1 className="text-2xl font-display font-extrabold text-white tracking-tight mb-1">
          Eventos IESGO
        </h1>
        <p className="text-blue-200 text-sm">
          {totalAttending > 0
            ? `Você confirmou presença em ${totalAttending} evento${totalAttending > 1 ? 's' : ''} 🎓`
            : 'Confirme presença nos eventos do campus!'
          }
        </p>
      </div>

      {/* Category Tabs */}
      <div className="px-5 -mt-4 mb-5">
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/10 p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-iesgo-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat as EventCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="px-5 space-y-4">
        {sortedEvents.map(event => {
          const isAttending = attendedEventIds.includes(event.id);
          return (
            <div
              key={event.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                isAttending ? CATEGORY_BORDER[event.category] : 'border-slate-100'
              }`}
            >
              {/* Event Header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 border border-slate-100">
                      {event.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[event.category]}`}>
                          {CATEGORY_LABELS[event.category].toUpperCase()}
                        </span>
                        {isAttending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            CONFIRMADO ✓
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-base leading-tight">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mt-2 mb-3">
                  {event.description}
                </p>

                {/* Meta info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-medium">
                      <span className="text-slate-600 font-bold">{event.attendees}</span> confirmados — {event.organizer}
                    </span>
                  </div>
                </div>
              </div>

              {/* RSVP Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => attendEvent(event.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    isAttending
                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-iesgo-blue text-white hover:bg-blue-900 shadow-sm shadow-blue-900/20'
                  }`}
                >
                  {isAttending ? (
                    <>
                      <Check className="w-4 h-4" />
                      Presença Confirmada — Cancelar
                    </>
                  ) : (
                    <>
                      <CalendarDays className="w-4 h-4" />
                      Confirmar Presença
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-display font-bold text-slate-700 mb-2">Nenhum evento nessa categoria</h3>
            <p className="text-sm text-slate-400">Tente outra categoria ou volte em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
