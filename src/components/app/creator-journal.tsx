"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  BookOpen, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit3,
  Trash2,
  Heart,
  Star,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  Clock,
  X,
  RefreshCw,
  Grid3X3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNicheData } from '@/hooks/useNicheData';
import { useNiche } from '@/contexts/NicheContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'happy' | 'productive' | 'challenged' | 'inspired' | 'reflective';
  is_favorite?: boolean;
  prompt?: string;
  niche?: string;
  created_at: string;
  updated_at: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  target_date?: string;
  status: string;
  category: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  niche?: string;
  progress?: number;
  priority?: string;
  created_at: string;
  updated_at: string;
}

interface CreatorJournalProps {
  // No props needed - uses niche context
}



const JOURNAL_PROMPTS = [
  "What's the most exciting thing you're working on right now?",
  "Describe a challenge you faced today and how you overcame it.",
  "What's one thing you learned this week that you want to remember?",
  "Reflect on a recent success and what made it possible.",
  "What's a goal you're working towards and how is it going?",
  "Share something that inspired you recently.",
  "What's one thing you'd like to improve about your creative process?",
  "Describe a moment today that made you feel proud."
];

export const CreatorJournal: React.FC<CreatorJournalProps> = () => {
  const { currentNiche, createJournalEntry, getJournalEntries, updateJournalEntry, deleteJournalEntry, createGoalEntry, getGoalEntries, updateGoalEntry, deleteGoalEntry } = useNicheData();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPrompts, setShowPrompts] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [currentView, setCurrentView] = useState<'journal' | 'goals'>('journal');
  const [goalsViewMode, setGoalsViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch journal entries from database
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/journal-entries?niche=${currentNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      
      const data = await response.json();
      
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setError('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch goals from database
  const fetchGoals = async () => {
    try {
      setIsLoadingGoals(true);
      setError(null);
      
      const response = await fetch(`/api/goals?niche=${currentNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      
      const data = await response.json();
      
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals');
    } finally {
      setIsLoadingGoals(false);
    }
  };

  // Load entries and goals on component mount and when niche changes
  useEffect(() => {
    fetchEntries();
    fetchGoals();
  }, [currentNiche]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'happy': return <Heart className="w-4 h-4 text-red-500" />;
      case 'productive': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'inspired': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'reflective': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreateEntry = () => {
    const newEntry: JournalEntry = {
      id: 'temp-' + Date.now(),
      title: '',
      content: '',
      mood: 'reflective',
      niche: currentNiche,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedEntry(newEntry);
    setIsCreating(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedEntry) return;

    try {
      setIsSaving(true);
      setError(null);

      const entryData = {
        title: selectedEntry.title,
        content: selectedEntry.content,
        mood: selectedEntry.mood,
        isFavorite: selectedEntry.is_favorite,
        prompt: selectedEntry.prompt,
        niche: currentNiche
      };

      let response;
      if (isCreating) {
        // Create new entry
        response = await fetch('/api/journal-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        });
      } else {
        // Update existing entry
        response = await fetch(`/api/journal-entries/${selectedEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      const data = await response.json();
      
      if (isCreating) {
        setEntries(prev => [data, ...prev]);
      } else {
        setEntries(prev => prev.map(entry => 
          entry.id === selectedEntry.id ? data : entry
        ));
      }

      setIsCreating(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setError('Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setError('Failed to delete journal entry');
    }
  };

  const toggleFavorite = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      const updatedEntry = { ...entry, is_favorite: !entry.is_favorite };
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedEntry.title,
          content: updatedEntry.content,
          mood: updatedEntry.mood,
          isFavorite: updatedEntry.is_favorite,
          prompt: updatedEntry.prompt,
          niche: currentNiche
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }

      const data = await response.json();
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? data : entry
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update journal entry');
    }
  };



  // Goal management functions (keeping local state for now)
  const handleCreateGoal = () => {
    const newGoal: Goal = {
      id: 'new',
      title: '',
      description: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      category: 'personal',
      target_value: 0,
      current_value: 0,
      unit: 'units',
      niche: currentNiche,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedGoal(newGoal);
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (selectedGoal) {
      if (selectedGoal.title.trim() === '') return;
      
      try {
        setIsSaving(true);
        setError(null);

        const goalData = {
          title: selectedGoal.title,
          description: selectedGoal.description,
          deadline: selectedGoal.deadline, // Use deadline directly
          status: selectedGoal.status,
          category: selectedGoal.category,
          target_value: selectedGoal.target_value || 0, // Use target_value directly
          current_value: 0, // Default current value
          unit: 'units', // Default unit
          niche: currentNiche
        };

        let response;
        if (selectedGoal.id === 'new') {
          // Create new goal
          response = await fetch(`/api/goals?niche=${currentNiche}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
          });
        } else {
          // Update existing goal
          response = await fetch(`/api/goals/${selectedGoal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
          });
        }

        if (!response.ok) {
          throw new Error('Failed to save goal');
        }

        const data = await response.json();
        
        if (selectedGoal.id === 'new') {
          // Add new goal to the beginning of the list
          setGoals(prev => [data, ...prev]);
        } else {
          // Update existing goal
          setGoals(prev => prev.map(goal => 
            goal.id === selectedGoal.id ? data : goal
          ));
        }
        
        setShowGoalModal(false);
        setSelectedGoal(null);
      } catch (error) {
        console.error('Error saving goal:', error);
        setError('Failed to save goal');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const toggleGoalStatus = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const updatedGoal = { ...goal, status: goal.status === 'completed' ? 'in-progress' : 'completed' };
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedGoal.title,
          description: updatedGoal.description,
          deadline: updatedGoal.deadline, // Use deadline directly
          status: updatedGoal.status,
          category: updatedGoal.category,
          target_value: updatedGoal.target_value || 0, // Use target_value directly
          current_value: updatedGoal.current_value || 0,
          unit: updatedGoal.unit || 'units',
          niche: currentNiche,

        })
      });

      if (!response.ok) {
        throw new Error('Failed to update goal status');
      }

      const data = await response.json();
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? data : goal
      ));
    } catch (error) {
      console.error('Error toggling goal status:', error);
      setError('Failed to update goal status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Creator Journal
            </h1>
            <p className="text-slate-600">
              Document your journey, celebrate wins, and track growth
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Selector */}
          <Select value={currentView} onValueChange={(value: 'journal' | 'goals') => setCurrentView(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="journal">Journal</SelectItem>
              <SelectItem value="goals">Goals</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Conditional Action Button */}
          {currentView === 'journal' ? (
            <Button 
              onClick={handleCreateEntry}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          ) : (
            <Button 
              onClick={handleCreateGoal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          )}
        </div>
      </div>

      {currentView === 'journal' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Entry List */}
          <div className="w-80 border-r border-slate-200 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200"
              />
            </div>
            


            {/* Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchEntries}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Entries List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-white rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">{error}</p>
                <Button onClick={fetchEntries} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {filteredEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedEntry?.id === entry.id 
                          ? "ring-2 ring-purple-500 bg-purple-50" 
                          : "hover:bg-slate-50"
                      )}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsCreating(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMoodIcon(entry.mood)}
                          <span className="text-xs text-slate-500">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {entry.is_favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => toggleFavorite(entry.id)}>
                                {entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)}>
                                Delete entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">
                        {entry.title}
                      </h3>
                      
                      <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                        {entry.content}
                      </p>
                      

                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {selectedEntry ? (
            <div className="flex-1 flex flex-col">
              {/* Entry Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      {formatDate(selectedEntry.created_at)}
                    </span>
                    {selectedEntry.mood && getMoodIcon(selectedEntry.mood)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPrompts(!showPrompts)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Prompts
                    </Button>
                    <Button
                      onClick={handleSaveEntry}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Entry'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Title Input */}
                <Input
                  placeholder="Entry title..."
                  value={selectedEntry.title}
                  onChange={(e) => setSelectedEntry({
                    ...selectedEntry,
                    title: e.target.value
                  })}
                  className="text-xl font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
                />


              </div>

              {/* Prompts Panel */}
              {showPrompts && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-3">Writing Prompts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {JOURNAL_PROMPTS.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto p-3 text-blue-700 border-blue-200 hover:bg-blue-100 whitespace-normal break-words"
                        onClick={() => {
                          setSelectedEntry({
                            ...selectedEntry,
                            prompt: prompt
                          });
                          setShowPrompts(false);
                        }}
                      >
                        <span className="text-sm leading-relaxed">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Editor */}
              <div className="flex-1 p-6">
                {selectedEntry.prompt && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 italic">
                      "{selectedEntry.prompt}"
                    </p>
                  </div>
                )}
                
                <Textarea
                  placeholder="Start writing your thoughts..."
                  value={selectedEntry.content}
                  onChange={(e) => setSelectedEntry({
                    ...selectedEntry,
                    content: e.target.value
                  })}
                  className="flex-1 min-h-[400px] border-none bg-transparent resize-none text-slate-700 focus-visible:ring-0 text-lg leading-relaxed"
                />
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Start Your Journal
                  </h3>
                  <p className="text-slate-600 max-w-md">
                    Your journal is a safe space for reflection and inspiration.
                  </p>
                </div>
                <Button
                  onClick={handleCreateEntry}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write Your First Entry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* Goals View */
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Goals & Aspirations</h2>
              <p className="text-slate-600">Track your progress and celebrate achievements</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={goalsViewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGoalsViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={goalsViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setGoalsViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchGoals}
                disabled={isLoadingGoals}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingGoals ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {goalsViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingGoals ? (
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 bg-white rounded-lg animate-pulse border">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : goals.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">Start setting goals to track your progress and celebrate your achievements</p>
                  <Button
                    onClick={handleCreateGoal}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </div>
              ) : (
                          goals.map(goal => (
              <Card key={goal.id} className="p-5 hover:shadow-md transition-shadow min-h-[280px] flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 mb-2 line-clamp-2 text-base">
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        setSelectedGoal(goal);
                        setShowGoalModal(true);
                      }}>
                        Edit goal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)}>
                        Delete goal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Goal Achieved Indicator */}
                {goal.status === 'completed' && (
                  <div className="mb-4 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-700">
                      Goal Achieved!
                    </span>
                  </div>
                )}

                {/* Progress Bar with Stages */}
                <div className="relative mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    {/* Stage segments based on progress percentage */}
                    <div className="flex h-full">
                      {/* 0% - Not Started */}
                      <div className={`w-[14.28%] ${goal.progress === 0 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                      {/* 10% - Planning */}
                      <div className={`w-[14.28%] ${goal.progress === 10 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                      {/* 25% - Getting Started */}
                      <div className={`w-[14.28%] ${goal.progress === 25 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                      {/* 50% - Halfway There */}
                      <div className={`w-[14.28%] ${goal.progress === 50 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                      {/* 75% - Almost Done */}
                      <div className={`w-[14.28%] ${goal.progress === 75 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>
                      {/* 90% - Nearly Complete */}
                      <div className={`w-[14.28%] ${goal.progress === 90 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                      {/* 100% - Completed */}
                      <div className={`w-[14.28%] ${goal.progress === 100 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                  
                  {/* Stage labels */}
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>10%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>90%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Goal Details - Push to bottom */}
                <div className="mt-auto">
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                      <span className={`font-medium text-xs ${getPriorityColor(goal.priority || 'medium')}`}>
                        {goal.priority || 'medium'} priority
                      </span>
                      <span className="text-gray-600 text-xs">
                        {goal.progress || 0}% complete
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGoalStatus(goal.id)}
                    className="w-full text-xs"
                  >
                    {goal.status === 'completed' ? 'Mark In Progress' : 'Mark Complete'}
                  </Button>
                </div>
              </Card>
            ))
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {isLoadingGoals ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 bg-white rounded-lg animate-pulse border">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">Start setting goals to track your progress and celebrate your achievements</p>
                <Button
                  onClick={handleCreateGoal}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Goal
                </Button>
              </div>
            ) : (
              goals.map(goal => (
                <Card key={goal.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-slate-900 text-lg">
                          {goal.title}
                        </h4>
                        {goal.status === 'completed' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                              Achieved
                            </span>
                          </div>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-slate-600 mb-4">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedGoal(goal);
                          setShowGoalModal(true);
                        }}>
                          Edit goal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)}>
                          Delete goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress Bar with Stages */}
                  <div className="relative mb-4">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      {/* Stage segments based on progress percentage */}
                      <div className="flex h-full">
                        {/* 0% - Not Started */}
                        <div className={`w-[14.28%] ${goal.progress === 0 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                        {/* 10% - Planning */}
                        <div className={`w-[14.28%] ${goal.progress === 10 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        {/* 25% - Getting Started */}
                        <div className={`w-[14.28%] ${goal.progress === 25 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        {/* 50% - Halfway There */}
                        <div className={`w-[14.28%] ${goal.progress === 50 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                        {/* 75% - Almost Done */}
                        <div className={`w-[14.28%] ${goal.progress === 75 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>
                        {/* 90% - Nearly Complete */}
                        <div className={`w-[14.28%] ${goal.progress === 90 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                        {/* 100% - Completed */}
                        <div className={`w-[14.28%] ${goal.progress === 100 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                    
                    {/* Stage labels */}
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>0%</span>
                      <span>10%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>90%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                      <span className={`font-medium text-sm ${getPriorityColor(goal.priority || 'medium')}`}>
                        {goal.priority || 'medium'} priority
                      </span>
                      <span className="text-gray-600 text-sm">
                        {goal.progress || 0}% complete
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoalStatus(goal.id)}
                      className="text-sm"
                    >
                      {goal.status === 'completed' ? 'Mark In Progress' : 'Mark Complete'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedGoal?.id ? 'Edit Goal' : 'Add New Goal'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Goal Title
                </label>
                <Input
                  placeholder="What do you want to achieve?"
                  value={selectedGoal?.title || ''}
                  onChange={(e) => setSelectedGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your goal in detail..."
                  value={selectedGoal?.description || ''}
                  onChange={(e) => setSelectedGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Date
                  </label>
                  <Input
                    type="date"
                    value={selectedGoal?.target_date || ''}
                    onChange={(e) => setSelectedGoal(prev => prev ? { ...prev, target_date: e.target.value } : null)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedGoal?.priority || 'medium'}
                    onChange={(e) => setSelectedGoal(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Progress (%)
                </label>
                <select
                  value={selectedGoal?.progress?.toString() || '0'}
                  onChange={(e) => setSelectedGoal(prev => prev ? { ...prev, progress: parseInt(e.target.value) } : null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="0">0% - Not Started</option>
                  <option value="10">10% - Planning</option>
                  <option value="25">25% - Getting Started</option>
                  <option value="50">50% - Halfway There</option>
                  <option value="75">75% - Almost Done</option>
                  <option value="90">90% - Nearly Complete</option>
                  <option value="100">100% - Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGoalModal(false);
                  setSelectedGoal(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveGoal}>
                Save Goal
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}; 