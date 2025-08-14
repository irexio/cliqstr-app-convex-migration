export default function SuccessSection() {
  return (
    <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white p-6 shadow">
      <h2 className="text-2xl font-semibold">All set! 🎉</h2>

      <div className="mt-4 space-y-5">
        <section>
          <h3 className="font-medium">1) Help your child sign in</h3>
          <p className="text-sm text-gray-700">
            Go to <strong>cliqstr.com</strong> and use your child's username and password to sign in.
          </p>
        </section>

        <section>
          <h3 className="font-medium">2) Silent monitor</h3>
          <p className="text-sm text-gray-700">
            From Parents HQ, you'll see alerts, friend approvals, and activity summaries. Red alerts are high-priority.
          </p>
        </section>

        <section>
          <h3 className="font-medium">3) Parent responsibilities</h3>
          <p className="text-sm text-gray-700">
            You are the primary approver for friends and cliqs. Our AI moderation helps, but your oversight is essential.
          </p>
        </section>
      </div>
    </div>
  );
}
