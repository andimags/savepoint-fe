import { LibraryClient } from "./library-client";

export default function LibraryPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
            <LibraryClient />
        </div>
    );
}
