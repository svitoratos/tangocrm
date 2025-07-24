import React from 'react';
import { Clock, MessageSquare, Calendar, DollarSign, FileText, User, Target } from 'lucide-react';
import { LastActivity } from '@/hooks/use-last-activity';

interface LastActivityDisplayProps {
  lastActivity: LastActivity | null;
  loading: boolean;
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'note':
      return <MessageSquare className="h-3 w-3" />;
    case 'meeting_scheduled':
    case 'follow_up':
      return <Calendar className="h-3 w-3" />;
    case 'value_changed':
      return <DollarSign className="h-3 w-3" />;
    case 'stage_changed':
      return <Target className="h-3 w-3" />;
    case 'contact_added':
      return <User className="h-3 w-3" />;
    case 'file_uploaded':
      return <FileText className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'note':
      return 'text-blue-600 bg-blue-50';
    case 'meeting_scheduled':
    case 'follow_up':
      return 'text-purple-600 bg-purple-50';
    case 'value_changed':
      return 'text-emerald-600 bg-emerald-50';
    case 'stage_changed':
      return 'text-orange-600 bg-orange-50';
    case 'contact_added':
      return 'text-indigo-600 bg-indigo-50';
    case 'file_uploaded':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const formatActivityTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const LastActivityDisplay: React.FC<LastActivityDisplayProps> = ({
  lastActivity,
  loading,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
        <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
        <span>Loading activity...</span>
      </div>
    );
  }

  if (!lastActivity) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`p-1 rounded ${getActivityColor(lastActivity.type)}`}>
        {getActivityIcon(lastActivity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 truncate font-medium">
          {lastActivity.description}
        </p>
        <p className="text-gray-500">
          {formatActivityTime(lastActivity.created_at)}
        </p>
      </div>
    </div>
  );
}; 