'use client';

interface ParentsHQPageProps {
  childId: string;
}

export default function ParentsHQPage({ childId }: ParentsHQPageProps) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Child Management</h2>
      <p className="text-gray-600 mb-4">
        Managing settings for child ID: <span className="font-mono">{childId}</span>
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          🚧 This detailed child management interface is coming soon. 
          For now, you can create child accounts using the form above.
        </p>
      </div>
    </div>
  );
}
