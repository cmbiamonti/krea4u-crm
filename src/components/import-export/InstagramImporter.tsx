// components/import-export/InstagramImporter.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Instagram, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function InstagramImporter() {
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const fetchInstagramProfile = async () => {
    if (!handle.trim()) {
      toast.error('Please enter an Instagram handle');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call your API endpoint that interfaces with Instagram API
      const response = await fetch('/api/instagram/fetch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.replace('@', '') }),
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfileData(data);
      toast.success('Profile fetched successfully');
    } catch (error) {
      toast.error('Failed to fetch Instagram profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!profileData) return;

    try {
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profileData.name?.split(' ')[0] || '',
          last_name: profileData.name?.split(' ').slice(1).join(' ') || '',
          bio: profileData.biography || '',
          instagram: profileData.username,
          website: profileData.website || null,
          profile_image_url: profileData.profile_picture_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to import artist');

      toast.success('Artist imported successfully');
      setProfileData(null);
      setHandle('');
    } catch (error) {
      toast.error('Failed to import artist');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Instagram className="h-4 w-4" />
        <AlertDescription>
          Import artist data directly from their Instagram profile. Requires Instagram Business API access.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="instagram-handle">Instagram Handle</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="instagram-handle"
              placeholder="@username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInstagramProfile()}
            />
            <Button onClick={fetchInstagramProfile} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Fetch Profile'
              )}
            </Button>
          </div>
        </div>

        {profileData && (
          <Card className="p-6">
            <div className="flex gap-4">
              <img
                src={profileData.profile_picture_url}
                alt={profileData.name}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                <p className="mt-2 text-sm">{profileData.biography}</p>
                {profileData.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-1 inline-block"
                  >
                    {profileData.website}
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t text-center">
              <div>
                <div className="font-semibold">{profileData.followers_count?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="font-semibold">{profileData.following_count?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div>
                <div className="font-semibold">{profileData.media_count?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>

            <Button onClick={handleImport} className="w-full mt-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Import as Artist
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}