# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-04-09

### Added

- Production-style Expo React Native MVP for TenderGO exam preparation
- Onboarding, guest mode, mock login, dashboard, topic learning, question bank, exams, analytics, bookmarks, search, profile, settings, and import/export flows
- Offline learner state with Zustand persist and AsyncStorage
- Mock learning catalog with 9 topics, 27 lessons, 162 sample questions, topic exams, and a composite exam
- Service and repository layers to support a future backend transition
- Reusable design system components, responsive layout behavior, and light/dark theme support
- Bootstrap loading and retryable error states
- GitHub Actions CI workflow for typecheck and web export verification

### Changed

- TypeScript config now excludes `dist/` so `npm run typecheck` still passes after web export
- Main tab layout now respects bottom safe area more cleanly on modern phones
- Shared screen container now handles keyboard interactions better for forms and search screens

### Notes

- Seed content is demo-only and must be reviewed by subject matter experts before official use
- Expo SDK 54 is best run with Node.js `>= 20.19.4`
