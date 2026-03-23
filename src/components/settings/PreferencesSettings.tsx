// components/settings/PreferencesSettings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Globe, Moon, Sun, Monitor, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';

export function PreferencesSettings() {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Rome');
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
  const [currency, setCurrency] = useState('EUR');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [compactMode, setCompactMode] = useState(false);
  const [storageUsed] = useState(2.3); // GB
  const [storageLimit] = useState(50); // GB

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>
            Configure your general application preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Rome">Europe/Rome (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los Angeles (GMT-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <RadioGroup value={theme} onValueChange={(value: any) => setTheme(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 font-normal cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 font-normal cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-2 font-normal cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  System (auto)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and padding for a more compact interface
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={(checked: boolean) => setCompactMode(checked)}
            />
          </div>

          <div className="space-y-3">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              {[
                { name: 'Blue', color: 'bg-blue-500' },
                { name: 'Green', color: 'bg-green-500' },
                { name: 'Purple', color: 'bg-purple-500' },
                { name: 'Orange', color: 'bg-orange-500' },
                { name: 'Red', color: 'bg-red-500' },
              ].map((color) => (
                <button
                  key={color.name}
                  className={`w-8 h-8 rounded-full ${color.color} hover:scale-110 transition-transform`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Storage
          </CardTitle>
          <CardDescription>
            Manage your data and storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Storage Used</span>
              <span className="font-medium">
                {storageUsed} GB / {storageLimit} GB
              </span>
            </div>
            <Progress value={(storageUsed / storageLimit) * 100} />
            <p className="text-xs text-muted-foreground">
              {storageLimit - storageUsed} GB available
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Database className="h-4 w-4 mr-2" />
              Upgrade Storage
            </Button>
            <Button variant="outline" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Export All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Download a complete copy of your data
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
