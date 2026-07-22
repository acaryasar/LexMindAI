'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { AICopilotPanel } from '@/components/ai-copilot/ai-copilot-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Scale,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
  Clock3,
  ScrollText,
  FolderOpen,
  Search,
  Sparkles,
  Phone,
  Video,
  Building2,
  MapPin,
  CalendarDays,
  CircleCheckBig,
  TriangleAlert,
  ShieldAlert,
  Navigation,
  NotebookPen,
  DollarSign,
  Target,
  Activity,
  BarChart3,
} from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { casesApi } from '@/lib/api/cases';
import { hearingsApi, Hearing } from '@/lib/api/hearings';
import { tasksApi } from '@/lib/api/tasks';
import { calendarApi, CalendarEvent } from '@/lib/api/calendar';
import { usersApi, User } from '@/lib/api/users';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCases: 0,
    activeClients: 0,
    upcomingHearings: 0,
    pendingTasks: 0,
  });
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [editTimeDialogOpen, setEditTimeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);
  const [editNotesDialogOpen, setEditNotesDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'hearing' | 'ai' | 'case' | 'client' | 'finance' | 'task' | 'activity' | 'performance' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newTime, setNewTime] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [eventNotes, setEventNotes] = useState<Record<string, string>>({});
  const [recentActivities] = useState([
    { id: 1, action: 'Yeni dava oluşturuldu', time: '2 saat önce', type: 'case' },
    { id: 2, action: 'Belge yüklendi', time: '3 saat önce', type: 'document' },
    { id: 3, action: 'Ödeme alındı', time: '5 saat önce', type: 'finance' },
    { id: 4, action: 'AI analiz tamamlandı', time: '6 saat önce', type: 'ai' },
    { id: 5, action: 'Duruşma eklendi', time: '1 gün önce', type: 'hearing' },
  ]);
  const [upcomingHearings, setUpcomingHearings] = useState<Hearing[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const users = await usersApi.getUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const [clientsResponse, casesResponse, hearingsResponse, tasksResponse, eventsResponse] = await Promise.all([
        clientsApi.getAll(1, 1),
        casesApi.getAll(1, 1, undefined, 'ACTIVE'),
        hearingsApi.getAll(1, 100),
        tasksApi.getAll(1, 1, undefined, 'TODO'),
        calendarApi.getAll(today.toISOString(), endOfToday.toISOString()),
      ]);

      const todayEventsList = eventsResponse.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= endOfToday;
      }).sort((a, b) => {
        // Parse time strings to minutes for proper sorting
        const parseTime = (time: string | undefined) => {
          if (!time) return 0;
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        return parseTime(a.time) - parseTime(b.time);
      });

      const upcomingHearingsList = hearingsResponse.data
        .filter(hearing => new Date(hearing.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setStats({
        activeCases: casesResponse.meta.total,
        activeClients: clientsResponse.meta.total,
        upcomingHearings: upcomingHearingsList.length,
        pendingTasks: tasksResponse.meta.total,
      });

      setTodayEvents(todayEventsList);
      setUpcomingHearings(upcomingHearingsList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for event types
  const getEventConfig = (type: string) => {
    const configs: Record<string, { icon: any; color: string; label: string; badgeColor: string }> = {
      HEARING: { icon: Scale, color: 'blue', label: 'Duruşma', badgeColor: 'blue' },
      CLIENT_MEETING: { icon: Users, color: 'green', label: 'Müvekkil Görüşmesi', badgeColor: 'green' },
      DOCUMENT_REVIEW: { icon: ScrollText, color: 'purple', label: 'Dilekçe Teslimi', badgeColor: 'purple' },
      INTERNAL_MEETING: { icon: Users, color: 'indigo', label: 'İç Toplantı', badgeColor: 'indigo' },
      PHONE_CALL: { icon: Phone, color: 'pink', label: 'Telefon Görüşmesi', badgeColor: 'pink' },
      VIDEO_CALL: { icon: Video, color: 'teal', label: 'Video Görüşme', badgeColor: 'teal' },
      DEADLINE: { icon: Clock3, color: 'orange', label: 'Son Tarih', badgeColor: 'orange' },
      REMINDER: { icon: CircleCheckBig, color: 'green', label: 'Hatırlatma', badgeColor: 'green' },
      MEETING: { icon: Users, color: 'blue', label: 'Toplantı', badgeColor: 'blue' },
      OTHER: { icon: FolderOpen, color: 'gray', label: 'Diğer', badgeColor: 'gray' },
    };
    return configs[type] || configs.OTHER;
  };

  const getCountdown = (event: CalendarEvent) => {
    if (!event.time) return null;
    const now = new Date();
    const eventTime = new Date(event.date);
    const [hours, minutes] = event.time.split(':').map(Number);
    eventTime.setHours(hours, minutes, 0, 0);
    const diff = eventTime.getTime() - now.getTime();
    if (diff <= 0) return 'Şu an';
    const minutesDiff = Math.floor(diff / 60000);
    if (minutesDiff < 60) return `${minutesDiff} dk sonra`;
    const hoursDiff = Math.floor(minutesDiff / 60);
    if (hoursDiff < 24) return `${hoursDiff} saat ${minutesDiff % 60} dk sonra`;
    return `${Math.floor(hoursDiff / 24)} gün sonra`;
  };

  const handleOpenCase = (caseNumber: string) => {
    router.push(`/cases/${caseNumber}`);
  };

  const handleOpenMaps = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://maps.google.com/?q=${encodedLocation}`, '_blank');
  };

  const handleJoinMeeting = () => {
    window.open('https://meet.google.com', '_blank');
  };

  const handleOpenNotes = () => {
    // Open notes dialog or navigate to notes page
    router.push('/notes');
  };

  const handleViewPetition = () => {
    // Open petition document
    router.push('/documents');
  };

  const handleAISummary = () => {
    // Open AI summary dialog
    router.push('/ai/summary');
  };

  const handleOpenFile = () => {
    router.push('/files');
  };

  // Event management handlers
  const handleEditTime = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewTime(event.time || '');
    setEditTimeDialogOpen(true);
  };

  const handleSaveTime = async () => {
    if (!selectedEvent) return;
    try {
      await calendarApi.update(selectedEvent.id, { time: newTime });
      await fetchDashboardData();
      setEditTimeDialogOpen(false);
      setSelectedEvent(null);
      setNewTime('');
    } catch (error) {
      console.error('Error updating event time:', error);
    }
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await calendarApi.delete(selectedEvent.id);
      await fetchDashboardData();
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleAddParticipant = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedParticipantId('');
    setAddParticipantDialogOpen(true);
  };

  const handleSaveParticipant = async () => {
    if (!selectedEvent || !selectedParticipantId) return;
    try {
      const currentParticipantIds = selectedEvent.participants?.map(p => p.userId) || [];
      await calendarApi.update(selectedEvent.id, { 
        participantIds: [...currentParticipantIds, selectedParticipantId] 
      });
      await fetchDashboardData();
      setAddParticipantDialogOpen(false);
      setSelectedEvent(null);
      setSelectedParticipantId('');
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleRemoveParticipant = async (participantUserId: string) => {
    if (!selectedEvent) return;
    try {
      const currentParticipantIds = selectedEvent.participants?.map(p => p.userId) || [];
      const updatedParticipantIds = currentParticipantIds.filter(id => id !== participantUserId);
      await calendarApi.update(selectedEvent.id, { 
        participantIds: updatedParticipantIds 
      });
      await fetchDashboardData();
      // Update selectedEvent to reflect changes
      setSelectedEvent({
        ...selectedEvent,
        participants: selectedEvent.participants?.filter(p => p.userId !== participantUserId) || []
      });
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleStartEditingNotes = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventNotes(prev => ({ ...prev, [event.id]: event.notes || '' }));
    setEditNotesDialogOpen(true);
  };

  const handleCancelEditingNotes = () => {
    setEditNotesDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveNotes = async () => {
    if (!selectedEvent) return;
    try {
      await calendarApi.update(selectedEvent.id, { notes: eventNotes[selectedEvent.id] });
      await fetchDashboardData();
      setEditNotesDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleOpenReportDialog = () => {
    setReportDialogOpen(true);
  };

  const handleSelectReportType = (type: 'hearing' | 'ai' | 'case' | 'client' | 'finance' | 'task' | 'activity' | 'performance') => {
    setSelectedReportType(type);
    setReportDialogOpen(false);
    // Navigate to report page based on type
    switch (type) {
      case 'hearing':
        router.push('/reports/hearing-schedule');
        break;
      case 'ai':
        router.push('/reports/ai-analysis');
        break;
      case 'case':
        router.push('/reports/case-status');
        break;
      case 'client':
        router.push('/reports/client');
        break;
      case 'finance':
        router.push('/reports/finance');
        break;
      case 'task':
        router.push('/reports/task');
        break;
      case 'activity':
        router.push('/reports/activity');
        break;
      case 'performance':
        router.push('/reports/performance');
        break;
    }
  };

  const handleAIAnalysis = () => {
    router.push('/ai/analysis');
  };

  const kpiData = [
    {
      title: 'Aktif Davalar',
      value: stats.activeCases.toString(),
      trend: '+12%',
      icon: Scale,
      color: 'blue',
    },
    {
      title: 'Aktif Müvekkiller',
      value: stats.activeClients.toString(),
      trend: '+8%',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Yaklaşan Duruşmalar',
      value: stats.upcomingHearings.toString(),
      trend: '+2',
      icon: Calendar,
      color: 'orange',
    },
    {
      title: 'Bekleyen Görevler',
      value: stats.pendingTasks.toString(),
      trend: '-5',
      icon: Clock,
      color: 'purple',
    },
  ];

  return (
    <div className="flex">
      <MainLayout showAIPanel={true}>
        <div 
          className="space-y-6 transition-all duration-300 ease-in-out lg:mr-80 md:mr-64 mr-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ana Sayfa
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Hoş geldiniz, işlerinizi buradan yönetebilirsiniz
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleOpenReportDialog}>
                <FileText className="w-4 h-4 mr-2" />
                Rapor Oluştur
              </Button>
              <Button onClick={() => router.push('/cases/new')}>
                <Scale className="w-4 h-4 mr-2" />
                Yeni Dava
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi) => {
              const Icon = kpi.icon;
              const colorClasses = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                orange: 'bg-orange-500',
                purple: 'bg-purple-500',
              };

              return (
                <Card key={kpi.title}>
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {kpi.title}
                    </p>
                    <div className="flex items-center gap-3 justify-center">
                      <div className={`w-12 h-12 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {kpi.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bugünkü Ajanda - Premium Timeline */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bugünün Ajandası</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8">
                      <CalendarDays className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[80px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {todayEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Bugün için planlanan etkinlik yok</p>
                      </div>
                    ) : (
                      todayEvents.map((event, index) => {
                        const config = getEventConfig(event.type);
                        const Icon = config.icon;
                        const countdown = getCountdown(event);
                        const isFirst = index === 0;
                        const isCurrent = countdown === 'Şu an';

                        return (
                          <div key={event.id} className="relative flex items-start group">
                            {/* Time Column */}
                            <div className="w-[80px] flex-shrink-0 pr-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {event.time || '--:--'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(event.date).toLocaleDateString('tr-TR', { month: 'short' })}
                                </p>
                              </div>
                            </div>

                            {/* Timeline Node */}
                            <div className={`absolute left-[76px] w-4 h-4 rounded-full bg-${config.color}-500 border-4 border-white dark:border-gray-900 shadow-md z-10 ${isCurrent ? 'animate-pulse' : ''}`}></div>

                            {/* Event Card */}
                            <div className="flex-1 ml-4">
                              <div
                                onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                                className={`bg-white dark:bg-gray-800 rounded-2xl cursor-pointer transition-all duration-300 ${isFirst ? 'shadow-md' : 'shadow-sm'} hover:shadow-lg ${isFirst ? 'border-l-4 border-l-blue-500 border border-blue-200 dark:border-blue-800' : 'border border-gray-100 dark:border-gray-700'} group-hover:border-blue-200 dark:group-hover:border-blue-800 ${expandedEventId === event.id ? 'p-4' : 'p-3'}`}
                              >
                                {/* Event Header - Always Visible */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 rounded-lg bg-${config.color}-bg dark:bg-${config.color}-900/20 flex items-center justify-center`}>
                                      <Icon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{config.label}</p>
                                      <span className={`text-xs bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-700 dark:text-${config.color}-300 px-2 py-0.5 rounded-full`}>
                                        {event.type}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {countdown && (
                                      <p className={`text-xs font-medium ${isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        {countdown}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedEventId === event.id && (
                                  <div className="mt-3 space-y-3">
                                    {/* Event Details */}
                                    <div className="space-y-2">
                                      {event.location && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                          <MapPin className="w-4 h-4 mr-2" />
                                          <span>{event.location}</span>
                                        </div>
                                      )}
                                      {event.duration && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                          <Clock3 className="w-4 h-4 mr-2" />
                                          <span>Süre: {event.duration} dakika</span>
                                        </div>
                                      )}
                                      
                                      {/* Notes Section */}
                                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <NotebookPen className="w-4 h-4 mr-2" />
                                        <span>Notlar</span>
                                      </div>
                                      <div 
                                        className="min-h-[40px] p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEditingNotes(event);
                                        }}
                                      >
                                        {event.notes ? (
                                          <p className="whitespace-pre-wrap">{event.notes}</p>
                                        ) : (
                                          <p className="text-gray-400 dark:text-gray-500 italic">Not eklemek için tıklayın...</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* AI Insight */}
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                                      <div className="flex items-start space-x-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-purple-700 dark:text-purple-300">
                                          {isCurrent ? 'Bu etkinlik şu an başlıyor. Hazırlıklarınızı tamamlayın.' : 'Bu etkinlik için hazırlık yapmayı unutmayın.'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Event Management Actions */}
                                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1 text-xs"
                                        onClick={() => handleEditTime(event)}
                                      >
                                        <Clock3 className="w-3 h-3 mr-1" />
                                        Saat Düzenle
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1 text-xs"
                                        onClick={() => handleAddParticipant(event)}
                                      >
                                        <Users className="w-3 h-3 mr-1" />
                                        Katılımcı Ekle
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className="flex-1 text-xs"
                                        onClick={() => handleDeleteEvent(event)}
                                      >
                                        Sil
                                      </Button>
                                    </div>

                                    {/* Conditional Action Buttons */}
                                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                      {event.type === 'HEARING' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={() => handleOpenCase('')}>
                                            Davayı Aç
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={() => handleOpenMaps(event.location || '')}>
                                            <Navigation className="w-4 h-4 mr-1" />
                                            Yol Tarifi
                                          </Button>
                                        </>
                                      )}
                                      {event.type === 'CLIENT_MEETING' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={handleJoinMeeting}>
                                            Toplantıya Katıl
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditingNotes(event);
                                          }}>
                                            <NotebookPen className="w-4 h-4 mr-1" />
                                            Notlar
                                          </Button>
                                        </>
                                      )}
                                      {event.type === 'DOCUMENT_REVIEW' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={handleViewPetition}>
                                            Dilekçeyi Gör
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={handleAISummary}>
                                            <Sparkles className="w-4 h-4 mr-1" />
                                            AI Özet
                                          </Button>
                                        </>
                                      )}
                                      {event.type === 'INTERNAL_MEETING' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={handleJoinMeeting}>
                                            Toplantıya Katıl
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditingNotes(event);
                                          }}>
                                            <NotebookPen className="w-4 h-4 mr-1" />
                                            Notlar
                                          </Button>
                                        </>
                                      )}
                                      {event.type === 'VIDEO_CALL' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={handleJoinMeeting}>
                                            Görüşmeye Katıl
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditingNotes(event);
                                          }}>
                                            <NotebookPen className="w-4 h-4 mr-1" />
                                            Notlar
                                          </Button>
                                        </>
                                      )}
                                      {event.type === 'PHONE_CALL' && (
                                        <>
                                          <Button size="sm" className="flex-1">
                                            Aramayı Başlat
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditingNotes(event);
                                          }}>
                                            <NotebookPen className="w-4 h-4 mr-1" />
                                            Notlar
                                          </Button>
                                        </>
                                      )}
                                      {(event.type === 'DEADLINE' || event.type === 'REMINDER') && (
                                        <Button size="sm" className="flex-1" onClick={() => router.push('/tasks')}>
                                          Görevleri Gör
                                        </Button>
                                      )}
                                      {event.type === 'OTHER' && (
                                        <>
                                          <Button size="sm" className="flex-1" onClick={handleOpenFile}>
                                            Dosyayı Aç
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={handleAIAnalysis}>
                                            <Sparkles className="w-4 h-4 mr-1" />
                                            AI Analizi
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {activity.type === 'case' && <Scale className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'document' && <FileText className="w-5 h-5 text-green-600" />}
                        {activity.type === 'finance' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'ai' && <CheckCircle className="w-5 h-5 text-orange-600" />}
                        {activity.type === 'hearing' && <Calendar className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Hearings */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Duruşmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHearings.map((hearing) => (
                  <div 
                    key={hearing.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => router.push(`/hearings/${hearing.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dava ID: {hearing.caseId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {hearing.location || 'Konum belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(hearing.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {hearing.time || 'Saat belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingHearings.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Yaklaşan duruşma yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>

      {/* Edit Time Dialog */}
      <Dialog open={editTimeDialogOpen} onOpenChange={setEditTimeDialogOpen}>
        <DialogHeader>
          <DialogTitle>Saat Düzenle</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="time">Yeni Saat</Label>
              <Input
                id="time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditTimeDialogOpen(false)}>
            İptal
          </Button>
          <Button onClick={handleSaveTime}>
            Kaydet
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Etkinliği Sil</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            İptal
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantDialogOpen} onOpenChange={setAddParticipantDialogOpen}>
        <DialogHeader>
          <DialogTitle>Katılımcı Yönetimi</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 py-4">
            {/* Existing Participants */}
            {selectedEvent && selectedEvent.participants && selectedEvent.participants.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Mevcut Katılımcılar</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedEvent.participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {participant.user.firstName[0]}{participant.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {participant.user.firstName} {participant.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {participant.user.email}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleRemoveParticipant(participant.userId)}
                      >
                        <CircleCheckBig className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Participant */}
            <div>
              <Label htmlFor="participant">Yeni Katılımcı Ekle</Label>
              <select
                id="participant"
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Kullanıcı seçin...</option>
                {availableUsers
                  .filter(user => !selectedEvent?.participants?.some(p => p.userId === user.id))
                  .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddParticipantDialogOpen(false)}>
            Kapat
          </Button>
          {selectedParticipantId && (
            <Button onClick={handleSaveParticipant}>
              Ekle
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Edit Notes Dialog */}
      <Dialog open={editNotesDialogOpen} onOpenChange={setEditNotesDialogOpen}>
        <DialogHeader>
          <DialogTitle>Notları Düzenle</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notes">Notlar</Label>
              <textarea
                id="notes"
                value={selectedEvent ? eventNotes[selectedEvent.id] || '' : ''}
                onChange={(e) => setEventNotes(prev => ({ ...prev, [selectedEvent?.id || '']: e.target.value }))}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                rows={6}
                placeholder="Notlarınızı buraya yazın..."
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancelEditingNotes}>
            İptal
          </Button>
          <Button onClick={handleSaveNotes}>
            Kaydet
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Report Selection Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogHeader>
          <DialogTitle>Rapor Seçin</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Oluşturmak istediğiniz rapor türünü seçin:
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('hearing')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Duruşma Takvimi Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yaklaşan duruşmalar ve detayları</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('ai')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">AI Analiz Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI tarafından yapılan analizler ve öneriler</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('case')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Dava Durum Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aktif davaların durum özeti</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('client')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Müvekkil Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Müvekkil bazlı özet ve aktiviteler</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('finance')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Finansal Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gelir/gider özeti ve ödemeler</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('task')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Görev Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bekleyen görevler ve deadline'lar</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('activity')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Aktivite Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Son aktiviteler ve kullanıcı bazlı özet</p>
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => handleSelectReportType('performance')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">Performans Raporu</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">KPI metrikleri ve trend analizi</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
            İptal
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
