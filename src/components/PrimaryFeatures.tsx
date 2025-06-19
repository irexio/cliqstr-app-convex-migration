'use client';

import {
  LockClosedIcon,
  UsersIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Privacy-Focused',
    description: 'Your data stays private. Always. No ads. No tracking.',
    icon: LockClosedIcon,
  },
  {
    name: 'Private Cliqs',
    description: 'Create secure spaces just for family, friends, or teams.',
    icon: UsersIcon,
  },
  {
    name: 'No Public Feed',
    description: 'Avoid strangers. No explore tab. No random content.',
    icon: EyeSlashIcon,
  },
  {
    name: 'Control Your Experience',
    description: 'Moderate posts, manage invites, and customize settings.',
    icon: AdjustmentsHorizontalIcon,
  },
];

export function PrimaryFeatures() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold font-poppins text-center text-[#202020] mb-12">
          Why Choose Cliqstr?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-[#f9f9f9] rounded-lg p-6 text-center shadow-sm"
            >
              <feature.icon className="h-8 w-8 mx-auto text-[#6f4eff] mb-4" />
              <h3 className="text-lg font-semibold font-poppins text-[#202020]">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-[#555] font-poppins">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
