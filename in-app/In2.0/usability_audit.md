# Usability Audit & Gap Analysis

## Current Status
User reports: "No visible changes", "Not intuitive", "Features missing". 
Root Cause Hypothesis: The "Temporal State Machine" is hiding functionality. If the state isn't perfectly `PLANNING`, components disappear. The UI is too conditional.

## "Elite 10" User Story Mapping

1. **The First Date (Non-User)**
   - *Goal:* User picks 3 spots -> Sends link -> Non-user picks 1 -> Calendar.
   - *Current State:* `createEventWithOptions` exists but isn't exposed in `QuickCreateBento`. `GuestOnboarding` exists but is for *joining* a set event, not voting on options (unless configured).
   - *Gap:* Need a "Propose Options" mode in Quick Create.

2. **The Buddy Lunch (10 People)**
   - *Goal:* Coordinate large group, vote on 3 spots.
   - *Current State:* `ConsensusCard` handles voting, but *creating* a multi-option event is hidden.
   - *Gap:* "Poll/Vote" creation flow needed.

3. **The Saturday Morning Golf**
   - *Goal:* Specific time + Gear Checklist.
   - *Current State:* `BentoChecklist` exists but only auto-generates for key moods. User can't manually add items yet?
   - *Gap:* Manual checklist creation or specific "Golf" template.

4. **The "I'm Bored" Homebody**
   - *Goal:* AI suggestion for now.
   - *Current State:* `GapSuggestion` handles this, but it's hidden behind a button in `ContextualHeader`.
   - *Gap:* Make specific AI suggestions more prominent ("What should I do?").

5. **The Nature Enthusiast**
   - *Goal:* Meetup Point + Packing List.
   - *Current State:* Location field exists. Checklist exists.
   - *Gap:* Explicit "Meetup Point" vs "Destination" field? (Maybe overkill, can be in description).

6. **The "Last Minute" Pivot**
   - *Goal:* Instant Plan B.
   - *Current State:* `runContingencyCheck` exists but is backend-triggered.
   - *Gap:* "Find Alternative" button on the Event Detail page.

7. **The Recurring Ritual**
   - *Goal:* "Every Tuesday".
   - *Current State:* No recurrence logic.
   - *Gap:* Need `recurrence` field in Schema and UI.

8. **The Milestone Celebration**
   - *Goal:* Track RSVPs + Dietary Notes.
   - *Current State:* `Guest` model has status. No dietary field.
   - *Gap:* Add `dietaryReq` to Guest model/flow.

9. **The "Double Date"**
   - *Goal:* Coordination across 2 units.
   - *Current State:* Group chat works.
   - *Gap:* Just needs standard consensus flow, verify it feels "intimate" enough.

10. **The Wellness Session**
    - *Goal:* Find class time + book.
    - *Current State:* Standard event time. No external booking integration.
    - *Gap:* Manual URL link or text description for booking.

## Immediate Action Plan (UX Rescue)
1. **Un-hide the Features:** Stop hiding `QuickCreateBento` behind state logic. Make it the hero.
2. **Enhance Quick Create:**
   - Add "Type" selector: "Quick Hangout", "Poll/Vote", "Specific Event".
   - Make "Dating Mode" and "Boost" more obvious (not just toggles, maybe distinct cards).
3. **Refactor Home (`page.tsx`):**
   - Top: Contextual Awareness (keep, but don't displace tools).
   - Middle: "Action Center" (Create Hangout, Create Poll, Explore).
   - Bottom: "Your Agenda" (Bento Grid).
