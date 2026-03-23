// components/settings/IntegrationSettings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Key, Calendar, Instagram, Webhook, Link } from 'lucide-react';
import { toast } from 'sonner';

export function IntegrationSettings() {
  const [apiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxx');
  const [copied, setCopied] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('API key copied to clipboard');
  };

  const regenerateApiKey = () => {
    // Implement API key regeneration
    toast.success('API key regenerated');
  };

  const connectGoogleCalendar = async () => {
    // Implement Google Calendar OAuth
    toast.success('Google Calendar connected');
    setGoogleCalendarConnected(true);
  };

  const connectInstagram = async () => {
    // Implement Instagram OAuth
    toast.success('Instagram connected');
    setInstagramConnected(true);
  };

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Use API keys to integrate with external applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Keep your API keys secret. Anyone with your key can access your data.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Your API Key</Label>
            <div className="flex gap-2">
              <Input value={apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={copyApiKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={regenerateApiKey}>
              Regenerate Key
            </Button>
            <Button variant="outline" asChild>
              <a href="/docs/api" target="_blank">
                <Link className="h-4 w-4 mr-2" />
                API Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Sync your projects and meetings with Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${googleCalendarConnected ? 'bg-green-500' : 'bg-muted'}`} />
              <div>
                <p className="font-medium">
                  {googleCalendarConnected ? 'Connected' : 'Not Connected'}
                </p>
                {googleCalendarConnected && (
                  <p className="text-sm text-muted-foreground">
                    your.email@gmail.com
                  </p>
                )}
              </div>
            </div>
            {googleCalendarConnected ? (
              <Button variant="outline" onClick={() => setGoogleCalendarConnected(false)}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={connectGoogleCalendar}>
                Connect
              </Button>
            )}
          </div>

          {googleCalendarConnected && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-meetings">Sync project meetings</Label>
                <Switch id="sync-meetings" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-deadlines">Sync task deadlines</Label>
                <Switch id="sync-deadlines" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-reminders">Create reminders</Label>
                <Switch id="sync-reminders" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Business
          </CardTitle>
          <CardDescription>
            Import artist profiles and portfolios from Instagram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${instagramConnected ? 'bg-green-500' : 'bg-muted'}`} />
              <div>
                <p className="font-medium">
                  {instagramConnected ? 'Connected' : 'Not Connected'}
                </p>
                {instagramConnected && (
                  <p className="text-sm text-muted-foreground">
                    @your_business_account
                  </p>
                )}
              </div>
            </div>
            {instagramConnected ? (
              <Button variant="outline" onClick={() => setInstagramConnected(false)}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={connectInstagram}>
                Connect
              </Button>
            )}
          </div>

          {instagramConnected && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-import">Auto-import new posts</Label>
                <Switch id="auto-import" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-profile">Sync profile updates</Label>
                <Switch id="sync-profile" defaultChecked />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe</CardTitle>
          <CardDescription>
            Connected for subscription and payment processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Connected</p>
                <p className="text-sm text-muted-foreground">
                  Payments enabled
                </p>
              </div>
            </div>
            <Badge>Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Receive real-time notifications for events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Configure webhooks to receive POST requests when specific events occur in your account.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">https://api.example.com/webhook</p>
                <p className="text-xs text-muted-foreground">
                  Events: artist.created, project.updated
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Add Webhook
          </Button>

          <Button variant="ghost" className="w-full" asChild>
            <a href="/docs/webhooks" target="_blank">
              View Webhook Documentation
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}