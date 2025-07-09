'use client';

import React from 'react';
import SidebarNav from '@/components/SidebarNav';

export default function FAQPage() {
  return (
    <main className="bg-white text-black font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 px-4 sm:px-6 py-12 sm:py-16">
        <aside className="hidden md:block">
          <SidebarNav />
        </aside>

        <section className="space-y-12">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#202020] font-poppins">Frequently Asked Questions</h1>
          </div>

          {/* For Everyone */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">For Everyone</h2>
            <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
              <li><strong>What is a Cliq?</strong><br />A Cliq is a private social circle. Think of it like a group chat — but with full feeds, member control, and built-in privacy.</li>
              <li><strong>Can I join Cliqstr without an invite?</strong><br />Yes. Adults 18+ can sign up directly. Children under 18 require parental approval.</li>
              <li><strong>Is Cliqstr free?</strong><br />We offer a free trial and sponsored access for approved families. Paid plans are flat-rate and ad-free.</li>
              <li><strong>What happens when my trial ends?</strong><br />You can choose a paid plan or request sponsored access if you're part of a partner group or special invite.</li>
              <li><strong>Can I delete my account?</strong><br />Yes, anytime. Parents can also remove or suspend a child account directly from the Parent HQ.</li>
            </ul>
          </div>

          {/* For Parents */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">For Parents</h2>
            <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
              <li><strong>How do I approve my child’s account?</strong><br />When your child signs up, you'll receive an approval link by email. You create their username and password, select a plan, and confirm access.</li>
              <li><strong>Why do kids 13–17 need parent approval?</strong><br />Although COPPA only applies to children under 13, we extended the policy based on parent feedback. In our early testing, the overwhelming majority of moms preferred to keep oversight until age 18.</li>
              <li><strong>Can I monitor without my child knowing?</strong><br />Yes. Cliqstr allows silent monitoring by default, which can be adjusted from your Parent HQ.</li>
              <li><strong>Can I manage more than one child?</strong><br />Absolutely. Parent HQ supports multiple linked child accounts.</li>
              <li><strong>What controls do I have?</strong><br />You can toggle permissions for public cliq creation, invites, posting images, YouTube/game links, and suspend or reset access at any time.</li>
            </ul>
          </div>

          {/* For Youth */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">For Youth</h2>
            <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
              <li><strong>Who can see my posts?</strong><br />Only members of your cliq. There’s no global timeline or public profile browsing.</li>
              <li><strong>Can I block someone?</strong><br />Yes. Blocking removes access to your cliqs and content. Parents can view this in Parent HQ.</li>
              <li><strong>How do I invite a friend?</strong><br />Use the Invite feature in your cliq. If you’re under 18, your parent may need to approve outgoing invites first.</li>
              <li><strong>Can I customize my profile?</strong><br />Yes. Username, avatar, banner, and bio are all yours — unless your parent disables avatar uploads.</li>
            </ul>
          </div>

          {/* AI + Privacy */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">AI + Privacy</h2>
            <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
              <li><strong>What is Pip or Pippy?</strong><br />They’re your friendly AI guides who help with safe behavior, cliq creation, and navigating the platform.</li>
              <li><strong>Does Cliqstr use AI to monitor posts?</strong><br />Yes — but always privately and ethically. We use AI and human review to flag bullying, stalking, or unsafe content.</li>
              <li><strong>Do you sell my data?</strong><br />Never. Cliqstr is 100% ad-free and does not share personal data.</li>
              <li><strong>Will the AI message me?</strong><br />Only if you ask. Pip and Pippy are friendly, opt-in assistants — never intrusive.</li>
            </ul>
          </div>

          {/* Feedback & Help */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#202020] font-poppins">Feedback & Help</h2>
            <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
              <li><strong>How do I submit feedback?</strong><br />Use the Feedback button on any dashboard page. All submissions are reviewed by our team.</li>
              <li><strong>What do I do if I see something unsafe?</strong><br />Click the Red Alert button to flag the issue immediately. Our moderation team is notified in real-time.</li>
              <li><strong>Is there live support?</strong><br />Not yet — but email support is fast and personal. Write to inquiry@cliqstr.com for any help.</li>
              <li><strong>Where is the Cliqstr Safety Page?</strong><br />Linked in the footer of every page, or visit <code>/safety</code> directly.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
