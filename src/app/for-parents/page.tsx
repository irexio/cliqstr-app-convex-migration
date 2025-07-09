'use client';

import React from 'react';
import SidebarNav from '@/components/SidebarNav';

export default function ForParentsPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 sm:px-6 py-12 sm:py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-12">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#202020] font-poppins">For Parents</h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto md:mx-0">
              You're not just giving your child access — you're staying part of their online world. Safely. Quietly. Together.
              Cliqstr was built to give young people a safe, joyful place to connect — without ads, algorithms, or strangers.
              But that doesn’t mean you’re left out. On Cliqstr, parents are active guardians, not outsiders or bystanders.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">What You Can Do as a Parent</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
              <li>Approve your child’s account by creating their username and password</li>
              <li>Manage multiple child accounts in one Parent HQ dashboard</li>
              <li>Set permissions for creating cliqs, sending invites, posting images, and accessing outside links</li>
              <li>Suspend or pause access at any time</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">AI-Powered Safety Tools</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
              <li>Smart moderation powered by AI + human review</li>
              <li>Pip and Pippy, AI chat companions who guide your child safely</li>
              <li>Homework Helpline (Coming Soon): AI tutoring that supports effort, not shortcuts</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">Our Philosophy</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              We believe in guidance, not surveillance. Cliqstr allows silent monitoring if needed — especially early on — but we encourage open, respectful communication between parents and kids. 
              Our tools are designed to build trust, not control.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">Feedback Matters</h2>
            <p className="text-gray-700 text-sm sm:text-base">
              Have a suggestion or concern? You can click the Feedback button on any page in the dashboard. While not every idea can be implemented immediately, we take all feedback seriously and use it to improve Cliqstr over time.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">Coming Soon</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
              <li>Guided tour of Parent HQ</li>
              <li>Optional alerts for activity spikes or content flags</li>
              <li>A private Cliq just for parents to connect and share support</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
