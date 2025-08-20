import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

interface ProfileSidebarProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProfileSidebar({ profile, isOpen, onClose, onUpdate }: ProfileSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    privacy_mode: profile?.privacy_mode || 'friends',
    show_in_network: profile?.show_in_network ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          privacy_mode: formData.privacy_mode,
          show_in_network: formData.show_in_network,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
        </SheetHeader>
        
        {profile && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="How you want to be displayed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy_mode">Privacy Mode</Label>
              <Select
                value={formData.privacy_mode}
                onValueChange={(value: 'public' | 'friends' | 'private') => 
                  setFormData(prev => ({ ...prev, privacy_mode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public - Anyone can see your profile
                  </SelectItem>
                  <SelectItem value="friends">
                    Friends - Only connected people can see your profile
                  </SelectItem>
                  <SelectItem value="private">
                    Private - Only you can see your full profile
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_in_network">Show in Network</Label>
                <p className="text-xs text-muted-foreground">
                  Display your node in the network visualization
                </p>
              </div>
              <Switch
                id="show_in_network"
                checked={formData.show_in_network}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, show_in_network: checked }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}