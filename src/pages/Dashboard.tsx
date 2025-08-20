import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { NetworkVisualization } from '@/components/NetworkVisualization';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { ConnectionsPanel } from '@/components/ConnectionsPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Settings, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile as Profile);

      // Fetch connections with profiles
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          requester_profile:profiles!connections_requester_id_fkey(*),
          addressee_profile:profiles!connections_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (connectionsError) throw connectionsError;
      setConnections((connectionsData || []) as UserConnection[]);

      // Fetch visible profiles for network view
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('show_in_network', true);

      if (profilesError) throw profilesError;
      setProfiles((profilesData || []) as Profile[]);

    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">PolyamGraph</h1>
            <span className="text-sm text-muted-foreground">
              Welcome, {userProfile?.display_name || userProfile?.username}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConnectionsOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Connections
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <NetworkVisualization 
          userProfile={userProfile}
          connections={connections}
          profiles={profiles}
          onRefresh={fetchData}
        />
      </main>

      {/* Sidebars */}
      <ProfileSidebar
        profile={userProfile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onUpdate={fetchData}
      />
      
      <ConnectionsPanel
        connections={connections}
        userProfile={userProfile}
        isOpen={connectionsOpen}
        onClose={() => setConnectionsOpen(false)}
        onUpdate={fetchData}
      />
    </div>
  );
}