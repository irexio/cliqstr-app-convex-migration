// 🔐 APA-HARDENED — Parent Approval Landing Page
export default function ParentApprovalPage() {
  return (
    <main className="max-w-xl mx-auto p-8 text-center text-gray-700">
      <h1 className="text-2xl font-bold mb-4">Awaiting Parent Approval</h1>
      <p className="mb-4">
        Your parent has been notified. Once they approve your account,
        you’ll be able to access Cliqstr and join your Cliqs.
      </p>
      <p className="text-sm text-neutral-500">
        If they didn’t receive the email, please ask them to check their spam folder or try again.
      </p>
    </main>
  );
}
