import { ConnectionsClient } from './connections-client';

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-muted-foreground">
          Link your gaming accounts to import your library automatically.
        </p>
      </div>
      <ConnectionsClient />
    </div>
  );
}
