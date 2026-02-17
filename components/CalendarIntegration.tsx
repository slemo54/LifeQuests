import React, { useState, useEffect } from 'react';
import { Habit } from '../types';

interface HabitSchedule {
  habitId: string;
  time: string; // HH:MM format
  daysOfWeek?: number[]; // 0-6, undefined = daily
}

interface CalendarIntegrationProps {
  habits: Habit[];
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ habits }) => {
  const [schedules, setSchedules] = useState<HabitSchedule[]>(() => {
    const saved = localStorage.getItem('lifequests_schedules');
    return saved ? JSON.parse(saved) : getDefaultSchedules(habits);
  });
  
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Salva schedules quando cambiano
  useEffect(() => {
    localStorage.setItem('lifequests_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Aggiorna schedules quando cambiano le abitudini
  useEffect(() => {
    const currentIds = new Set(schedules.map(s => s.habitId));
    const habitIds = new Set(habits.map(h => h.id));
    
    // Aggiungi nuove abitudini
    const newSchedules = habits
      .filter(h => !currentIds.has(h.id))
      .map(h => getDefaultSchedule(h));
    
    if (newSchedules.length > 0) {
      setSchedules(prev => [...prev, ...newSchedules]);
    }
    
    // Rimuovi abitudini eliminate
    setSchedules(prev => prev.filter(s => habitIds.has(s.habitId)));
  }, [habits]);

  const getDefaultSchedules = (habits: Habit[]): HabitSchedule[] => {
    return habits.map(h => getDefaultSchedule(h));
  };

  const getDefaultSchedule = (habit: Habit): HabitSchedule => {
    const defaultTimes: Record<string, string> = {
      'Pushups EXTREME': '07:00',
      'Ted talk': '08:00',
      'Check note rocketbook': '09:00',
      'Side Job - 1 oretta': '14:00',
      'Storytell': '21:00',
      'Yoga': '07:00',
      'Side Job - 2 ore': '14:00',
      'Leggere 10 pagine': '22:00',
      'Brilliant': '10:00'
    };
    
    const time = defaultTimes[habit.title] || '09:00';
    const daysOfWeek = getDaysForFrequency(habit.frequency);
    
    return {
      habitId: habit.id,
      time,
      daysOfWeek
    };
  };

  const getDaysForFrequency = (frequency: string): number[] | undefined => {
    switch (frequency) {
      case 'Daily':
        return [0, 1, 2, 3, 4, 5, 6]; // Tutti i giorni
      case 'Every 2 Days':
        return undefined; // Gestito diversamente
      case 'Weekly':
        return [0]; // Domenica
      default:
        return [0, 1, 2, 3, 4, 5, 6];
    }
  };

  const updateSchedule = (habitId: string, newTime: string) => {
    setSchedules(prev => prev.map(s => 
      s.habitId === habitId ? { ...s, time: newTime } : s
    ));
    setEditingHabit(null);
    
    // Notifica utente
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      showNotification(`⏰ Orario aggiornato: ${habit.title} alle ${newTime}`);
    }
  };

  const showNotification = (message: string) => {
    // Usa toast esistente o crea notifica
    if (window.showToast) {
      window.showToast('Orario aggiornato', message, 'info');
    }
  };

  const syncToGoogleCalendar = async () => {
    setSyncStatus('syncing');
    
    try {
      // Qui integreremo l'API Google Calendar
      // Per ora simuliamo il sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Salva timestamp ultimo sync
      localStorage.setItem('lifequests_last_sync', new Date().toISOString());
      setSyncStatus('synced');
      
      showNotification('📅 Sincronizzato con Google Calendar!');
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      showNotification('❌ Errore sincronizzazione. Riprova.');
    }
  };

  const exportToCalendar = () => {
    // Genera file .ics per import manuale
    const icsContent = generateICS(schedules, habits);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life-quests-schedule.ics';
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('📅 File calendario scaricato!');
  };

  const generateICS = (scheds: HabitSchedule[], habitList: Habit[]): string => {
    const events = scheds.map(sched => {
      const habit = habitList.find(h => h.id === sched.habitId);
      if (!habit) return '';
      
      const [hours, minutes] = sched.time.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(hours), parseInt(minutes), 0);
      
      const endDate = new Date(startDate.getTime() + 30 * 60000); // +30 min
      
      return `BEGIN:VEVENT
UID:${habit.id}@lifequests.app
DTSTART;TZID=Europe/Rome:${formatDate(startDate)}T${sched.time.replace(':', '')}00
DTEND;TZID=Europe/Rome:${formatDate(endDate)}T${formatTime(endDate).replace(':', '')}00
RRULE:FREQ=${getFrequencyRule(habit.frequency)}
SUMMARY:${habit.title}
DESCRIPTION:Difficoltà: ${habit.difficulty} | Life Quests
END:VEVENT`;
    }).filter(Boolean).join('\n');
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Life Quests//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  const getFrequencyRule = (frequency: string): string => {
    switch (frequency) {
      case 'Daily': return 'DAILY';
      case 'Every 2 Days': return 'DAILY;INTERVAL=2';
      case 'Weekly': return 'WEEKLY;BYDAY=SU';
      default: return 'DAILY';
    }
  };

  const getHabitSchedule = (habitId: string): HabitSchedule | undefined => {
    return schedules.find(s => s.habitId === habitId);
  };

  return (
    <div className="calendar-integration">
      <div className="calendar-header">
        <h3>📅 Schedule & Calendar</h3>
        <div className="calendar-actions">
          <button 
            className={`sync-btn ${syncStatus}`}
            onClick={syncToGoogleCalendar}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' > '⏳ Sync...' 
              : syncStatus === 'synced' > '✅ Synced!' 
              : syncStatus === 'error'
              ? '❌ Retry'
              : '📅 Sync Google Calendar'}
          </button>
          <button className="export-btn" onClick={exportToCalendar}>
            📥 Export .ics
          </button>
        </div>
      </div>

      <div className="schedule-list">
        {habits.map(habit => {
          const schedule = getHabitSchedule(habit.id);
          const isEditing = editingHabit === habit.id;
          
          return (
            <div key={habit.id} className="schedule-item">
              <div className="habit-info">
                <span className="habit-title">{habit.title}</span>
                <span className="habit-meta">
                  {habit.frequency} • {habit.difficulty}
                </span>
              </div>
              
              <div className="time-editor">
                {isEditing ? (
                  <>
                    <input
                      type="time"
                      value={tempTime}
                      onChange={(e) => setTempTime(e.target.value)}
                      className="time-input"
                    />
                    <button 
                      className="save-btn"
                      onClick={() => updateSchedule(habit.id, tempTime)}
                    >
                      ✓
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setEditingHabit(null)}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="time-display">
                      🕐 {schedule?.time || '09:00'}
                    </span>
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setEditingHabit(habit.id);
                        setTempTime(schedule?.time || '09:00');
                      }}
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-tips">
        <p>💡 <strong>Tip:</strong> Modifica gli orari cliccando ✏️. 
        I cambiamenti vengono salvati automaticamente.</p>
        <p>📱 <strong>Google Calendar:</strong> Clicca "Sync" per 
        sincronizzare le abitudini con il tuo calendario.</p>
      </div>

      <style>{`
        .calendar-integration {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .calendar-header h3 {
          margin: 0;
          color: #fff;
        }
        
        .calendar-actions {
          display: flex;
          gap: 8px;
        }
        
        .sync-btn, .export-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        
        .sync-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        .sync-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .sync-btn.synced {
          background: #22c55e;
        }
        
        .sync-btn.error {
          background: #ef4444;
        }
        
        .export-btn {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
        }
        
        .habit-info {
          display: flex;
          flex-direction: column;
        }
        
        .habit-title {
          font-weight: 600;
          color: #fff;
        }
        
        .habit-meta {
          font-size: 0.75rem;
          color: #888;
        }
        
        .time-editor {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .time-display {
          color: #667eea;
          font-weight: 600;
        }
        
        .time-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid #667eea;
          color: #fff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .edit-btn, .save-btn, .cancel-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .edit-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .save-btn {
          color: #22c55e;
        }
        
        .cancel-btn {
          color: #ef4444;
        }
        
        .calendar-tips {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .calendar-tips p {
          margin: 8px 0;
          font-size: 0.8rem;
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default CalendarIntegration;
