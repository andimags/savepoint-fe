import { DiaryClient } from './diary-client';

export default function DiaryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Diary</h1>
      <DiaryClient />
    </div>
  );
}
