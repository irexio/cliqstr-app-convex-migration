import React from 'react';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center py-16">
      <h1 className="text-3xl font-bold mb-4 text-[#202020] text-center">{title}</h1>
      <p className="text-lg text-neutral-600 mb-8 text-center">This page is coming soon to Cliqstr. Check back for updates!</p>
    </main>
  );
}
