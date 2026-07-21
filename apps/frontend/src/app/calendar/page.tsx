'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { calendarApi, CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/lib/api/calendar';
import { useAlert } from '@/components/ui/alert-dialog';

export default function CalendarPage() {
  const { showAlert } = useAlert();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<CreateCalendarEventDto>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: 60,
    location: '',
    notes: '',
    type: 'MEETING',
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      const data = await calendarApi.getAll(startDate, endDate);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showAlert('error', 'Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    HEARING: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    MEETING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    DEADLINE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    REMINDER: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    CLIENT_MEETING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    DOCUMENT_REVIEW: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
    INTERNAL_MEETING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
    PHONE_CALL: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
    VIDEO_CALL: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
    OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const typeLabels = {
    HEARING: 'Duruşma',
    MEETING: 'Toplantı',
    DEADLINE: 'Son Tarih',
    REMINDER: 'Hatırlatma',
    CLIENT_MEETING: 'Müvekkil Görüşmesi',
    DOCUMENT_REVIEW: 'Belge İncelemesi',
    INTERNAL_MEETING: 'İç Toplantı',
    PHONE_CALL: 'Telefon Görüşmesi',
    VIDEO_CALL: 'Video Görüşme',
    OTHER: 'Diğer',
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

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      duration: 60,
      location: '',
      notes: '',
      type: 'MEETING',
    });
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || '',
      duration: event.duration || 60,
      location: event.location || '',
      notes: event.notes || '',
      type: event.type,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await calendarApi.delete(id);
      showAlert('success', 'Etkinlik başarıyla silindi');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('error', 'Etkinlik silinirken hata oluştu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await calendarApi.update(editingEvent.id, formData);
        showAlert('success', 'Etkinlik başarıyla güncellendi');
      } else {
        await calendarApi.create(formData);
        showAlert('success', 'Etkinlik başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showAlert('error', 'Etkinlik kaydedilirken hata oluştu');
    }
  };

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
          <Button onClick={handleCreateEvent}>
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
                      className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => {
                        if (dayEvents.length === 1) {
                          handleEditEvent(dayEvents[0]);
                        } else if (dayEvents.length > 1) {
                          handleCreateEvent();
                        }
                      }}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {day}
                      </span>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`mt-1 text-xs p-1 rounded truncate ${
                            typeColors[event.type as keyof typeof typeColors] || typeColors.OTHER
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
                <div key={event.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        typeColors[event.type as keyof typeof typeColors] || typeColors.OTHER
                      }`}
                    >
                      {typeLabels[event.type as keyof typeof typeLabels] || event.type}
                    </span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditEvent(event)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}</DialogTitle>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Etkinlik Türü</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="MEETING">Toplantı</option>
                <option value="HEARING">Duruşma</option>
                <option value="CLIENT_MEETING">Müvekkil Görüşmesi</option>
                <option value="DOCUMENT_REVIEW">Belge İncelemesi</option>
                <option value="INTERNAL_MEETING">İç Toplantı</option>
                <option value="PHONE_CALL">Telefon Görüşmesi</option>
                <option value="VIDEO_CALL">Video Görüşme</option>
                <option value="DEADLINE">Son Tarih</option>
                <option value="REMINDER">Hatırlatma</option>
                <option value="OTHER">Diğer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Saat</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Süre (dakika)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
              />
            </div>
            <div>
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </form>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit}>
            {editingEvent ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogFooter>
      </Dialog>
    </MainLayout>
  );
}
