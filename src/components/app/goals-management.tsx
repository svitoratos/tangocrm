"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, Target, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNiche } from '@/contexts/NicheContext';

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  deadline?: string;
  status: string;
  category: string;
  niche: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const GOAL_CATEGORIES = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'clients', label: 'Clients' },
  { value: 'content', label: 'Content' },
  { value: 'personal', label: 'Personal' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'learning', label: 'Learning' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' }
];

const GOAL_STATUSES = [
  { value: 'active', label: 'Active', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle }
];

export default function GoalsManagement() {
  const { currentNiche } = useNiche();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '',
    deadline: '',
    status: 'active',
    category: '',
          niche: currentNiche || 'creator',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (currentNiche) {
      setFormData(prev => ({ ...prev, niche: currentNiche }));
    }
  }, [currentNiche]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/goals?niche=${currentNiche}`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      } else {
        toast.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category || !formData.niche) {
      toast.error('Title, category, and niche are required');
      return;
    }

    try {
      const url = editingGoal 
        ? `/api/goals/${editingGoal.id}?niche=${currentNiche}`
        : '/api/goals';
      
      const method = editingGoal ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : 0
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          niche: currentNiche
        }),
      });

      if (response.ok) {
        toast.success(editingGoal ? 'Goal updated successfully' : 'Goal created successfully');
        setIsDialogOpen(false);
        resetForm();
        fetchGoals();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save goal');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${id}?niche=${currentNiche}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Goal deleted successfully');
        fetchGoals();
      } else {
        toast.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value?.toString() || '',
      current_value: goal.current_value?.toString() || '',
      unit: goal.unit || '',
      deadline: goal.deadline || '',
      status: goal.status,
      category: goal.category,
      niche: goal.niche,
      tags: goal.tags || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '',
      deadline: '',
      status: 'active',
      category: '',
      niche: currentNiche || 'creator',
      tags: []
    });
    setEditingGoal(null);
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
      day: 'numeric'
    });
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    if (!goal.current_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getStatusIcon = (status: string) => {
    const statusOption = GOAL_STATUSES.find(option => option.value === status);
    return statusOption ? statusOption.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const filteredGoals = goals.filter(goal => 
    statusFilter === 'all' || goal.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground">
            Set and track your personal and professional goals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </DialogTitle>
              <DialogDescription>
                Set a new goal and track your progress towards achieving it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Goal title..."
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            <status.icon className="h-4 w-4" />
                            {status.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Current Value</label>
                  <Input
                    type="number"
                    value={formData.current_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="USD, clients, etc."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
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
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filter by status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            {GOAL_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <span className="flex items-center gap-2">
                  <status.icon className="h-4 w-4" />
                  {status.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start setting goals to track your progress and achievements.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const StatusIcon = getStatusIcon(goal.status);
            
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <Badge className={getStatusColor(goal.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {goal.status}
                        </Badge>
                      </div>
                      {goal.description && (
                        <CardDescription className="mb-2">
                          {goal.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(goal.created_at)}
                        </div>
                        {goal.deadline && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Due: {formatDate(goal.deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {goal.target_value && goal.current_value !== undefined && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {goal.current_value} {goal.unit}
                        </span>
                        <span>
                          {goal.target_value} {goal.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  {goal.tags && goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {goal.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
