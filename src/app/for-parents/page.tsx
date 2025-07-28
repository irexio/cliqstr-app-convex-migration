import React from 'react';
import { InfoPageLayout } from '@/components/InfoPageLayout';

export default function ForParentsPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'For Parents' }
  ];

  return (
    <InfoPageLayout 
      breadcrumbs={breadcrumbs}
      title="For Parents"
    >
      <div className="space-y-8">
        <p className="info-lead-text">
          You're not just giving your child access — you're staying part of their online world. Safely. Quietly. Together.
        </p>
        <p className="info-body-text">
          Cliqstr was built to give young people a safe, fun place to connect — without ads, algorithms, or strangers.
          But that doesn't mean you're left out. On Cliqstr, parents are active guardians, not outsiders or bystanders.
        </p>

          <div className="space-y-3">
            <h2 className="info-section-title">What You Can Do as a Parent</h2>
            <ul className="list-disc list-inside info-body-text space-y-1">
              <li>Approve your child’s account by creating their username and password</li>
              <li>Manage multiple child accounts in one Parent HQ dashboard</li>
              <li>Set permissions for creating cliqs, sending invites, posting images, and accessing outside links</li>
              <li>Suspend or pause access at any time</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">AI-Powered Safety Tools</h2>
            <ul className="list-disc list-inside info-body-text space-y-1">
              <li>Smart moderation powered by AI + human review</li>
              <li>Pip and Pippy, AI chat companions who guide your child safely</li>
              <li>Homework Helpline (Coming Soon): AI tutoring that supports effort, not shortcuts</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">Our Philosophy</h2>
            <p className="info-body-text">
              We believe in guidance, not surveillance. Cliqstr allows silent monitoring if needed — especially early on — but we encourage open, respectful communication between parents and kids. 
              Our tools are designed to build trust, not control.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">Feedback Matters</h2>
            <p className="info-body-text">
              Have a suggestion or concern? You can click the Feedback button on any page in the dashboard. While not every idea can be implemented immediately, we take all feedback seriously and use it to improve Cliqstr over time.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="info-section-title">Coming Soon</h2>
            <ul className="list-disc list-inside info-body-text space-y-1">
              <li>Guided tour of Parent HQ</li>
              <li>Optional alerts for activity spikes or content flags</li>
              <li>A private Cliq just for parents to connect and share support</li>
            </ul>
          </div>
      </div>
    </InfoPageLayout>
  );
}
