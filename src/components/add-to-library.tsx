'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  addUserGame,
  MANUAL_PLATFORMS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type GameStatus,
  type Platform,
} from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUSES: GameStatus[] = ['PLAYING', 'FINISHED', 'BACKLOG', 'DROPPED'];

export function AddToLibrary({
  gameId,
  gameName,
  size = 'sm',
  variant = 'default',
  className,
}: {
  gameId: string;
  gameName: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('STEAM');
  const [status, setStatus] = useState<GameStatus>('BACKLOG');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!token) return;
    setSaving(true);
    try {
      await addUserGame(token, gameId, platform, status);
      toast.success(`Added ${gameName} to your library.`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add game.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Plus data-icon="inline-start" /> Add to library
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {gameName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as GameStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={saving} className="w-full">
            {saving ? 'Adding...' : 'Add to library'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
