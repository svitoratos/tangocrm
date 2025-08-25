"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, Tag, Heart, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useNiche } from '@/contexts/NicheContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const MOOD_OPTIONS = [
  { value: 'excited', label: 'Excited', emoji: '😊' },
  { value: 'happy', label: 'Happy', emoji: '😄' },
  { value: 'content', label: 'Content', emoji: '😌' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😠' }
];

export default function JournalEntries() {
  const { currentNiche } = useNiche();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/journal-entries?niche=${currentNiche}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      } else {
        toast.error('Failed to fetch journal entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const url = editingEntry 
        ? `/api/journal-entries/${editingEntry.id}?niche=${currentNiche}`
        : '/api/journal-entries';
      
      const method = editingEntry ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          niche: currentNiche
        }),
      });

      if (response.ok) {
        toast.success(editingEntry ? 'Entry updated successfully' : 'Entry created successfully');
        setIsDialogOpen(false);
        resetForm();
        fetchEntries();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/journal-entries/${id}?niche=${currentNiche}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Entry deleted successfully');
        fetchEntries();
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      tags: entry.tags || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: '',
      tags: []
    });
    setEditingEntry(null);
    setNewTag('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption?.emoji || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading journal entries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journal Entries</h2>
          <p className="text-muted-foreground">
            Capture your thoughts, ideas, and daily reflections
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
              </DialogTitle>
              <DialogDescription>
                Write about your day, thoughts, or anything on your mind.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Entry title..."
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your thoughts here..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mood</label>
                <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        <span className="flex items-center gap-2">
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start writing your first journal entry to track your thoughts and progress.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.created_at)}
                      </div>
                      {entry.mood && (
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{getMoodEmoji(entry.mood)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
