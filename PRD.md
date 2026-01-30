# Planning Guide

A Melodifestivalen rating application where users can evaluate each song entry across multiple categories with star ratings and comments.

**Experience Qualities**: 
1. **Festive** - The app should capture the excitement and celebration of Melodifestivalen with vibrant colors and engaging interactions
2. **Organized** - Multiple entries and categories should be clearly structured and easy to navigate without feeling overwhelming
3. **Expressive** - Users should feel encouraged to share detailed opinions through both ratings and written feedback

**Complexity Level**: Light Application (multiple features with basic state)
This is a content management app where users create, rate, and organize multiple song entries with structured data across categories, requiring moderate state management and multiple interactive components.

## Essential Features

### Load Melodifestivalen 2025 Entries
- **Functionality**: Automatically populate the app with all official entries from Melodifestivalen 2025 (all 28 artists and songs across 4 heats)
- **Purpose**: Save time by not requiring manual entry of official competition songs
- **Trigger**: User clicks "Ladda Mello 2025" button
- **Progression**: Click button → System checks for duplicates → New entries added automatically → Toast notification confirms how many added → Entries appear in list
- **Success criteria**: All 28 official entries are added without duplicates, organized by their respective heats (Deltävling 1-4)

### Add New Entry
- **Functionality**: Create a new song entry with artist name, song title, and heat/semifinal information
- **Purpose**: Add custom entries or songs from future years not yet in the system
- **Trigger**: User clicks "Add Entry" button
- **Progression**: Click add button → Dialog opens → Fill in entry details (song, artist, heat) → Save → Entry appears in list
- **Success criteria**: New entry appears immediately in the entries list with default ratings

### Rate Entry Categories
- **Functionality**: Assign 1-5 star ratings and text comments for each of the six categories (Låt, Kläder, Scenografi, Sång, Text, Vykort/Presentation)
- **Purpose**: Record detailed evaluations across multiple dimensions of each performance
- **Trigger**: User selects an entry to rate
- **Progression**: Select entry → Rating interface displays → Click stars for each category → Enter comments → Auto-saves → Visual feedback confirms save
- **Success criteria**: All ratings and comments persist and display correctly when returning to an entry

### View All Entries
- **Functionality**: Display all song entries in a scannable list/grid with visual indicators of completion status
- **Purpose**: Provide overview of all entries and quick access to rate or review them
- **Trigger**: App loads (default view)
- **Progression**: App opens → All entries displayed with summary info → Visual indication of rated/unrated entries
- **Success criteria**: Users can quickly see which entries need rating and access any entry with one click

### Calculate Overall Score
- **Functionality**: Automatically compute total score from all category ratings for each entry
- **Purpose**: Enable easy comparison between entries and identify favorites
- **Trigger**: Automatic calculation when ratings change
- **Progression**: User rates categories → Scores sum automatically → Total displays prominently → Entries can be sorted by score
- **Success criteria**: Total score updates immediately and sorting reflects current ratings

## Edge Case Handling

- **Empty State**: Show welcoming message with two CTAs - "Load Mello 2025" for quick start or "Add Custom Entry" for manual addition
- **Duplicate Prevention**: When loading official entries, system checks if artist+song combination already exists to prevent duplicates
- **Incomplete Ratings**: Display entries with partial ratings clearly, showing which categories still need evaluation
- **Manual Duplicates**: Allow manual duplicates (same song/artist might appear multiple times intentionally in different heats or for comparison)
- **Long Text Comments**: Implement text truncation with expand option for lengthy comments
- **Data Persistence**: All entries, ratings, and comments automatically saved using useKV

## Design Direction

The design should evoke the glamorous, energetic spirit of Melodifestivalen - think stage lights, bold colors, and Swedish pop culture. It should feel celebratory and fun while maintaining clarity for data entry and comparison.

## Color Selection

A vibrant, stage-inspired palette that captures the excitement of Eurovision and Swedish pop culture:

- **Primary Color**: Deep vibrant purple (oklch(0.45 0.22 300)) - represents the glamour and prestige of the competition stage
- **Secondary Colors**: Electric blue (oklch(0.55 0.18 250)) for interactive elements; warm gold (oklch(0.75 0.15 85)) for star ratings and highlights
- **Accent Color**: Hot pink (oklch(0.65 0.25 350)) - energetic accent for CTAs and important actions like adding entries
- **Foreground/Background Pairings**: 
  - Background (Soft lavender oklch(0.96 0.02 300)): Dark purple text (oklch(0.25 0.15 300)) - Ratio 9.2:1 ✓
  - Primary (Deep purple oklch(0.45 0.22 300)): White text (oklch(1 0 0)) - Ratio 8.5:1 ✓
  - Accent (Hot pink oklch(0.65 0.25 350)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Cards (White oklch(1 0 0)): Dark purple text (oklch(0.25 0.15 300)) - Ratio 13.1:1 ✓

## Font Selection

Typography should feel modern and energetic like contemporary music branding while maintaining excellent readability for detailed information.

- **Typographic Hierarchy**: 
  - H1 (App Title): Righteous Bold/32px/tight tracking - bold and stage-ready
  - H2 (Entry Titles): Space Grotesk Bold/24px/normal tracking - distinctive and musical
  - H3 (Category Names): Space Grotesk Medium/16px/wide tracking - clear hierarchy
  - Body (Comments/Details): Inter Regular/14px/relaxed line height - comfortable reading
  - Labels: Inter Medium/13px/slight wide tracking - crisp and clear

## Animations

Animations should enhance the feeling of interaction and celebration without slowing down data entry.

- **Star Rating Hover**: Scale up stars on hover with slight bounce to feel tactile and playful
- **Entry Cards**: Gentle lift on hover with subtle shadow increase to indicate interactivity
- **Add Entry**: Success checkmark animation with scale and fade when new entry saves
- **Score Updates**: Smooth number counting animation when total scores change
- **Page Transitions**: Smooth slide transitions between entry list and detail views

## Component Selection

- **Components**: 
  - Dialog (add new entry form with clear validation)
  - Card (entry display with custom gradient backgrounds inspired by stage lighting)
  - Textarea (comments for each category)
  - Button (primary actions in hot pink, secondary in purple tones)
  - ScrollArea (for long lists of entries)
  - Tabs (switching between different heats/semifinals if needed)
  - Badge (displaying heat/semifinal information)
  
- **Customizations**: 
  - Custom star rating component (using phosphor-icons Star/StarFill) with purple-to-gold gradient fill
  - Entry card component with category score visualization
  - Custom progress indicator showing how many categories have been rated
  
- **States**: 
  - Buttons: Default (solid color), Hover (slight brightness increase + lift), Active (scale down), Disabled (low opacity + no interaction)
  - Star ratings: Empty (outline), Hover (gold fill preview), Selected (gold gradient fill), Interactive feedback on click
  - Entry cards: Default (white), Hover (slight elevation + border glow), Selected/Active (purple border highlight)
  
- **Icon Selection**: 
  - Plus (add entry)
  - Star/StarFill (ratings)
  - MusicNotes (entry cards)
  - Microphone (Sång category)
  - Palette (Kläder category)
  - Television (Vykort category)
  - TextAa (Text category)
  - Sparkle (overall score indicator)
  
- **Spacing**: 
  - Container padding: px-6 py-8 (desktop), px-4 py-6 (mobile)
  - Card internal padding: p-6 (desktop), p-4 (mobile)
  - Gap between cards: gap-4 (consistent grid spacing)
  - Section spacing: space-y-6 for major sections, space-y-3 for category groups
  
- **Mobile**: 
  - Stack entry cards vertically on mobile with full width
  - Rating interface remains full-width with larger touch targets for stars (min 44px)
  - Dialog forms stack fields vertically on narrow screens
  - Collapse category names to icons on very small screens with tooltips
  - Bottom sheet drawer for entry details on mobile instead of side panel
