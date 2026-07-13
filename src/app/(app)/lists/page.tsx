import { ListsClient } from './lists-client';

export default function ListsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Lists</h1>
      <ListsClient />
    </div>
  );
}
