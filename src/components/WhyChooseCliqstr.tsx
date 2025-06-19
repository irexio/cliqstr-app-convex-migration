'use client';

import {
  LockClosedIcon,
  EyeIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export function WhyChooseCliqstr() {
  const features = [
    {
      icon: LockClosedIcon,
      title: 'Private Cliqs',
      description:
        'Only invited members can view and participate. Perfect for families, small groups, or kids-only zones.',
    },
    {
      icon: EyeIcon,
      title: 'Semi-Private Cliqs',
      description:
        'Visible to others, but require a request to join. Ideal for celebrations, creative circles, or extended community.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Public Cliqs',
      description:
        'Open for discovery — but never intrusive. You choose when to explore or join what’s out there.',
    },
    {
      icon: AdjustmentsHorizontalIcon,
      title: 'Control Your Experience',
      description:
        'You decide who sees what. Your visibility, privacy, and feed are yours to manage — not some algorithm.',
    },
  ];

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
          Why Choose Cliqstr?
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto mb-14">
          Cliqstr gives you private, semi-private, and public spaces — with full control over who joins and what gets shared.
        </p>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <feature.icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
