'use client';

interface ParentApprovalPageProps {
  parentId: string;
}

export default function ParentApprovalPage({ parentId }: ParentApprovalPageProps) {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-semibold mb-4">Parent Approval Dashboard</h1>
      <p>Welcome, parent #{parentId}.</p>
      <p className="mt-2 text-gray-600">
        Here you’ll see requests from your child and others you need to approve.
      </p>
    </div>
  );
}
