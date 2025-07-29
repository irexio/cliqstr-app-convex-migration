/**
 * 👤 Profile Completion Utilities
 * 
 * Smart utilities for encouraging profile completion without being pushy.
 * Calculates completion status and provides contextual messaging.
 */

interface UserProfile {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  about?: string | null;
  image?: string | null;
  bannerImage?: string | null;
}

interface ProfileCompletion {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  nextStep: string;
  benefits: string[];
}

/**
 * Calculate profile completion status
 */
export function calculateProfileCompletion(profile: UserProfile | null): ProfileCompletion {
  if (!profile) {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: 5,
      missingFields: ['username', 'firstName', 'about', 'profilePhoto', 'bannerImage'],
      nextStep: 'Create your profile to help friends recognize you!',
      benefits: [
        '🎉 Get birthday celebrations',
        '👋 Help friends recognize you',
        '💬 Increase engagement by 3x',
        '🎨 Customize your appearance'
      ]
    };
  }

  const fields = [
    { key: 'username', label: 'username', value: profile.username },
    { key: 'firstName', label: 'firstName', value: profile.firstName },
    { key: 'about', label: 'about', value: profile.about },
    { key: 'image', label: 'profilePhoto', value: profile.image },
    { key: 'bannerImage', label: 'bannerImage', value: profile.bannerImage }
  ];

  const completedFields = fields.filter(field => field.value && field.value.trim() !== '').length;
  const missingFields = fields.filter(field => !field.value || field.value.trim() === '').map(f => f.label);
  const percentage = Math.round((completedFields / fields.length) * 100);

  // Determine next step based on what's missing
  let nextStep = 'Your profile is complete! 🎉';
  if (missingFields.includes('username')) {
    nextStep = 'Add a username so friends can find you!';
  } else if (missingFields.includes('profilePhoto')) {
    nextStep = 'Add a profile photo to help friends recognize you!';
  } else if (missingFields.includes('firstName')) {
    nextStep = 'Add your name to personalize your profile!';
  } else if (missingFields.includes('about')) {
    nextStep = 'Tell friends a bit about yourself!';
  } else if (missingFields.includes('bannerImage')) {
    nextStep = 'Add a banner image to make your profile stand out!';
  }

  // Benefits based on completion level
  const benefits = [];
  if (percentage < 40) {
    benefits.push('🎉 Unlock birthday celebrations', '👋 Help friends recognize you');
  } else if (percentage < 80) {
    benefits.push('💬 Increase engagement', '🎨 Customize your appearance');
  } else {
    benefits.push('✨ Profile complete!', '🏆 Maximum engagement');
  }

  return {
    percentage,
    completedFields,
    totalFields: fields.length,
    missingFields,
    nextStep,
    benefits
  };
}

/**
 * Get contextual profile nudge message based on location
 */
export function getContextualNudge(
  context: 'dashboard' | 'cliq-feed' | 'avatar-click' | 'post-creation' | 'cliq-join',
  completion: ProfileCompletion
): {
  message: string;
  cta: string;
  priority: 'low' | 'medium' | 'high';
  showProgress?: boolean;
} {
  if (completion.percentage === 100) {
    return {
      message: '',
      cta: '',
      priority: 'low'
    };
  }

  switch (context) {
    case 'dashboard':
      return {
        message: completion.percentage === 0 
          ? '👋 Welcome! Create your profile to help cliq members get to know you better.'
          : `🎯 Your profile is ${completion.percentage}% complete. ${completion.nextStep}`,
        cta: completion.percentage === 0 ? 'Create Profile' : 'Complete Profile',
        priority: completion.percentage === 0 ? 'high' : 'medium',
        showProgress: completion.percentage > 0
      };

    case 'cliq-feed':
      if (completion.percentage < 40) {
        return {
          message: '💡 Tip: Members with profiles get 3x more engagement in cliqs!',
          cta: 'Add Profile Photo',
          priority: 'low'
        };
      }
      return { message: '', cta: '', priority: 'low' };

    case 'avatar-click':
      return {
        message: completion.percentage === 0
          ? 'Create your profile to help friends recognize you!'
          : `Complete your profile (${completion.percentage}% done) to maximize engagement!`,
        cta: 'Complete Profile',
        priority: 'high',
        showProgress: true
      };

    case 'post-creation':
      if (!completion.missingFields.includes('profilePhoto')) {
        return { message: '', cta: '', priority: 'low' };
      }
      return {
        message: '📸 Add a profile photo so friends know this post is from you!',
        cta: 'Add Photo',
        priority: 'medium'
      };

    case 'cliq-join':
      return {
        message: completion.percentage < 60
          ? '🤝 Complete your profile to make a great first impression with new cliq members!'
          : '',
        cta: 'Complete Profile',
        priority: 'medium',
        showProgress: true
      };

    default:
      return {
        message: completion.nextStep,
        cta: 'Complete Profile',
        priority: 'medium'
      };
  }
}

/**
 * Get engagement stats for motivation
 */
export function getEngagementStats(hasProfile: boolean) {
  return {
    birthdayWishes: hasProfile ? '5x more birthday wishes' : 'Enable birthday celebrations',
    recognition: hasProfile ? 'Friends recognize you instantly' : 'Help friends recognize you',
    engagement: hasProfile ? '3x more post engagement' : 'Increase your engagement',
    connections: hasProfile ? 'Stronger cliq connections' : 'Build stronger connections'
  };
}

/**
 * Profile completion milestones for gamification
 */
export const PROFILE_MILESTONES = [
  { percentage: 20, reward: '🎯 Profile Started!', message: 'Great start! Keep going.' },
  { percentage: 40, reward: '👤 Basic Info Complete!', message: 'You\'re getting there!' },
  { percentage: 60, reward: '📸 Photo Added!', message: 'Looking good!' },
  { percentage: 80, reward: '✨ Almost There!', message: 'Just one more step!' },
  { percentage: 100, reward: '🏆 Profile Master!', message: 'Your profile is complete!' }
];

/**
 * Check if user just hit a milestone
 */
export function checkMilestone(oldPercentage: number, newPercentage: number) {
  const milestone = PROFILE_MILESTONES.find(m => 
    oldPercentage < m.percentage && newPercentage >= m.percentage
  );
  return milestone;
}
