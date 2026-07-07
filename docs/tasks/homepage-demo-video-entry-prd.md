# PRD — Homepage Demo Video Entry

> **Status**: eval
> **Date**: 2026-07-08
> **Owner**: DeepRouter Frontend
> **Parent**: [`docs/PRD.md`](../PRD.md), [`docs/tasks/casual-ux-prd.md`](casual-ux-prd.md)
> **Scope**: Public homepage hero in `web/default`

---

## 1. Problem

The README now links to a product walkthrough video, but the public homepage does not expose that proof point. New visitors can see the positioning and dashboard CTA, yet they have no lightweight way to watch a feature walkthrough before deciding whether to enter the product.

## 2. Goal

Add a low-friction demo video entry to the homepage without weakening the primary conversion path.

Success means:

- The homepage hero includes a secondary demo action near the main CTA.
- The action opens the YouTube walkthrough at the `02:40` timestamp (`t=160s`), where the Skills Marketplace is visible.
- The implementation avoids an embedded iframe on initial load.
- Text is internationalized for all frontend locales.
- The design follows `docs/DESIGN.md` tokens and keeps the existing hero hierarchy.

## 3. Non-Goals

- Do not redesign the homepage hero.
- Do not add a full video modal or YouTube iframe in this task.
- Do not change the README screenshot asset.
- Do not alter routing, pricing, wallet, or onboarding flows.

## 4. UX Decision

Use a secondary outline button beside the existing primary CTA:

- Authenticated users: `Go to Dashboard` remains primary, `Watch demo` is secondary.
- Anonymous users: `Get Started` remains primary, `Watch demo` is secondary, and `View Pricing` remains available.

This gives curious visitors a trust-building proof point while preserving the product's main action.

## 5. Acceptance Criteria

- `Watch demo` is visible in the homepage hero.
- The link uses `https://www.youtube.com/watch?v=9PlYZl8BpE0&t=160s`.
- The link opens in a new tab with safe `rel` attributes.
- The button uses a familiar play icon and existing button styling.
- All new user-visible strings exist in every frontend locale file currently present in the repo (`en`, `zh`).
- Changelog records the implementation.

## 6. Verification Plan

- Focused component test for the hero demo link.
- Frontend typecheck.
- i18n sync.
- Build if the frontend checks are broad enough to catch route/component integration issues.

## 7. Verification Results

- `bunx vitest run src/features/home/components/sections/hero.test.tsx` — PASS; verifies anonymous and authenticated hero states render the `Watch demo` action with the YouTube `t=160s` URL and safe external-link attributes.
- `bun run i18n:sync` — PASS; `en` missing/extras/untranslated counts are 0, `zh` has no missing/extras and retains 104 existing untranslated entries unrelated to this task.
- `bun run typecheck` — PASS.
- `bun run build` — PASS.
- `bunx eslint src/features/home/components/sections/hero.tsx src/features/home/components/sections/hero.test.tsx` — PASS.
- `bunx prettier --check ../../CHANGELOG.md ../../docs/tasks/homepage-demo-video-entry-prd.md src/features/home/components/sections/hero.tsx src/features/home/components/sections/hero.test.tsx src/i18n/locales/en.json src/i18n/locales/zh.json` — PASS.
- `git diff --check` — PASS.
