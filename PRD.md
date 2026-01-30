# Planning Guide

A Melodifestivalen 2026 rating application where users can log in with GitHub SSO or email/password, create or join groups, and evaluate each song entry from a specific heat with star ratings and comments. Group members can see each other's ratings. Voting for each heat opens one day before it airs.

**Experience Qualities**: 
1. **Collaborative** - The app should foster group participation where friends can see and compare ratings in real-time
2. **Organized** - Heat-based navigation keeps users focused on one deltävling at a time without overwhelming them
3. **Social** - Users should feel connected through shared group experiences and visible member ratings

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-user collaborative application with authentication, group management, shared state across users, heat-based content organization, and persistent user-specific ratings requiring advanced state management and multiple views.

## Essential Features

### GitHub SSO Authentication
- **Functionality**: Users authenticate with their GitHub account to access the application
- **Purpose**: Provide secure identity management and enable user-specific ratings without custom auth
- **Trigger**: App loads without authenticated user
- **Progression**: App loads → Login screen displays → User clicks "Logga in med GitHub" → GitHub authentication flow → User authenticated → Redirect to group selection
- **Success criteria**: Users can successfully log in and their GitHub profile (avatar, username) is displayed throughout the app

### Create and Join Groups
- **Functionality**: Users can create new rating groups or join existing ones via shareable links
- **Purpose**: Enable friends to collaborate and compare ratings within private groups
- **Trigger**: Authenticated user on group selection screen
- **Progression**: 
  - Create: Click "Skapa ny grupp" → Enter group name → Group created → Redirect to heat view
  - Join: Click "Gå med i grupp" OR use shared link → Enter group ID/paste link → Join group → Redirect to heat view
- **Success criteria**: Groups are created with unique IDs, shareable links work, members can see group member count

### Manage Group Members (Owner Only)
- **Functionality**: Group owners can view all members, add new members by username/ID, and remove existing members
- **Purpose**: Give group owners control over membership to maintain group privacy and relevance
- **Trigger**: Group owner clicks "Medlemmar" button in the heat view header
- **Progression**: Click "Medlemmar" → Dialog displays member list → Owner can add member by username → Member added to group OR Owner can remove member → Member removed from group → Changes persist
- **Success criteria**: Only group owners see add/remove options, all members can view the list, owner cannot remove themselves, changes save immediately

### Heat-Based Entry Viewing
- **Functionality**: Display entries organized by deltävling (heat) with tab navigation between heats
- **Purpose**: Keep users focused on rating one heat at a time, matching the actual competition format
- **Trigger**: User selects a group
- **Progression**: Select group → Heat 1 displays by default → Click heat tab → View entries for that specific heat → Select entry to rate
- **Success criteria**: Users can switch between 4 heats, each showing only its 7 entries, with clear visual separation

### Rate Entry Categories (Per User)
- **Functionality**: Assign 1-5 star ratings and text comments for each of the six categories, stored per user. Voting opens one day before each heat airs.
- **Purpose**: Record individual evaluations that can be viewed by all group members while preventing premature voting
- **Trigger**: User selects an entry from the heat view, and voting is open for that heat
- **Progression**: Select entry → Check if voting is open → If locked, show countdown message → If open, rating interface displays user's existing ratings → Update stars/comments → Auto-saves → Return to heat view
- **Success criteria**: Each user's ratings persist independently, updates save immediately, returning to an entry shows previous ratings, locked entries display voting open date clearly

### View Group Member Ratings
- **Functionality**: Display all group members' ratings for each entry in a shared view
- **Purpose**: Enable comparison and discussion of different perspectives within the group
- **Trigger**: User views entry ratings or summary
- **Progression**: View entry → See own rating → View "Gruppens betyg" section → See each member's ratings and comments → Compare scores
- **Success criteria**: All group members' ratings are visible with their usernames, real-time updates when ratings change

### Share Personal Ratings
- **Functionality**: Users can generate a shareable link to their personal ratings that anyone can view without logging in
- **Purpose**: Enable users to share their opinions on social media or with non-app users, encouraging organic growth
- **Trigger**: User clicks "Dela mina betyg" button from header or personal leaderboard
- **Progression**: Click share button → Link copied to clipboard → Toast confirmation → Share link with others → Recipients open link → View-only ratings page displays → Recipients can browse all rated entries and see detailed ratings
- **Success criteria**: Link generation works, view-only mode displays correctly, non-logged-in users can view shared ratings without authentication prompts

## Edge Case Handling

- **Unauthenticated State**: Show login screen with clear GitHub SSO button and app description
- **Shared Ratings View**: Users viewing a shared rating link see a read-only interface without login prompts
- **Invalid User Link**: Show error page when shared rating link points to non-existent user
- **No Ratings Shared**: Display empty state when viewing a user who hasn't rated any entries yet
- **No Groups**: Show empty state with CTAs for both creating and joining groups
- **Invalid Group Link**: Show error toast when joining with invalid group ID
- **Already Member**: Show info toast when attempting to join a group user is already in
- **Unrated Entries**: Display entries with 0 score and empty progress bar when user hasn't rated yet
- **Locked Voting**: Display lock icon on entry cards and show informative message with voting open date when voting is not yet available
- **Switching Groups**: Allow users to return to group selection to switch between multiple groups
- **Data Persistence**: All groups, memberships, and user ratings automatically saved using useKV with unique keys
- **Owner Removal Protection**: Group owner cannot remove themselves from the group
- **Duplicate Member**: Show info toast when trying to add a member who's already in the group
- **Non-Owner Access**: Non-owner members can view the member list but cannot add or remove members

## Design Direction

The design should evoke the collaborative, social spirit of watching Melodifestivalen with friends - think viewing parties, shared excitement, and friendly competition. It should feel modern and connected while maintaining clarity for group-based data comparison.

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
  - H1 (App Title/Group Name): Righteous Bold/40px/tight tracking - bold and stage-ready
  - H2 (Entry Titles): Space Grotesk Bold/20px/normal tracking - distinctive and musical
  - H3 (Category Names): Space Grotesk Medium/18px/wide tracking - clear hierarchy
  - Body (Comments/Details): Inter Regular/14px/relaxed line height - comfortable reading
  - Labels: Inter Medium/13px/slight wide tracking - crisp and clear

## Animations

Animations should enhance the feeling of social interaction and shared experiences without slowing down data entry.

- **Star Rating Hover**: Scale up stars on hover with slight bounce to feel tactile and playful
- **Entry Cards**: Gentle lift on hover with subtle shadow increase to indicate interactivity
- **Heat Tab Switch**: Smooth fade and slide when switching between heats
- **Group Member Ratings**: Staggered fade-in animation for each member's rating card
- **Page Transitions**: Smooth transitions between login → groups → heat view → entry detail

## Component Selection

- **Components**: 
  - Dialog (create/join group forms with validation, member management)
  - Card (entry display with gradient backgrounds, group selection cards, member cards)
  - Tabs (heat/deltävling navigation)
  - Textarea (comments for each category)
  - Button (primary actions in hot pink, secondary in purple tones)
  - ScrollArea (for long lists of entries, ratings, and members)
  - Badge (displaying heat/semifinal information, user indicators, owner badge)
  - Avatar (GitHub profile pictures for group members)
  - Input (for adding members by username/ID)
  
- **Customizations**: 
  - Custom star rating component (using phosphor-icons Star/StarFill) with purple-to-gold gradient fill
  - Entry card component showing user's personal score
  - Group member rating cards showing all users' scores side-by-side
  - Heat tab navigation with active state highlighting
  - Member management dialog with owner-only add/remove functionality
  - Member list with visual distinction for group owner (crown icon)
  
- **States**: 
  - Buttons: Default (solid color), Hover (slight brightness increase + lift), Active (scale down), Disabled (low opacity + no interaction)
  - Star ratings: Empty (outline), Hover (gold fill preview), Selected (gold gradient fill), Interactive feedback on click
  - Entry cards: Default (white), Hover (slight elevation + border glow), Rated (subtle success indicator)
  - Tabs: Default (muted), Active (primary color with border), Hover (light background)
  
- **Icon Selection**: 
  - SignIn (GitHub authentication)
  - Users (groups, members)
  - UsersThree (member management button)
  - Plus (create group, add rating)
  - UserPlus (join group, add member)
  - Copy (share group link)
  - ShareNetwork (share personal ratings)
  - SignOut (logout)
  - Star/StarFill (ratings)
  - MusicNotes (entry cards)
  - Microphone, Palette, Television, TextAa (category icons)
  - Sparkle (score indicators)
  - Crown (group owner indicator)
  - User (regular member indicator)
  - X (remove member)
  - LockKey (locked voting indicator)
  - CalendarBlank (voting open date display)
  - LinkSimple (external links to Mellopedia)
  
- **Spacing**: 
  - Container padding: px-6 py-8 (desktop), px-4 py-6 (mobile)
  - Card internal padding: p-6 (desktop), p-4 (mobile)
  - Gap between cards: gap-4 (consistent grid spacing)
  - Heat tab spacing: gap-1 with internal padding
  
- **Mobile**: 
  - Stack entry cards vertically on mobile with full width
  - Heat tabs remain horizontal with scrollable overflow if needed
  - Rating interface remains full-width with larger touch targets for stars (min 44px)
  - Group selection cards stack vertically
  - User avatars and names collapse to icon-only on very small screens
