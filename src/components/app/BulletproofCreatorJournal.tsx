"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Sparkles,
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
import type { JournalEntry, GoalEntry } from '@/services/nicheDataService';

// Journal prompts for inspiration
const journalPrompts = [
  "What's the most exciting thing you're working on right now?",
  "What challenge did you overcome today?",
  "What's one thing you want to improve about your workflow?",
  "What inspired you today?",
  "What's your biggest goal for this week?",
  "What's one thing you're grateful for in your business?",
  "What's a lesson you learned recently?",
  "What's your vision for the next 3 months?"
];

export const BulletproofCreatorJournal: React.FC = () => {
  const { 
    currentNiche, 
    createJournalEntry, 
    getJournalEntries, 
    updateJournalEntry, 
    deleteJournalEntry,
    createGoalEntry,
    getGoalEntries,
    updateGoalEntry,
    deleteGoalEntry
  } = useNicheData();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [currentView, setCurrentView] = useState<'journal' | 'goals'>('journal');
  const [goalsViewMode, setGoalsViewMode] = useState<'grid' | 'list'>('grid');

  // Load entries and goals when niche changes
  useEffect(() => {
    loadEntries();
    loadGoals();
  }, [currentNiche]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      setIsLoadingGoals(true);
      setError(null);
      const data = await getGoalEntries();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
      setError('Failed to load goals');
    } finally {
      setIsLoadingGoals(false);
    }
  };

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
    const newEntry: Partial<JournalEntry> = {
      title: '',
      content: '',
      mood: 'reflective',
      niche: currentNiche
    };
    setSelectedEntry(newEntry as JournalEntry);
    setIsCreating(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedEntry || !selectedEntry.title.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      
      if (isCreating) {
        const savedEntry = await createJournalEntry({
          title: selectedEntry.title,
          content: selectedEntry.content,
          mood: selectedEntry.mood
        });
        setEntries(prev => [savedEntry, ...prev]);
      } else {
        const updatedEntry = await updateJournalEntry(selectedEntry.id, {
          title: selectedEntry.title,
          content: selectedEntry.content,
          mood: selectedEntry.mood
        });
        setEntries(prev => prev.map(entry => 
          entry.id === selectedEntry.id ? updatedEntry : entry
        ));
      }
      
      setIsCreating(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteJournalEntry(entryId);
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete journal entry');
    }
  };

  const toggleFavorite = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      const updatedEntry = await updateJournalEntry(entryId, {
        is_favorite: !entry.is_favorite
      });
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update journal entry');
    }
  };

  const handleCreateGoal = () => {
    const newGoal: Partial<GoalEntry> = {
      title: '',
      description: '',
      status: 'not-started',
      category: 'personal',
      current_value: 0,
      niche: currentNiche
    };
    setSelectedGoal(newGoal as GoalEntry);
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!selectedGoal || !selectedGoal.title.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      
      if (!selectedGoal.id || selectedGoal.id?.startsWith('temp-')) {
        const savedGoal = await createGoalEntry({
          title: selectedGoal.title,
          description: selectedGoal.description,
          status: selectedGoal.status,
          category: selectedGoal.category,
          target_value: selectedGoal.target_value,
          current_value: selectedGoal.current_value,
          unit: selectedGoal.unit,
          deadline: selectedGoal.deadline
        });
        setGoals(prev => [savedGoal, ...prev]);
      } else {
        const updatedGoal = await updateGoalEntry(selectedGoal.id, {
          title: selectedGoal.title,
          description: selectedGoal.description,
          status: selectedGoal.status,
          category: selectedGoal.category,
          target_value: selectedGoal.target_value,
          current_value: selectedGoal.current_value,
          unit: selectedGoal.unit,
          deadline: selectedGoal.deadline
        });
        setGoals(prev => prev.map(goal => 
          goal.id === selectedGoal.id ? updatedGoal : goal
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
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoalEntry(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
        setShowGoalModal(false);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const toggleGoalStatus = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newStatus = goal.status === 'completed' ? 'in-progress' : 'completed';

    try {
      const updatedGoal = await updateGoalEntry(goalId, { status: newStatus });
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? updatedGoal : goal
      ));
    } catch (error) {
      console.error('Error updating goal status:', error);
      setError('Failed to update goal status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-white/40 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              {currentView === 'journal' ? 'Journal/Goals' : 'Goals & Objectives'}
            </h1>
            <p className="text-slate-600">Your workspace for reflection and growth</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/30 backdrop-blur-md rounded-lg p-1 border border-slate-300/70">
            <Button
              variant={currentView === 'journal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('journal')}
              className={`rounded-md ${
                currentView === 'journal'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Journal
            </Button>
            <Button
              variant={currentView === 'goals' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('goals')}
              className={`rounded-md ${
                currentView === 'goals'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : ''
              }`}
            >
              <Target className="w-4 h-4 mr-2" />
              Goals
            </Button>
          </div>

          {/* Create Button */}
          <Button
            onClick={currentView === 'journal' ? handleCreateEntry : handleCreateGoal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {currentView === 'journal' ? 'New Entry' : 'New Goal'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {currentView === 'journal' ? (
          /* Journal View */
          <>
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-200/50 bg-white/40 backdrop-blur-md flex flex-col">
              <div className="p-4 border-b border-slate-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white/30 backdrop-blur-md border-slate-300/70 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Your {currentNiche} Entries
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadEntries}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredEntries.length} entry{filteredEntries.length !== 1 ? 'ies' : ''}
                </p>
              </div>

              {/* Entries List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Entries Yet</h3>
                    <p className="text-slate-600 mb-4">Start your {currentNiche} journal journey</p>
                    <Button
                      onClick={handleCreateEntry}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write Your First Entry
                    </Button>
                  </div>
                ) : (
                  filteredEntries.map(entry => (
                    <Card
                      key={entry.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white/60 backdrop-blur-sm border-slate-200/50",
                        selectedEntry?.id === entry.id 
                          ? "ring-2 ring-blue-500 bg-blue-50/80 shadow-lg" 
                          : "hover:bg-white/80"
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
                      
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {entry.content}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {selectedEntry ? (
                <div className="flex-1 flex flex-col">
                  {/* Entry Header */}
                  <div className="p-6 border-b border-slate-200/50 bg-white/40 backdrop-blur-md">
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
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isSaving ? 'Saving...' : 'Save Entry'}
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
                        {journalPrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left justify-start h-auto p-3 text-blue-700 border-blue-200 hover:bg-blue-100 whitespace-normal break-words"
                            onClick={() => {
                              setSelectedEntry({
                                ...selectedEntry,
                                content: selectedEntry.content + '\n\n' + prompt
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
                  <div className="flex-1 p-6 bg-white/20 backdrop-blur-sm">
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
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Start Your {currentNiche} Journal
                      </h3>
                      <p className="text-slate-600 max-w-md">
                        Your journal is a safe space for reflection and inspiration.
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateEntry}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write Your First Entry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Goals View */
          <div className="flex-1 p-6 bg-white/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your {currentNiche} Goals</h2>
                  <p className="text-slate-600">Track your progress and achievements</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGoalsViewMode(goalsViewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {goalsViewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadGoals}
                    disabled={isLoadingGoals}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isLoadingGoals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </Card>
                  ))}
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Goals Yet</h3>
                  <p className="text-slate-600 mb-4">Start setting goals for your {currentNiche} journey</p>
                  <Button
                    onClick={handleCreateGoal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  "gap-6",
                  goalsViewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "space-y-4"
                )}>
                  {goals.map((goal) => (
                    <Card key={goal.id} className="p-6 hover:shadow-lg transition-all duration-300 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:bg-white/80">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-2">{goal.title}</h3>
                          <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedGoal(goal);
                              setShowGoalModal(true);
                            }}>
                              Edit goal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleGoalStatus(goal.id)}>
                              {goal.status === 'completed' ? 'Mark as in progress' : 'Mark as completed'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)}>
                              Delete goal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-sm text-slate-500">{goal.category}</span>
                        </div>

                        {goal.target_value && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {goal.deadline && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>Due: {formatDate(goal.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-slate-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedGoal?.id?.startsWith('temp-') ? 'Create Goal' : 'Edit Goal'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGoalModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={selectedGoal?.title || ''}
                    onChange={(e) => setSelectedGoal(prev => prev ? {...prev, title: e.target.value} : null)}
                    placeholder="Goal title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={selectedGoal?.description || ''}
                    onChange={(e) => setSelectedGoal(prev => prev ? {...prev, description: e.target.value} : null)}
                    placeholder="Goal description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      value={selectedGoal?.status || 'not-started'}
                      onValueChange={(value) => setSelectedGoal(prev => prev ? {...prev, status: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select
                      value={selectedGoal?.category || 'personal'}
                      onValueChange={(value) => setSelectedGoal(prev => prev ? {...prev, category: value} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Value</label>
                    <Input
                      type="number"
                      value={selectedGoal?.current_value || 0}
                      onChange={(e) => setSelectedGoal(prev => prev ? {...prev, current_value: parseInt(e.target.value) || 0} : null)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Value</label>
                    <Input
                      type="number"
                      value={selectedGoal?.target_value || ''}
                      onChange={(e) => setSelectedGoal(prev => prev ? {...prev, target_value: parseInt(e.target.value) || undefined} : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <Input
                      value={selectedGoal?.unit || ''}
                      onChange={(e) => setSelectedGoal(prev => prev ? {...prev, unit: e.target.value} : null)}
                      placeholder="e.g., dollars, hours..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <Input
                      type="date"
                      value={selectedGoal?.deadline || ''}
                      onChange={(e) => setSelectedGoal(prev => prev ? {...prev, deadline: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGoal}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSaving ? 'Saving...' : 'Save Goal'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 