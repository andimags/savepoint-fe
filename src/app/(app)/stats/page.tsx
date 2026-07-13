import { StatsClient } from './stats-client';

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <StatsClient />
    </div>
  );
}
