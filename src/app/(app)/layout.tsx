import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMe } from '@/lib/api-client';
import { AppShell } from '@/components/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.accessToken || !session.user?.id) {
    redirect('/login');
  }

  const me = await getMe(session.accessToken).catch(() => null);

  return (
    <AppShell
      userId={session.user.id}
      username={session.user.username ?? 'player'}
      avatarUrl={me?.avatarUrl ?? null}
    >
      {children}
    </AppShell>
  );
}
