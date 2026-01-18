# APP CONTEXT - Source of Truth

**Project Name:** The Social Coordinator  
**Version:** 0.1.0  
**Last Updated:** January 17, 2026

---

## 🎯 Mission

**Social coordination to solve group chat fatigue.**

This app is designed to eliminate the chaos of endless group texts by providing a premium, intuitive platform for coordinating social events. We focus on making it effortless to plan, discover, and participate in social activities with friends and community.

---

## 🏛️ Design Pillars

### 1. Bento Grid Layouts
- **Asymmetrical card grids** that create visual interest and hierarchy
- **Dynamic spacing** that adapts to content importance
- **Modular components** that can be rearranged without breaking the design system

### 2. 32px Border Radii
- **Consistent rounded corners** across all cards, buttons, and containers
- **Creates a soft, approachable aesthetic** while maintaining premium feel
- **Applied universally** except where explicitly overridden for design emphasis

### 3. Glassmorphism
- **Blur intensity:** `backdrop-filter: blur(20px)`
- **Semi-transparent backgrounds** with subtle white/light overlays
- **Layered depth** to create visual hierarchy
- **Applied to:** Navigation bars, overlays, modal dialogs, and floating cards

---

## 🎨 Color Palette

### Primary Colors
- **Deep Obsidian:** `#0A0A0A` - Main background, creates depth and luxury
- **Charcoal Cards:** `#161616` - Card backgrounds, secondary surfaces

### Accent Gradients
- **Event Cards:** Custom gradient from Orange to Purple
  - `linear-gradient(135deg, #FF6B35 0%, #A855F7 100%)`
  - Used for event highlights, featured content, and interactive elements
- **Profile/Avatar:** Purple to Pink gradient
  - `linear-gradient(135deg, #A855F7 0%, #EC4899 100%)`

### Supporting Colors
- **White overlays:** `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.15)` for glass effects
- **Border accents:** `rgba(255, 255, 255, 0.1)` for subtle separators
- **Text hierarchy:**
  - Primary text: `#FFFFFF` (100% white)
  - Secondary text: `rgba(255, 255, 255, 0.7)` (70% white)
  - Tertiary text: `rgba(255, 255, 255, 0.5)` (50% white)

---

## 🛠️ Technical Stack

### Core Framework
- **React 18.3.1** - Component-based UI library
- **Next.js 15.1.4** - React framework with App Router
- **TypeScript 5** - Type-safe development

### Styling & Animation
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.15.0** - Production-ready animation library (Note: Currently using CSS animations)
- **Lucide-React** - Modern, clean icon library for UI elements
- **PostCSS 8.4.49** - CSS processing
- **Autoprefixer 10.4.20** - Vendor prefix automation

### Development Tools
- **ESLint 9** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

---

## 📁 Project Structure

```
/Users/richardwhite/in-app/In2.0/
├── app/
│   ├── globals.css          # Global styles, Tailwind directives
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page
├── components/
│   ├── AvatarStack.tsx      # Stacked avatar component
│   ├── BentoGrid.tsx        # Bento grid layout system
│   ├── EventCard.tsx        # Event display card
│   ├── GlassCard.tsx        # Glassmorphic card component
│   ├── InOutToggle.tsx      # Toggle component
│   └── Navigation.tsx       # Navigation bar
├── lib/
│   └── [utility functions]
├── .next/                   # Next.js build output
├── node_modules/            # Dependencies
├── package.json             # Project dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── APP_CONTEXT.md          # This file - Source of Truth
```

---

## 🎨 Design System Standards

### Typography
- **Headings:** Bold (700-900 weight), oversized (32-48px), high contrast
- **Body text:** Clean, readable (14-16px), appropriate line-height (1.5)
- **Font stack:** Inter (Google Fonts), Satoshi (display), system-ui (fallback)

### Spacing Scale
- **Base unit:** 4px (0.25rem)
- **Common spacing:** 8px, 16px, 24px, 32px, 48px, 64px
- **Border radius standard:** 32px (2rem)

### Component Standards
- **All cards** use `GlassCard` as base or inherit its styling
- **All grids** follow Bento Grid principles
- **All animations** use Framer Motion for consistency
- **All interactive elements** have hover/active states

### Glassmorphism Recipe
```css
background: rgba(22, 22, 22, 0.6);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 32px;
```

---

## 🚀 Development Guidelines

### Code Standards
1. **TypeScript first** - All new files must be `.tsx` or `.ts`
2. **Component composition** - Build small, reusable components
3. **Props typing** - Always define TypeScript interfaces for props
4. **Consistent naming** - PascalCase for components, camelCase for functions

### Performance
1. **Lazy loading** - Use dynamic imports for heavy components
2. **Image optimization** - Use Next.js Image component
3. **Animation performance** - Use transform and opacity for animations
4. **Code splitting** - Leverage Next.js automatic code splitting

### Accessibility
1. **Semantic HTML** - Use appropriate HTML elements
2. **ARIA labels** - Add where necessary for screen readers
3. **Keyboard navigation** - Ensure all interactive elements are keyboard accessible
4. **Color contrast** - Maintain WCAG AA standards minimum

---

## 📝 Notes

- **Mobile-first approach** - Design for mobile, enhance for desktop
- **Dark mode only** - No light mode planned for v0.1.0
- **Animation philosophy** - Subtle, purposeful, never distracting
- **Loading states** - Always provide visual feedback for async operations

---

## 🔄 Version History

- **v0.1.0** (Jan 17, 2026) - Initial project setup with core design system
