import React, { useState, useEffect } from 'react';
import { useNicheData } from '../../hooks/useNicheData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Lightbulb,
  Star,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../utils/cn';

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

export const NewCreatorJournal: React.FC = () => {
  const { 
    currentNiche, 
    createJournalEntry, 
    getJournalEntries, 
    updateJournalEntry, 
    deleteJournalEntry 
  } = useNicheData();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [currentNiche]); // Reload when niche changes

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔄 Loading journal entries for ${currentNiche}`);
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      setError('Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = () => {
    const newEntry = {
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
    if (!selectedEntry || !selectedEntry.title.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      
      console.log(`💾 Saving journal entry for ${currentNiche}:`, selectedEntry);
      
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Creator Journal</h1>
            <p className="text-slate-600">Your {currentNiche} workspace for reflection and growth</p>
          </div>
        </div>
        <Button
          onClick={handleCreateEntry}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-2">Your {currentNiche} Entries</h2>
            <p className="text-sm text-slate-600 mb-4">
              {entries.length} entry{entries.length !== 1 ? 'ies' : ''}
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEntries}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
            >
              Refresh
            </Button>
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
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Entries Yet</h3>
                <p className="text-slate-600 mb-4">Start your {currentNiche} journal journey</p>
                <Button
                  onClick={handleCreateEntry}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write Your First Entry
                </Button>
              </div>
            ) : (
              entries.map(entry => (
                <Card
                  key={entry.id}
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
                    {JOURNAL_PROMPTS.map((prompt, index) => (
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
              <div className="flex-1 p-6">
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
                    Start Your {currentNiche} Journal
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
    </div>
  );
}; 