import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Crown, User } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  privacy_mode: 'public' | 'friends' | 'private';
  show_in_network: boolean;
}

interface PersonNodeProps {
  data: {
    profile: Profile;
    isCurrentUser: boolean;
  };
}

export function PersonNode({ data }: PersonNodeProps) {
  const { profile, isCurrentUser } = data;
  const displayName = profile.display_name || profile.username;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div 
      className={`
        relative flex flex-col items-center p-3 rounded-lg border-2 bg-card text-card-foreground shadow-lg
        ${isCurrentUser 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card hover:bg-accent hover:text-accent-foreground'
        }
        transition-colors duration-200
        min-w-[120px]
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-primary border-2 border-primary-foreground"
      />
      
      <div className="relative">
        <Avatar className="w-12 h-12 mb-2">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {isCurrentUser && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="font-medium text-sm truncate max-w-[100px]">
          {displayName}
        </p>
        {profile.bio && (
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[100px]">
            {profile.bio}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 mt-2">
        <Badge 
          variant={profile.privacy_mode === 'public' ? 'default' : 'secondary'}
          className="text-xs px-1 py-0"
        >
          {profile.privacy_mode}
        </Badge>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-primary border-2 border-primary-foreground"
      />
    </div>
  );
}