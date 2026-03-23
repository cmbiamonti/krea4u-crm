// components/settings/TeamSettings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Crown, Shield, Eye, Mail, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function TeamSettings() {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      avatar: '',
      joinedAt: '2023-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      avatar: '',
      joinedAt: '2023-03-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'viewer',
      avatar: '',
      joinedAt: '2023-05-10',
    },
  ];

  const pendingInvites = [
    {
      id: 1,
      email: 'sarah@example.com',
      role: 'editor',
      sentAt: '2 days ago',
    },
  ];

  const roleIcons = {
    admin: Crown,
    editor: Shield,
    viewer: Eye,
  };

  const roleDescriptions = {
    admin: 'Full access to all features and settings',
    editor: 'Can create and edit content, but cannot manage team or billing',
    viewer: 'Read-only access to view content',
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    // Implement invite logic
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setIsInviting(false);
  };

  return (
    <div className="space-y-6">
      {/* Premium+ Badge */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Premium+ feature - Collaborate with up to 10 team members
                </p>
              </div>
            </div>
            <Badge variant="secondary">3/10 seats used</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>
            Send an invitation to collaborate on your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isInviting} onOpenChange={setIsInviting}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an email invitation to join your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleDescriptions).map(([role, description]) => {
                        const Icon = roleIcons[role as keyof typeof roleIcons];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-start gap-2">
                              <Icon className="h-4 w-4 mt-0.5" />
                              <div>
                                <p className="font-medium capitalize">{role}</p>
                                <p className="text-xs text-muted-foreground">{description}</p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviting(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => {
              const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">Joined {member.joinedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <RoleIcon className="h-3 w-3" />
                      <span className="capitalize">{member.role}</span>
                    </Badge>
                    {member.role !== 'admin' && (
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingInvites.map((invite) => {
                const RoleIcon = roleIcons[invite.role as keyof typeof roleIcons];
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">Sent {invite.sentAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        <span className="capitalize">{invite.role}</span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Resend
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(roleDescriptions).map(([role, description]) => {
              const Icon = roleIcons[role as keyof typeof roleIcons];
              const permissions = {
                admin: ['Manage team members', 'Manage billing', 'All editor permissions'],
                editor: ['Create and edit artists', 'Create and edit projects', 'Manage venues'],
                viewer: ['View all content', 'Export data', 'No editing permissions'],
              };

              return (
                <div key={role} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <h4 className="font-semibold capitalize">{role}</h4>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 ml-8">
                    {permissions[role as keyof typeof permissions].map((perm, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {perm}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
