'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import api from '@/lib/api';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar/events', {
        params: {
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString(),
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    HEARING: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    MEETING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    DEADLINE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    REMINDER: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  };

  const typeLabels = {
    HEARING: 'Duruşma',
    MEETING: 'Toplantı',
    DEADLINE: 'Son Tarih',
    REMINDER: 'Hatırlatma',
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Takvim
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Etkinlik ve duruşma takvimi
            </p>
          </div>
          <Button onClick={() => alert('Yeni etkinlik özelliği yakında eklenecek')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Etkinlik
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = events.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate.getDate() === day &&
                           eventDate.getMonth() === currentDate.getMonth() &&
                           eventDate.getFullYear() === currentDate.getFullYear();
                  });
                  
                  const isToday = new Date().toDateString() === 
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                  return (
                    <div
                      key={day}
                      className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg ${
                        isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {day}
                      </span>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`mt-1 text-xs p-1 rounded truncate ${
                            typeColors[event.type as keyof typeof typeColors]
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          +{dayEvents.length - 2} daha
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Etkinlikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        typeColors[event.type as keyof typeof typeColors]
                      }`}
                    >
                      {typeLabels[event.type as keyof typeof typeLabels]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {event.title}
                  </h4>
                  {event.time && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
