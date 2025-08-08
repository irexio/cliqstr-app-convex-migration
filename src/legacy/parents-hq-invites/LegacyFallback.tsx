export default function LegacyFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-xl font-bold mb-2">Legacy View (Disabled by Default)</h1>
        <p className="text-gray-600">
          The legacy Parents HQ / Invite pages were consolidated. Set
          <code className="mx-1">USE_LEGACY_PARENTS_HQ=true</code> to render this fallback (for temporary troubleshooting).
        </p>
      </div>
    </main>
  );
}
