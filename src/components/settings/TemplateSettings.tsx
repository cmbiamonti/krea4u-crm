// components/settings/TemplateSettings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Mail, FolderKanban, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function TemplateSettings() {
  const [projectTemplates] = useState([
    { id: 1, name: 'Art Exhibition', type: 'Exhibition', tasks: 12 },
    { id: 2, name: 'Artist Residency', type: 'Residency', tasks: 8 },
    { id: 3, name: 'Gallery Opening', type: 'Exhibition', tasks: 15 },
  ]);

  const [messageTemplates] = useState([
    { id: 1, name: 'Initial Contact', subject: 'Collaboration Opportunity', category: 'Outreach' },
    { id: 2, name: 'Follow-up', subject: 'Following up on our conversation', category: 'Follow-up' },
    { id: 3, name: 'Exhibition Invitation', subject: 'You\'re invited to exhibit', category: 'Invitation' },
  ]);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingMessage, setIsCreatingMessage] = useState(false);

  return (
    <div className="space-y-6">
      {/* Project Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Project Templates
              </CardTitle>
              <CardDescription>
                Create reusable project templates with predefined tasks
              </CardDescription>
            </div>
            <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Project Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable template for your projects
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" placeholder="e.g., Art Exhibition" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-type">Project Type</Label>
                    <Select>
                      <SelectTrigger id="project-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="residency">Residency</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tasks</Label>
                    <div className="space-y-2">
                      <Input placeholder="Task 1" />
                      <Input placeholder="Task 2" />
                      <Input placeholder="Task 3" />
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Template description..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Template created');
                    setIsCreatingProject(false);
                  }}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projectTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.type} • {template.tasks} tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Message Templates
              </CardTitle>
              <CardDescription>
                Save frequently used messages for quick access
              </CardDescription>
            </div>
            <Dialog open={isCreatingMessage} onOpenChange={setIsCreatingMessage}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Message Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable message template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="msg-name">Template Name</Label>
                    <Input id="msg-name" placeholder="e.g., Initial Contact" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="invitation">Invitation</SelectItem>
                        <SelectItem value="thank-you">Thank You</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Email subject..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Message Body</Label>
                    <Textarea
                      id="body"
                      placeholder="Use variables like {{artist_name}}, {{project_name}}, etc."
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{'}{'artist_name'}{'}'}, {'{'}{'project_name'}{'}'}, {'{'}{'venue_name'}{'}'}, {'{'}{'date'}{'}'}, {'{'}{'your_name'}{'}'}, {'{'}{'your_company'}{'}'}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingMessage(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Template created');
                    setIsCreatingMessage(false);
                  }}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messageTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">Category: {template.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Templates
              </CardTitle>
              <CardDescription>
                Upload custom document templates (contracts, agreements, etc.)
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Artist Agreement Template.docx</p>
                  <p className="text-sm text-muted-foreground">Uploaded 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Commission Contract.pdf</p>
                  <p className="text-sm text-muted-foreground">Uploaded 1 week ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}