import { InfoPageLayout } from '@/components/InfoPageLayout';

export default function SafetyPage() {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Safety' }
  ];

  return (
    <InfoPageLayout 
      breadcrumbs={breadcrumbs}
      title="Cliqstr Safety"
    >
      <div className="space-y-8">
        <p className="info-lead-text">
          Cliqstr is designed from the ground up to protect children, support families, and ensure every member
          feels safe and respected.
        </p>

          <div className="space-y-6 text-gray-700">
            <div>
              <h2 className="info-section-title mb-2">Parental Controls</h2>
              <p className="info-body-text">
                Parents can approve or deny invites, customize permissions for youth accounts, and receive notifications
                for activity that may require their attention.
              </p>
            </div>

            <div>
              <h2 className="info-section-title mb-2">Content Moderation</h2>
              <p className="info-body-text">
                All posts are screened by AI moderation backed by human review. Suspicious or harmful content is flagged
                before it can reach your child’s feed.
              </p>
            </div>

            <div>
              <h2 className="info-section-title mb-2">Invite-Only Access</h2>
              <p className="info-body-text">
                No strangers allowed. Cliqs are invitation-only, and even those require verification and approval for underage users.
              </p>
            </div>

            <div>
              <h2 className="info-section-title mb-2">No Ads or Tracking</h2>
              <p className="info-body-text">
                We will never run ads, sell your data, or allow third-party trackers. Your privacy is non-negotiable.
              </p>
            </div>
          </div>
      </div>
    </InfoPageLayout>
  );
}
