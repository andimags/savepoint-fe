import { WrappedClient } from "./wrapped-client";

export default function WrappedPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight">Wrapped</h1>
            <WrappedClient />
        </div>
    );
}
