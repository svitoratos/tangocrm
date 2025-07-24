'use client';

import { useState, useEffect } from 'react';
import { useNicheData } from '@/hooks/useNicheData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function TestNicheSystem() {
  const { currentNiche, createJournalEntry, getJournalEntries } = useNicheData();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    loadEntries();
  }, [currentNiche]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      console.log(`🔄 Loading entries for niche: ${currentNiche}`);
      const data = await getJournalEntries();
      console.log(`📊 Loaded ${data.length} entries for ${currentNiche}:`, data);
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      console.log(`💾 Creating entry for ${currentNiche}:`, formData);
      await createJournalEntry(formData);
      setFormData({ title: '', content: '' });
      loadEntries(); // Reload to see new entry
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Niche System Test
          </h1>
          <p className="text-gray-600 mb-4">
            Current Niche: <span className="font-semibold text-blue-600">{currentNiche}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button 
              onClick={() => window.location.href = '/test-niche-system?niche=creators'}
              variant={currentNiche === 'creators' ? 'default' : 'outline'}
            >
              Test Creators
            </Button>
            <Button 
              onClick={() => window.location.href = '/test-niche-system?niche=podcasters'}
              variant={currentNiche === 'podcasters' ? 'default' : 'outline'}
            >
              Test Podcasters
            </Button>
          </div>

          <Button onClick={loadEntries} disabled={isLoading} className="mb-4">
            {isLoading ? 'Loading...' : 'Refresh Entries'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Entry Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Entry title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Entry content..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Entry for {currentNiche}
              </Button>
            </form>
          </Card>

          {/* Entries List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentNiche} Entries ({entries.length})
            </h2>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No entries found for {currentNiche}
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {entry.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{entry.content}</p>
                    <div className="text-xs text-gray-500">
                      <div>ID: {entry.id}</div>
                      <div>Tags: {entry.tags?.join(', ') || 'none'}</div>
                      <div>Created: {new Date(entry.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                currentNiche,
                entriesCount: entries.length,
                entries: entries.map(e => ({
                  id: e.id,
                  title: e.title,
                  tags: e.tags
                }))
              }, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
} 