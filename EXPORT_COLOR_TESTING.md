# Export Color Format Testing

## Problem
The html2canvas library (used for exporting leaderboards as images) does not support modern CSS color formats like `oklch()` and `oklab()`. When these color formats are used in className attributes, the export fails or produces incorrect colors.

## Solution
Use only html2canvas-compatible color formats:
- ✅ Hex colors: `#FFFFFF`, `#87CEEB`, `#CD7F32`
- ✅ HSL colors: `hsl(0, 100%, 50%)`
- ✅ RGB colors: `rgb(255, 255, 255)`, `rgba(255, 255, 255, 0.5)`
- ✅ Named colors: `gold`, `silver`, `bronze`
- ✅ CSS variables: `var(--color-name)` (when defined with safe formats)

## Affected Components
The following components use html2canvas for image export and must use safe color formats:
- `GroupLeaderboard.tsx`
- `PersonalLeaderboard.tsx`
- `GlobalLeaderboard.tsx`

## Test Coverage
We have implemented comprehensive unit tests to prevent this issue from being reintroduced:

### 1. Component-Specific Tests
- `GroupLeaderboard.test.tsx` - Tests GroupLeaderboard rendering and color safety
- `PersonalLeaderboard.test.tsx` - Tests PersonalLeaderboard rendering and color safety
- `GlobalLeaderboard.test.tsx` - Tests GlobalLeaderboard rendering and color safety

Each component test includes:
- Verification that no `oklch()` or `oklab()` values appear in className attributes
- Verification that arbitrary Tailwind values use safe color formats
- Verification that inline styles use safe color formats
- Functional tests for sorting, scoring, and display logic

### 2. Global Validation Test
- `color-format-validation.test.ts` - Scans all component files for unsafe color formats

This test:
- Automatically finds and checks all component files
- Validates className strings don't contain `oklch` or `oklab`
- Validates template literals for className don't contain unsafe formats
- Validates Tailwind arbitrary values use safe formats only
- Validates inline style objects don't contain unsafe formats
- Provides specific error messages showing exactly where violations occur

## Running Tests
```bash
npm test
```

Or for specific test files:
```bash
npm test GroupLeaderboard.test.tsx
npm test color-format-validation.test.ts
```

## Common Mistakes to Avoid
❌ Don't use:
```tsx
className="text-[oklch(0.7_0.1_200)]"
className="border-[oklab(0.6_0.12_30)]"
className="border-[#e8cd8c80]" // Hex+alpha in arbitrary values may fail
```

✅ Use instead:
```tsx
className="text-[#87CEEB]"
className="border-[#CD7F32]"
// For colors with opacity, use inline styles with rgba():
style={{ borderColor: 'rgba(232, 205, 140, 0.5)' }}
// Or use Tailwind opacity utilities:
className="border-[#e8cd8c] border-opacity-50"
```

## Color Reference for Medals
These are the recommended colors for podium positions:

- 🥇 **Gold (1st place)**: `#e8cd8c` or use the `text-gold` utility class
- 🥈 **Silver (2nd place)**: `#87CEEB` (Sky Blue)
- 🥉 **Bronze (3rd place)**: `#CD7F32` (Bronze)

## CI/CD Integration
The color format validation tests run automatically on every commit and pull request. Any attempt to introduce `oklch()` or `oklab()` color formats in component files will cause the tests to fail, preventing the issue from being deployed.

## Historical Context
This issue was introduced and fixed multiple times:
1. Initial implementation used `oklch` colors
2. Fixed to use hex colors
3. Reintroduced `oklch` in PersonalLeaderboard during a refactor
4. Fixed again with hex colors
5. Comprehensive tests added to prevent future regressions
6. **2025-01**: Fixed hex+alpha format issue in GroupLeaderboard (e.g., `#e8cd8c80`) - moved to inline style with rgba() format

### Latest Fix (GroupLeaderboard.tsx)
The issue occurred because Tailwind's arbitrary value syntax with hex+alpha (e.g., `border-[#e8cd8c80]`) may not parse correctly in html2canvas. The solution was to:
- Remove hex+alpha from className
- Move border colors to inline style objects using proper `rgba()` format
- Keep background gradients using `rgba()` which is fully supported

The tests now ensure this pattern cannot be reintroduced without immediate detection.
