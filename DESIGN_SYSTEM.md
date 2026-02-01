# GitHub Activity Booster — Design System

A clean, accessible, trust-building design system for the GitHub Activity Booster app.

## Design Tokens

### Color Palettes (Choose One)

All palettes use HSL format and pass WCAG AA contrast requirements.

#### 1. Teal (Default - Recommended)
```css
--primary: 172 66% 40%;
--primary-hover: 172 66% 35%;
--primary-muted: 172 40% 92%;
```

#### 2. Cobalt Blue
```css
--primary: 217 91% 50%;
--primary-hover: 217 91% 45%;
--primary-muted: 217 60% 92%;
```

#### 3. Burnt Orange
```css
--primary: 24 85% 52%;
--primary-hover: 24 85% 47%;
--primary-muted: 24 50% 92%;
```

### Semantic Colors
- **Success**: `152 60% 42%` - Completed states, positive feedback
- **Warning**: `38 92% 50%` - Caution states, confirmations
- **Error/Destructive**: `0 72% 51%` - Error states, abort actions
- **Info**: `200 75% 50%` - Informational states

### Typography
- **Font Family**: Inter (variable)
- **Heading Sizes**: 
  - h1: 3rem/3.75rem (48px/60px)
  - h2: 2.25rem/2.5rem (36px/40px)
  - h3: 1.5rem/2rem (24px/32px)
- **Body**: 1rem/1.5rem (16px/24px)
- **Caption**: 0.75rem/1rem (12px/16px)

### Spacing Scale
4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Border Radius
- sm: 0.5rem (8px)
- md: 0.625rem (10px)
- lg: 0.75rem (12px)
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)

## Component Library

### Components Included
- `Header` - Navigation with logo, links, auth
- `Footer` - Links, legal, trust statement
- `Button` - Multiple variants (hero, github, success, etc.)
- `SettingsForm` - Repository configuration form
- `RepoPreviewList` - File tree preview
- `CommitTimeline` - Commit history with badges
- `LogFeed` - Real-time activity log
- `ConfirmModal` - Action confirmation dialog
- `CommitBadge` - Type badges (feat/fix/docs/test/chore)

### Button Variants
- `default` - Primary teal CTA
- `hero` - Large prominent CTA for landing pages
- `heroSecondary` - Secondary hero action
- `github` - GitHub branded (dark)
- `success` - Success/complete action
- `destructive` - Danger/abort action
- `outline`, `ghost`, `link` - Standard variants

## Accessibility

- All interactive elements have 44px minimum hit targets
- Focus states use ring-2 ring-primary pattern
- Color contrast ratios meet WCAG AA minimum
- Semantic HTML structure throughout
- Keyboard navigation supported

## Pages

1. **Landing** (`/`) - Hero, trust strip, features, CTA
2. **Login** (`/login`) - OAuth flow with scopes explanation
3. **Dashboard** (`/dashboard`) - Settings, preview, run panel

## Animations

- Duration: 120-300ms
- Easing: ease-out for enters, ease-in for exits
- Fade-up for content reveals
- Scale for modals/dialogs
- Pulse for loading states
