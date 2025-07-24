# Claude Edit Instructions v1

This document outlines all changes and updates Claude Code should make to the current Cliqstr codebase.

---

## 📅 SECTION 1: MyCliqs Page State & Behavior

Update `/my-cliqs-dashboard` with state-based logic:

### 🔹 First Visit (No Profile)

* Show **Welcome header** and instructional text
* Show **centered button**: `Create Profile`
* Do **not** show any header buttons

### 🔹 Return Visit (Profile Created, No Cliqs)

* Show: "Create Your First Cliq"
* Show **`Edit Profile`** in top-right
* Centered button: `Create Cliq`

### 🔹 Ongoing Use (Profile + Cliqs)

* Show: Cliq list
* Show: `Edit Profile` and `Create New Cliq` in top-right

### Behavior Notes

* After profile is created, **redirect to `/my-cliqs-dashboard`**
* Re-fetch session state so `profile !== null` triggers UI update
* Use `router.refresh()` or similar if state does not reflect immediately

---

## 📜 SECTION 2: CliqCard Component

Update each `CliqCard` to include:

### Buttons

* `View` → `/cliqs/[id]`
* `Edit` → `/cliqs/[id]/edit`
* `Members` → `/cliqs/[id]/members`
* `Invite` → `/cliqs/[id]/invite`

### Optional Style

* Make `View` a full-width button overlaying the card image (if image exists)

### Permissions

* Only show `Edit` and `Invite` if current user is the creator or has permission

---

## 👤 SECTION 3: Profile Page Edits

### Field Label Fix

* Change label: `Last Name (or Nickname)` → **`Last Name`**

### Birthdate Toggle

* Add checkbox: "Show my birth year on my profile"
* Store value in profile as `showYear: boolean`

### UploadThing Integration

* Confirm correct `endpoint` is being used from `uploadthing.ts`
* Add helper text under avatar uploader:

  > "Choose a fun photo of yourself or something that represents you. This will be shown to your cliq members. You can skip this — we’ll give you a fun avatar if you don’t pick one!"
* If no avatar is uploaded, use default fallback (e.g., initials, emoji)

---

## 📱 SECTION 4: Mobile Responsiveness

* Wrap form in: `w-full max-w-lg mx-auto px-4 sm:px-6 py-6`
* Stack name fields vertically on mobile, side-by-side on larger screens
* Make buttons full-width on mobile
* Ensure `h-12`, `px-6` for touch target sizing
* Form should scroll into view properly when keyboard appears

---

## ✨ Optional Enhancements

* Add fallback avatars with age-appropriate themes (emoji, icon, initials)
* Add a "cliq count" or "post count" to the MyCliqs header
* Tooltip hovers for `Edit`, `Invite`, `Members` for accessibility on mobile

---

**All changes must preserve APA rules and never skip plan or approval logic.**

---

End of instructions.
