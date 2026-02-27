import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Copy, Check, Plus, RefreshCw, Loader2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusVariant = {
  pending: 'secondary',
  completed: 'default',
  expired: 'destructive'
};

export default function OnboardingInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInvite, setNewInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/onboarding/invites');
      if (res.data.success) {
        // Build links client-side so they always use the correct frontend origin
        setInvites(res.data.invites.map(inv => ({
          ...inv,
          link: `${window.location.origin}/onboard/${inv.token}`,
        })));
      }
    } catch (err) {
      toast.error('Failed to load invites: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/onboarding/invite', { email: email.trim() || undefined });
      if (res.data.success) {
        // Override link with client-side origin for correct production URLs
        setNewInvite({
          ...res.data.invite,
          link: `${window.location.origin}/onboard/${res.data.invite.token}`,
        });
        setDialogOpen(true);
        setEmail('');
        fetchInvites();
      }
    } catch (err) {
      toast.error('Failed to generate invite: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Onboarding Invites</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Generate secure invite links for new employees to self-onboard.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvites} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Generate new invite */}
      <Card>
        <CardHeader><CardTitle className="text-base">Generate New Invite Link</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email">Employee Email (optional pre-fill)</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="employee@example.com"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" /> Generate Link</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Sent Invites ({invites.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LinkIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No invites yet. Generate your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite, i) => (
                <div key={invite._id}>
                  {i > 0 && <Separator />}
                  <InviteRow invite={invite} onCopy={copyLink} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New invite dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with the new employee. It expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          {newInvite && (
            <div className="space-y-3">
              {newInvite.email && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Pre-filled email: </span>
                  <span className="font-medium">{newInvite.email}</span>
                </p>
              )}
              <div className="flex gap-2">
                <Input value={newInvite.link} readOnly className="font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={() => copyLink(newInvite.link)}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires: {format(new Date(newInvite.expiresAt), 'PPP')}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InviteRow({ invite, onCopy }) {
  const [rowCopied, setRowCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(invite.link);
    setRowCopied(true);
    setTimeout(() => setRowCopied(false), 2000);
  };

  const isExpired = new Date(invite.expiresAt) < new Date() || invite.status === 'expired';
  const effectiveStatus = isExpired && invite.status === 'pending' ? 'expired' : invite.status;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant[effectiveStatus] || 'outline'}>
            {effectiveStatus}
          </Badge>
          {invite.email && (
            <span className="text-sm font-medium truncate">{invite.email}</span>
          )}
          {!invite.email && (
            <span className="text-sm text-muted-foreground italic">No email pre-filled</span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
          <span>Created: {format(new Date(invite.createdAt), 'MMM d, yyyy')}</span>
          <span>Expires: {format(new Date(invite.expiresAt), 'MMM d, yyyy')}</span>
          {invite.completedBy && (
            <span>Completed by: {invite.completedBy.name} ({invite.completedBy.employeeId})</span>
          )}
        </div>
      </div>
      {effectiveStatus === 'pending' && (
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {rowCopied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
          {rowCopied ? 'Copied' : 'Copy Link'}
        </Button>
      )}
    </div>
  );
}
