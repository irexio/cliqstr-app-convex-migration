import React from 'react';
import { InfoPageLayout } from '@/components/InfoPageLayout';

export default function AboutPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'About' }
  ];

  return (
    <InfoPageLayout 
      breadcrumbs={breadcrumbs}
      title="About Cliqstr"
    >
      <div className="space-y-8">
        <p className="info-lead-text">
          Cliqstr is a private, ad-free platform built for kids, families, and anyone seeking a more personal, intentional social experience.
          We believe people of all ages deserve safe spaces to connect — without being tracked, targeted, or manipulated by algorithms.
        </p>

          <div className="space-y-3">
            <h2 className="info-section-title">Why We Exist</h2>
            <p className="info-body-text">
              Existing social media platforms prioritize engagement at any cost — even if it means harming mental health or violating user trust.
              Cliqstr was built differently. We prioritize safety, trust, and real connection from the start.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">What Makes Us Different</h2>
            <ul className="list-disc list-inside info-body-text space-y-1">
              <li>No ads, ever</li>
              <li>No tracking or third-party data sharing</li>
              <li>Role-based access for youth, adults, and parents</li>
              <li>Built-in privacy — every cliq is its own space</li>
              <li>Parental approvals and oversight for all underage accounts</li>
              <li>AI moderation that protects without overreaching</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">Homework Helpline</h2>
            <p className="info-body-text">
              The Homework Helpline is an optional AI-powered support tool built into Cliqstr to help kids stay focused, build confidence, and better understand their schoolwork.
              It offers thoughtful prompts, explanations, and reset suggestions to support independent learning — without doing the work for them.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">CliqSafe (Coming Soon)</h2>
            <p className="info-body-text">
              CliqSafe is an optional add-on currently in development. It’s designed to extend Cliqstr’s protections beyond the app — helping families apply the same privacy and safety principles across all of their child’s internet use.
              Features will include VPN-based safeguards, content filtering, and parental controls that align with Cliqstr’s mission.
            </p>
          </div>
      </div>
    </InfoPageLayout>
  );
}
