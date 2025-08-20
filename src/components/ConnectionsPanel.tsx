import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Check, X, UserPlus } from 'lucide-react';

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

interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  relationship_type: 'partner' | 'friend' | 'meta' | 'other';
  is_visible: boolean;
  notes: string | null;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

interface ConnectionsPanelProps {
  connections: UserConnection[];
  userProfile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ConnectionsPanel({ connections, userProfile, isOpen, onClose, onUpdate }: ConnectionsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionType, setConnectionType] = useState<'partner' | 'friend' | 'meta' | 'other'>('partner');

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      if (action === 'accept') {
        const { error } = await supabase
          .from('connections')
          .update({ status: 'accepted' })
          .eq('id', connectionId);
        
        if (error) throw error;
        
        toast({
          title: "Connection accepted",
          description: "You are now connected!",
        });
      } else {
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('id', connectionId);
        
        if (error) throw error;
        
        toast({
          title: "Connection rejected",
          description: "The connection request has been removed.",
        });
      }
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!userProfile || !searchTerm.trim()) return;

    setIsLoading(true);
    try {
      // First find the user by username
      const { data: targetProfile, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', searchTerm.trim())
        .single();

      if (searchError || !targetProfile) {
        toast({
          title: "User not found",
          description: "No user found with that username",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (targetProfile.user_id === userProfile.user_id) {
        toast({
          title: "Invalid request",
          description: "You cannot connect to yourself",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Check if connection already exists
      const existingConnection = connections.find(c => 
        (c.requester_id === userProfile.user_id && c.addressee_id === targetProfile.user_id) ||
        (c.requester_id === targetProfile.user_id && c.addressee_id === userProfile.user_id)
      );

      if (existingConnection) {
        toast({
          title: "Connection exists",
          description: "You already have a connection with this user",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: userProfile.user_id,
          addressee_id: targetProfile.user_id,
          relationship_type: connectionType,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection request sent",
        description: `Connection request sent to ${targetProfile.display_name || targetProfile.username}`,
      });

      setSearchTerm('');
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pendingConnections = connections.filter(c => 
    c.status === 'pending' && c.addressee_id === userProfile?.user_id
  );
  
  const activeConnections = connections.filter(c => c.status === 'accepted');
  const sentRequests = connections.filter(c => 
    c.status === 'pending' && c.requester_id === userProfile?.user_id
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Connections</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Add New Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Connect with Someone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Relationship Type</Label>
                <Select
                  value={connectionType}
                  onValueChange={(value: 'partner' | 'friend' | 'meta' | 'other') => 
                    setConnectionType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="meta">Metamour</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSendConnectionRequest}
                disabled={isLoading || !searchTerm.trim()}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </CardContent>
          </Card>

          {/* Pending Incoming Requests */}
          {pendingConnections.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Pending Requests</h3>
              <div className="space-y-2">
                {pendingConnections.map((connection) => {
                  const profile = connection.requester_profile;
                  if (!profile) return null;
                  
                  return (
                    <Card key={connection.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {(profile.display_name || profile.username)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {profile.display_name || profile.username}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {connection.relationship_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnectionAction(connection.id, 'accept')}
                              disabled={isLoading}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnectionAction(connection.id, 'reject')}
                              disabled={isLoading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Sent Requests</h3>
              <div className="space-y-2">
                {sentRequests.map((connection) => {
                  const profile = connection.addressee_profile;
                  if (!profile) return null;
                  
                  return (
                    <Card key={connection.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={profile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {(profile.display_name || profile.username)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {profile.display_name || profile.username}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Connections */}
          {activeConnections.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Your Network</h3>
              <div className="space-y-2">
                {activeConnections.map((connection) => {
                  const profile = connection.requester_id === userProfile?.user_id 
                    ? connection.addressee_profile 
                    : connection.requester_profile;
                  
                  if (!profile) return null;
                  
                  return (
                    <Card key={connection.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {(profile.display_name || profile.username)[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {profile.display_name || profile.username}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" className="text-xs">
                                {connection.relationship_type}
                              </Badge>
                              {profile.bio && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {profile.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}