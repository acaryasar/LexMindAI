'use client';

import { useState, useEffect } from 'react';
import { Brain, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateMockRecommendations } from '@/lib/mock-data';

interface AICopilotPanelProps {
  context?: 'dashboard' | 'client' | 'case' | 'document';
  entityId?: string;
}

interface Recommendation {
  id: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason: string;
  businessImpact?: string;
  legalImpact?: string;
  estimatedTime?: number;
  confidenceScore: number;
  actions: Array<{
    id: string;
    type: string;
    label: string;
    requiresApproval: boolean;
  }>;
}

interface DailyPlan {
  greeting: string;
  workload: {
    totalTasks: number;
    hearings: number;
    tasks: number;
    events: number;
    estimatedMinutes: number;
    estimatedHours: number;
  };
  productivityScore?: number;
}

export function AICopilotPanel({ context = 'dashboard', entityId }: AICopilotPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [topPriority, setTopPriority] = useState<Recommendation | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [explainWhy, setExplainWhy] = useState<string | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [panelTitle, setPanelTitle] = useState('LexMind AI');
  const [panelSubtitle, setPanelSubtitle] = useState('Yasal AI Asistanınız');

  useEffect(() => {
    // Fetch recommendations and daily plan
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      // Use mock data based on context
      const mockRecommendations = generateMockRecommendations(50);
      
      let mockDailyPlan: DailyPlan | null = null;
      let panelTitle = 'LexMind AI';
      let panelSubtitle = 'Yasal AI Asistanınız';

      if (context === 'dashboard') {
        mockDailyPlan = {
          greeting: 'Günaydın',
          workload: {
            totalTasks: getRandomNumber(5, 15),
            hearings: getRandomNumber(1, 5),
            tasks: getRandomNumber(3, 10),
            events: getRandomNumber(1, 4),
            estimatedMinutes: getRandomNumber(240, 600),
            estimatedHours: getRandomNumber(4, 10),
          },
          productivityScore: getRandomNumber(65, 95),
        };
        setPanelTitle('LexMind AI');
        setPanelSubtitle('Yasal AI Asistanınız');
      } else if (context === 'client') {
        setPanelTitle('Müvekkil AI');
        setPanelSubtitle('Müvekkil Analizi');
      } else if (context === 'case') {
        setPanelTitle('Dava AI');
        setPanelSubtitle('Dava Analizi');
      } else if (context === 'document') {
        setPanelTitle('Belge AI');
        setPanelSubtitle('Belge Analizi');
      }

      setRecommendations(mockRecommendations);
      setTopPriority(mockRecommendations[0]);
      setDailyPlan(mockDailyPlan);
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white/80 backdrop-blur-xl border-l border-gray-200/50 p-6 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-2xl" />
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/80 backdrop-blur-xl border-l border-gray-200/50 p-6 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{panelTitle}</h2>
            <p className="text-xs text-gray-500">{panelSubtitle}</p>
          </div>
        </div>
        
        {dailyPlan && (
          <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50">
            <p className="text-sm font-medium text-purple-900">{dailyPlan.greeting}</p>
            <p className="text-xs text-purple-600 mt-1">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-700">{dailyPlan.workload.estimatedHours}sa iş yükü</span>
              </div>
              {dailyPlan.productivityScore && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-700">{dailyPlan.productivityScore}% verimlilik</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Priority Card */}
      {topPriority && (
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 border border-gray-100 overflow-hidden">
            <div className={`h-1 ${getPriorityColor(topPriority.priority)}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  getPriorityBadge(topPriority.priority)
                )}>
                  {topPriority.priority.toUpperCase()} ÖNCELİK
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-600">{topPriority.confidenceScore}%</span>
                </div>
              </div>
              
              <h3 className="text-base font-semibold text-gray-900 mb-2">{topPriority.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{topPriority.description}</p>
              
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Bunu neden görüyorum?</p>
                <p className="text-sm text-gray-700">{topPriority.reason}</p>
              </div>

              {topPriority.estimatedTime && (
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Tahmini süre: {topPriority.estimatedTime} dakika</span>
                </div>
              )}

              <div className="space-y-2">
                {topPriority.actions.map((action) => (
                  <button
                    key={action.id}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                      'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                      'hover:from-purple-600 hover:to-purple-700',
                      'shadow-md shadow-purple-200',
                      'flex items-center justify-center gap-2'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
Kapat
                </button>
                <button
                  onClick={() => setExplainWhy(explainWhy === topPriority.id ? null : topPriority.id)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
Açıkla
                </button>
              </div>

              {explainWhy === topPriority.id && (
                <div className="mt-3 p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-700">
                    {topPriority.businessImpact && <><strong>İş Etkisi:</strong> {topPriority.businessImpact}<br /></>}
                    {topPriority.legalImpact && <><strong>Yasal Etki:</strong> {topPriority.legalImpact}</>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Akıllı Öneriler
        </h3>
        
        <div className="space-y-3">
          {recommendations.slice(1).map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full border',
                  getPriorityBadge(rec.priority)
                )}>
                  {rec.priority}
                </span>
                <span className="text-xs text-purple-600 font-medium">{rec.confidenceScore}%</span>
              </div>
              
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</h4>
              <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {rec.estimatedTime}m
                </div>
                <button 
                  onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                  {expandedRec === rec.id ? 'Detayları Gizle' : 'Detayları Gör →'}
                </button>
              </div>

              {expandedRec === rec.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Bunu neden görüyorum?</p>
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                  </div>

                  {rec.businessImpact && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-700">
                        <strong>İş Etkisi:</strong> {rec.businessImpact}
                      </p>
                    </div>
                  )}

                  {rec.legalImpact && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs text-purple-700">
                        <strong>Yasal Etki:</strong> {rec.legalImpact}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {rec.actions.map((action) => (
                      <button
                        key={action.id}
                        className={cn(
                          'w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                          'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
                          'hover:from-purple-600 hover:to-purple-700',
                          'shadow-md shadow-purple-200',
                          'flex items-center justify-center gap-2'
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Optimize Day Button */}
      <div className="mt-6">
        <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-2xl shadow-lg shadow-purple-200 hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
Günümü Optimize Et
        </button>
      </div>
    </div>
  );
}
