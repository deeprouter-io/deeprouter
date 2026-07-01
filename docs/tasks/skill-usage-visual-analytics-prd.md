# Skill Usage Visual Analytics PRD

Status: eval

Date: 2026-07-01

## Context

The operator Skill Analytics page and the Super Admin user Skill usage dialog
currently present mostly numeric cards and tables. The user wants these surfaces
to communicate usage through colorful dashboard-style graphics, inspired by KPI
dashboard examples, while preserving the existing light/dark theme and page
backgrounds.

## Goals

- Add colorful, theme-aware visual summaries to `/skill-analytics`.
- Add colorful, theme-aware token/cost and timeline visuals to the Super Admin
  user Skill usage dialog.
- Preserve the existing day/night theme, layout shell, and data contracts.
- Keep visuals derived only from existing API response fields.
- Keep wide tables horizontally scrollable.

## Non-Goals

- Do not change backend analytics schemas or API contracts.
- Do not introduce a new charting dependency.
- Do not change global theme colors, page backgrounds, or navigation.
- Do not expose raw prompts, payloads, or provider data.

## Acceptance Criteria

- Skill Analytics includes a dashboard-style visual overview using existing
  overview metrics.
- Skill Analytics metric cards show colored mini visual indicators instead of
  neutral placeholder bars.
- Super Admin Skill usage dialog includes a visual token/cost summary and a
  recent activity strip before the tables.
- Visuals remain legible in light and dark themes by using theme chart tokens.
- Existing tables remain available and horizontally scrollable.
- Focused regression tests cover the new visual sections.

## Evaluation Notes

- Skill Analytics now includes a theme-token visual usage overview with activity
  mix and conversion funnel sections.
- Metric cards now show colored mini bars instead of neutral placeholder bars.
- Super Admin Skill usage dialog now includes token split, estimated cost, and
  recent activity visuals before the detailed tables.
- Existing day/night theme and backgrounds are unchanged.
- Touched-file lint, focused coverage tests, typecheck, production build, and
  full frontend tests passed.
