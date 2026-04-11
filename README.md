# TenderGO

[![CI](https://github.com/dotrongtuan/tendergo/actions/workflows/ci.yml/badge.svg)](https://github.com/dotrongtuan/tendergo/actions/workflows/ci.yml)

TenderGO is a cross-platform learning and exam preparation app for the procurement professional certification training program.

The current version is an offline-first MVP built with Expo + React Native + TypeScript, designed to be easy to extend into a production e-learning platform with a real backend, admin tooling, and cloud sync.

Important note: the current dataset has been integrated from user-provided topic DOCX files and source mock exam DOCX files. It still must be reviewed by subject matter experts and checked against the latest legal documents before any official use.

## Release Status

- Current release: `1.0.0`
- Release notes: [CHANGELOG.md](./CHANGELOG.md)
- Default remote branch: `main`
- Verified locally:
  - `npm run typecheck`
  - `npm run build:web`

## Highlights

- Structured topic-based learning flow
- Lesson reader with key points, quick notes, and flash summary
- Question bank with filters for topic, difficulty, unanswered, wrong, and bookmarked items
- Topic exams and composite mock exams
- Practice mode and exam simulation mode
- Countdown timer, flagging, answer review, and result breakdown
- Progress analytics, weak-topic detection, and study history
- Local persistence, import/export snapshot flow, and admin-ready data model
- Responsive layout behavior for phone and tablet

## Tech Stack

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Zustand + AsyncStorage
- TanStack React Query
- React Hook Form + Zod
- Expo FileSystem / Sharing / DocumentPicker
- Expo Linear Gradient

## Architecture

The app is organized into four main layers:

1. Presentation
   - `src/components`
   - `src/features`
   - `src/navigation`
2. State and session
   - `src/store`
3. Business logic
   - `src/services`
   - `src/utils`
4. Data source
   - `src/mock`
   - `src/services/repositories`

This keeps UI concerns separate from data access and leaves a clean path for future API integration.

## Project Structure

```text
.
|-- App.tsx
|-- CHANGELOG.md
|-- README.md
|-- app.json
|-- babel.config.js
|-- package.json
`-- src
    |-- bootstrap
    |-- components
    |-- constants
    |-- features
    |-- hooks
    |-- mock
    |-- navigation
    |-- services
    |-- store
    |-- theme
    |-- types
    `-- utils
```

## Seed Data

The current imported catalog includes:

- 9 topics with preserved numbering: `1, 2, 3, 4, 5, 6, 7, 8, 10`
- 98 lessons imported from topic source documents
- 220 questions imported from topic/question source documents
- 9 topic-based mock exams
- 2 source-based comprehensive exams
- 1 generated composite exam
- Source metadata, legal references, learner progress, and exam history seeds

The data model is intentionally flexible so Topic 9 or other future programs can be added later without redesigning the core app.

## Implemented Screens

- Onboarding
- Auth gateway with guest mode and mock login
- Home dashboard
- Topics list
- Topic detail
- Lesson reader
- Question bank
- Question filter
- Topic exam setup
- Composite exam setup
- Exam session
- Exam result
- Review answers
- Analytics
- Bookmarks
- Search
- Profile
- Settings
- Import / export

## Core Exam Logic

- Random question selection
- Shuffled answer order
- Practice mode
- Exam simulation mode
- Countdown timer
- Previous / next navigation
- Flag uncertain questions
- Auto-submit on timeout
- Score calculation
- Per-topic result breakdown
- Weak-topic recommendation
- Answer review history

## Run Locally

### Requirements

- Node.js `>= 20.19.4` recommended
- npm 9+

Note: local verification in this workspace succeeded with Node `20.13.1`, but Expo SDK 54 recommends upgrading to `>= 20.19.4` for regular development and CI consistency.

### Install

```bash
npm install
```

### Development

```bash
npm run start
npm run android
npm run ios
npm run web
```

### Verification

```bash
npm run typecheck
npm run build:web
```

## Content Import Pipeline

The repository includes a repeatable DOCX import pipeline for updating the learning catalog from source materials.

### Import all source data

```bash
npm run import:dataset -- --input-dir "D:\Data\TUANDT\ĐẤU THẦU"
```

This command regenerates:

- `src/mock/imported/tenderTrainingData.json`
- `src/mock/imported/tenderExamSets.json`
- `src/mock/imported/tenderImportReport.json`

The import report is used in the app's data center screen to show source coverage, generation timestamp, and per-topic lesson/question counts.

### Clear Metro cache

```bash
npm run reset-cache
```

## Import / Export

The app includes a snapshot import/export screen to:

- export persisted learner state as JSON
- import a previous local backup
- support admin-ready migration and content replacement workflows

Imported files are validated with Zod before being accepted.

## CI

GitHub Actions runs on pushes and pull requests to `main` and verifies:

- dependency install with `npm ci`
- TypeScript typecheck
- Expo web export build

Workflow file: [ci.yml](./.github/workflows/ci.yml)

## Next Recommended Steps

1. Integrate real authentication and backend APIs.
2. Replace demo content with expert-reviewed official material.
3. Add tests for the exam engine, services, and store flows.
4. Introduce a CMS/admin workflow for question bank governance.
