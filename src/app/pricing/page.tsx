'use client';

import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (plan: string) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Pricing</h1>
      <p className="text-gray-700">
        Cliqstr offers simple, affordable plans with no hidden fees, no ads, and no tracking. Your space, your rules — always.
      </p>

      <div className="grid gap-8 md:grid-cols-3 text-center">
        <div className="border rounded-lg p-6 shadow-md bg-indigo-50">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="text-3xl font-bold text-indigo-600 mb-4">$3.99/mo</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>Up to 5 active cliqs</li>
            <li>Invite-only access</li>
            <li>Parent-approved youth access</li>
            <li className="mt-2 font-medium text-green-600">Free for qualifying families</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('starter')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Standard</h2>
          <p className="text-3xl font-bold text-indigo-600 mb-4">$5.99/mo</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>Up to 10 active cliqs</li>
            <li>Priority support</li>
            <li>Autonomy mode for youth</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('standard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>

        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Family+</h2>
          <p className="text-3xl font-bold text-indigo-600 mb-4">$9.99/mo</p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>Up to 25 cliqs</li>
            <li>All features unlocked</li>
            <li>Best for large or extended families</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('family')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>

      <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600">
        <p>
          If your household qualifies for programs like EBT, SNAP, or school lunch, you can access the Starter plan at no cost.
        </p>
        <p className="mt-2 italic">
          No documentation. No application. Just trust.
        </p>
      </div>
    </main>
  );
}
