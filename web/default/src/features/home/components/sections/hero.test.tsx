/*
Copyright (C) 2026 DeepRouter
SPDX-License-Identifier: AGPL-3.0-or-later
*/
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Hero } from './hero'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
}))

vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({
    systemName: 'DeepRouter',
  }),
}))

vi.mock('../hero-access-wizard', () => ({
  HeroAccessWizard: () => <div data-testid='hero-access-wizard' />,
}))

const DEMO_URL = 'https://www.youtube.com/watch?v=9PlYZl8BpE0&t=160s'

describe('homepage hero demo video entry', () => {
  it('shows a timestamped demo video link for anonymous visitors', () => {
    render(<Hero />)

    const demoLink = screen.getByRole('button', { name: /watch demo/i })

    expect(demoLink).toHaveAttribute('href', DEMO_URL)
    expect(demoLink).toHaveAttribute('target', '_blank')
    expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps the demo link available for authenticated users', () => {
    render(<Hero isAuthenticated />)

    expect(
      screen.getByRole('button', { name: /go to dashboard/i })
    ).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('button', { name: /watch demo/i })).toHaveAttribute(
      'href',
      DEMO_URL
    )
  })
})
