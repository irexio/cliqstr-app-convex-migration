"use client";

import Script from "next/script";
import { useEffect } from "react";

type MailerLiteEmbedProps = {
  // Option 1: Universal embed
  formId?: string; // data-form from MailerLite
  accountId?: string; // your MailerLite account/site ID
  region?: string; // e.g., "eu1" | "us1" (optional)
  // Option 2: Share URL (hosted page) — simplest fallback
  shareUrl?: string;
  className?: string;
  height?: number; // iframe height when using shareUrl
  usePopup?: boolean; // if true, only initialize script/account; do not render embedded div
};

export default function MailerLiteEmbed({
  formId,
  accountId,
  region,
  shareUrl,
  className,
  height = 460,
  usePopup = false,
}: MailerLiteEmbedProps) {
  // If shareUrl provided, render iframe fallback (no script/init required)
  if (shareUrl) {
    return (
      <div className={className}>
        <iframe
          src={shareUrl}
          title="MailerLite form"
          className="w-full"
          style={{ border: 0, width: "100%", height }}
        />
      </div>
    );
  }

  // Universal embed requires ml('account', ...) initialization
  const hasUniversal = !!formId;

  // Fallback init in case script was already present when this mounts
  useEffect(() => {
    if (!hasUniversal) return;
    if (!accountId) return;
    // @ts-ignore
    if (typeof window !== "undefined" && typeof window.ml === "function") {
      // @ts-ignore
      if (region) {
        // @ts-ignore
        window.ml("account", accountId, region);
      } else {
        // @ts-ignore
        window.ml("account", accountId);
      }
      // For popup usage only, try to explicitly show
      if (usePopup) {
        try {
          // @ts-ignore
          if (formId) window.ml("show", formId);
        } catch {}
      }
    }
  }, [accountId, region, hasUniversal, usePopup, formId]);

  return (
    <div className={className}>
      {hasUniversal && (
        <>
          <Script
            src="https://assets.mailerlite.com/js/universal.js"
            strategy="afterInteractive"
            onLoad={() => {
              try {
                // @ts-ignore
                if (typeof window !== "undefined" && typeof window.ml === "function" && accountId) {
                  // @ts-ignore
                  if (region) window.ml("account", accountId, region);
                  // @ts-ignore
                  else window.ml("account", accountId);
                  // Attempt to display the form explicitly only for popup usage
                  if (usePopup) {
                    // @ts-ignore
                    if (formId) window.ml("show", formId);
                  }
                }
              } catch {}
            }}
          />
          {!usePopup && <div className="ml-embedded" data-form={formId}></div>}
        </>
      )}
    </div>
  );
}
