'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, Sparkles, Undo, Redo, AlertCircle, CheckCircle, 
  Loader2, Keyboard, ArrowRight, X
} from 'lucide-react';
import { spacing, borderRadius, typography, animations } from '@/lib/design-system';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: z.ZodTypeAny;
  options?: Array<{ label: string; value: string }>;
  aiSuggestion?: string;
  onAiSuggestionAccept?: (value: string) => void;
}

export interface AdvancedFormProps {
  // Form Schema
  schema: z.ZodObject<any>;
  fields: FormField[];
  defaultValues?: Record<string, any>;

  // Form State
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;

  // Autosave
  enableAutosave?: boolean;
  autosaveDelay?: number;
  onAutosave?: (data: any) => Promise<void> | void;

  // Draft Mode
  enableDraftMode?: boolean;
  onSaveDraft?: (data: any) => Promise<void> | void;
  draftExists?: boolean;

  // Progress
  showProgress?: boolean;
  progress?: number;

  // AI Suggestions
  enableAISuggestions?: boolean;
  onGetAISuggestions?: (fieldName: string) => Promise<string>;

  // Styling
  className?: string;
}

export function AdvancedForm({
  schema,
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  enableAutosave = true,
  autosaveDelay = 2000,
  onAutosave,
  enableDraftMode = true,
  onSaveDraft,
  draftExists = false,
  showProgress = false,
  progress = 0,
  enableAISuggestions = true,
  onGetAISuggestions,
  className,
}: AdvancedFormProps) {
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, setValue, getValues, formState: { dirtyFields, isValid } } = methods;
  const watchedValues = watch();

  // Autosave functionality
  useEffect(() => {
    if (!enableAutosave || !onAutosave) return;

    const hasChanges = Object.keys(dirtyFields).length > 0;
    
    if (hasChanges) {
      setAutosaveStatus('unsaved');
      
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(async () => {
        setIsAutosaving(true);
        setAutosaveStatus('saving');
        
        try {
          await onAutosave(getValues());
          setAutosaveStatus('saved');
        } catch (error) {
          console.error('Autosave failed:', error);
          setAutosaveStatus('unsaved');
        } finally {
          setIsAutosaving(false);
        }
      }, autosaveDelay);
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [watchedValues, dirtyFields, enableAutosave, onAutosave, autosaveDelay, getValues]);

  // History management
  useEffect(() => {
    if (Object.keys(dirtyFields).length > 0) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(getValues());
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [watchedValues]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      Object.keys(previousState).forEach((key) => {
        setValue(key, previousState[key]);
      });
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setValue]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      Object.keys(nextState).forEach((key) => {
        setValue(key, nextState[key]);
      });
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setValue]);

  // AI Suggestions
  const handleGetAISuggestion = async (fieldName: string) => {
    if (!onGetAISuggestions || !enableAISuggestions) return;

    setLoadingSuggestions((prev) => ({ ...prev, [fieldName]: true }));
    
    try {
      const suggestion = await onGetAISuggestions(fieldName);
      setAiSuggestions((prev) => ({ ...prev, [fieldName]: suggestion }));
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleAcceptAISuggestion = (fieldName: string, value: string) => {
    setValue(fieldName, value);
    setAiSuggestions((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      setAutosaveStatus('saved');
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        await onSaveDraft(getValues());
      } catch (error) {
        console.error('Draft save failed:', error);
      }
    }
  };

  const renderField = (field: FormField) => {
    const value = watchedValues[field.name];
    const error = methods.formState.errors[field.name];
    const isDirty = dirtyFields[field.name];
    const suggestion = aiSuggestions[field.name];
    const isLoadingSuggestion = loadingSuggestions[field.name];

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={cn('text-sm font-medium text-gray-700', typography.small)}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {enableAISuggestions && onGetAISuggestions && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleGetAISuggestion(field.name)}
              disabled={isLoadingSuggestion}
              className="h-6 text-xs"
            >
              {isLoadingSuggestion ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Öner
                </>
              )}
            </Button>
          )}
        </div>

        {field.type === 'textarea' ? (
          <textarea
            {...methods.register(field.name)}
            placeholder={field.placeholder}
            className={cn(
              'w-full px-4 py-2.5 text-sm rounded-xl border',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'transition-all',
              error && 'border-red-500 focus:ring-red-500',
              isDirty && 'border-purple-300'
            )}
            rows={4}
          />
        ) : field.type === 'select' ? (
          <select
            {...methods.register(field.name)}
            className={cn(
              'w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'transition-all',
              error && 'border-red-500 focus:ring-red-500',
              isDirty && 'border-purple-300'
            )}
          >
            <option value="">{field.placeholder || 'Seçin...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            type={field.type}
            {...methods.register(field.name)}
            placeholder={field.placeholder}
            className={cn(
              error && 'border-red-500 focus:ring-red-500',
              isDirty && 'border-purple-300'
            )}
          />
        )}

        {/* AI Suggestion */}
        {suggestion && (
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">{suggestion}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcceptAISuggestion(field.name, suggestion)}
                  className="text-xs"
                >
Kabul Et
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setAiSuggestions((prev) => ({ ...prev, [field.name]: '' }))}
                  className="text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>{error.message as string}</span>
          </div>
        )}

        {/* Field-specific AI suggestion from props */}
        {field.aiSuggestion && field.onAiSuggestionAccept && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">{field.aiSuggestion}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => field.onAiSuggestionAccept?.(field.aiSuggestion || '')}
                className="text-xs mt-2"
              >
                Accept
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="h-8"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="h-8"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Autosave Status */}
            {enableAutosave && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {isAutosaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : autosaveStatus === 'saved' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Kaydedildi</span>
                  </>
                ) : (
                  <>
                    <span>Kaydedilmedi</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Draft Button */}
          {enableDraftMode && onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex items-center gap-2"
            >
              {draftExists && <CheckCircle className="w-4 h-4 text-green-500" />}
              Taslağı Kaydet
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Form İlerlemesi</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', animations.normal)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          <Keyboard className="w-3 h-3" />
          <span>Ctrl+Z geri al, Ctrl+Y ileri al, Ctrl+S kaydet</span>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-xs text-gray-500">
              {Object.keys(dirtyFields).length} alan değişti
            </div>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {submitLabel}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
