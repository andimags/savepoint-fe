'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Gamepad2, Pencil, Trash2, X } from 'lucide-react';
import {
  deleteList,
  getList,
  removeListItem,
  thumbnailUrl,
  updateList,
  type ListDetail,
} from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ListDetailClient({ listId }: { listId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const myUserId = session?.user?.id;

  const [list, setList] = useState<ListDetail | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setList(await getList(token, listId));
  }, [token, listId]);

  useEffect(() => {
    refresh().catch(() => toast.error('Failed to load list.'));
  }, [refresh]);

  if (!list) return <Skeleton className="h-64 w-full" />;

  const isOwner = list.owner.id === myUserId;

  function openEdit() {
    if (!list) return;
    setEditTitle(list.title);
    setEditDescription(list.description ?? '');
    setEditOpen(true);
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      await updateList(token, listId, editTitle.trim(), editDescription.trim() || undefined);
      setEditOpen(false);
      toast.success('List updated.');
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update list.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteList() {
    if (!token) return;
    await deleteList(token, listId);
    toast.success('List deleted.');
    router.push('/lists');
  }

  async function handleRemoveItem(itemId: string) {
    if (!token) return;
    await removeListItem(token, listId, itemId);
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{list.title}</h1>
          <p className="text-sm text-muted-foreground">
            by{' '}
            <Link href={`/users/${list.owner.id}`} className="hover:underline">
              {list.owner.username}
            </Link>
            {list.description && <> — {list.description}</>}
          </p>
        </div>
        {isOwner && (
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={openEdit}>
              <Pencil data-icon="inline-start" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteList}>
              <Trash2 data-icon="inline-start" /> Delete list
            </Button>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit list</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={2000}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {list.items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          This list is empty. Open a game page and use “Add to list”.
        </p>
      ) : (
        <div className="space-y-2">
          {list.items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <span className="w-8 shrink-0 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <Link href={`/games/${item.game.id}`} className="shrink-0">
                {item.game.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl(item.game.coverUrl) ?? item.game.coverUrl}
                    alt=""
                    className="h-10 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-16 items-center justify-center rounded bg-muted">
                    <Gamepad2 className="size-4 text-muted-foreground" />
                  </div>
                )}
              </Link>
              <Link
                href={`/games/${item.game.id}`}
                className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
              >
                {item.game.name}
              </Link>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label="Remove from list"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
