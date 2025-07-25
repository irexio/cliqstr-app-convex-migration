export default function AwaitingApprovalPage() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Waiting for Parent Approval</h1>
      <p className="text-lg text-gray-700">Your account is almost ready! Please ask your parent to check their email.</p>
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Make sure your parent checks their spam folder if they don't see the email right away.
        </p>
      </div>
    </div>
  );
}
