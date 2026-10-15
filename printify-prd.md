Refine my existing Printfy website as a senior product designer and frontend engineer. Use the attached printify-prd.md as the source of truth.

The current page feels repetitive and overly promotional. Build a clear, credible experience that explains the product, demonstrates its core workflow, and invites students and universities into the pilot.

FIRST: ESTABLISH PRODUCT STATUS

Inspect the existing implementation alongside the PRD. Distinguish working functionality, simulated UI, and planned functionality. A frontend mockup does not count as a working feature.

The PRD is marked MVP planning. Until launch readiness is verified, use pilot-stage messaging. Label simulated interactions “Interactive preview.”

Keep the existing Printfy brand spelling, typography, and purple identity consistent.

1. HERO — EXPLAIN THE PRODUCT IMMEDIATELY

Heading:
“Send your document.
Collect when it’s ready.”

Supporting copy:
“We’re building a simpler way to print on campus: upload your file, follow its queue status, and get notified when it’s ready to collect.”

Primary button:
“Try the demo”

Secondary button:
“Bring Printfy to your campus”

Small status label:
“Preparing for our first campus pilot”

The primary button should scroll to the interactive preview. The secondary button should open the campus enquiry flow.

Use one strong printer visual. Make the headline and buttons readable immediately, with restrained background effects.

2. HOW IT WORKS — ONE INTERACTIVE DEMONSTRATION

Combine the existing four-step story and overlapping product-demo section into one coherent experience. Reuse their useful components.

Heading:
“See your next print run.”

Use a sample document called “Assignment.pdf” and clearly label the experience as a demo.

Let the visitor:
- Select the sample document.
- Change the number of copies.
- Click “Add to demo queue.”
- See the sample job enter the queue.
- Use a “Next stage” control to progress through Queued → Printing → Ready → Collected.
- Restart the demo.

Keep queue position and job status as separate pieces of information.

Include a secondary “Preview a printer issue” action that shows an out-of-paper status and a sample student notification.

Use on-page notification previews without requesting browser notification permission. Explain that the demo does not submit a real print job.

Make the interface the main focal point. Keep the existing 3D artwork as supporting imagery where it helps explain the active stage.

Remove duplicated Upload / Track / Collect sections after integrating their useful content here.

3. FEATURES — EXPLAIN THE PLANNED PILOT CAPABILITIES

Heading:
“Built around your print run.”

If these capabilities are not verified as live, introduce them as:
“What we’re building for the campus pilot.”

Use a clear, varied layout with queue tracking as the largest feature and smaller supporting items:

- PDF and image uploads, with a copies field.
- First-come-first-served digital queue.
- Alternative collection slots when capacity is full.
- Ready-for-collection and printer-issue notifications.
- A choice to delete documents after printing or retain them for reuse.

Use concise descriptions and small relevant interface examples. Avoid repeating the full journey from the demo.

Do not promise exact wait times or automatic slot calculations while the scheduling rules remain undecided.

Describe document retention as planned until the deletion behaviour is implemented and verified.

Add a separate compact row:
“For the people running the print shop”

Explain:
- Incoming jobs in submission order.
- Printing, Ready, and Collected status controls.
- Blocking-issue reporting.
- Service announcements.

Do not include payments, multi-shop routing, analytics, or full admin controls among the MVP capabilities.

4. ABOUT — GIVE THE PRODUCT A REASON TO EXIST

Use a short editorial section rather than another feature grid.

Heading:
“Less time at the print shop.
More time for your day.”

Explain that Printfy began with a familiar campus problem: students must visit the shop and wait without knowing whether their document is ready.

Describe the approach: begin with one campus print shop, test the complete workflow with students and operators, and improve it before expanding.

Keep this section concise. Avoid invented founder stories, testimonials, savings figures, user counts, and university endorsements.

5. STUDENTS AND UNIVERSITIES — GIVE EACH AUDIENCE A RELEVANT ACTION

Retain the navbar’s Pricing dropdown with Students and Universities destinations.

For students:
- Display verified print rates only when available.
- Otherwise say that pilot print rates will be confirmed before launch.
- Do not reuse placeholder prices or discounts as real offers.
- Explain that online payments are planned for a later phase.

For universities:
- Replace established-looking Pilot / Campus / Multi-Campus commercial tiers with one clear campus pilot invitation.
- Heading: “Help shape printing on your campus.”
- Button: “Discuss a campus pilot.”
- Collect institution, contact name, work email, and a short description of the current print setup.

Connect enquiries to an existing working submission handler. Show success only after a successful submission. If no handler exists, identify the form as a preview.

6. ROADMAP — SMALL AND SECONDARY

Add a compact “Planned next” area after the main product content.

Group the roadmap into:
- After pilot validation: student history, document previews, operator analytics, and admin controls.
- Later expansion: multiple shops, automatic rerouting, payment integration, and an iOS app.

Use “Planned” labels. Do not invent delivery dates or describe routing as AI-powered without an actual AI implementation.

7. FAQS — ANSWER PRACTICAL QUESTIONS

Use the reference layout:
- Left: heading and contact action.
- Right: plain accordion rows.

Cover:
- Is Printfy available at my campus?
- Which file types are planned for the pilot?
- How does the queue work?
- What happens if the printer runs out of paper or ink?
- What happens to my document after printing?
- Can my university discuss a pilot?

Base answers on the PRD and verified implementation. Clearly identify decisions still being finalised.

8. VISUAL HIERARCHY AND SPACING

Make each section recognisable through its purpose, composition, and background.

- Deep purple hero.
- Slightly lighter purple interactive-demo area.
- Quiet dark background for features.
- Open typography-led About section.
- Off-white audience and FAQ area with charcoal text.
- Compact purple final CTA.

Reuse existing colour tokens where suitable.

Remove the spotlight shape that visually merges the story panel with the following section. Reduce excessive stars, glows, nested panels, and empty space.

Use one shared content width, left-aligned section headings, and fluid spacing. Keep illustrations large enough to understand.

Use subtle entrance motion only after the static hierarchy works. Respect reduced-motion preferences.

9. IMPLEMENTATION AND REVIEW

Implement this in the current codebase. Keep marketing changes separate from building backend features; use clearly labelled demo states where functionality is missing.

Verify at 375, 768, 1024, 1440, and 1920px widths.

Check:
- The product purpose is immediately understandable.
- The interactive preview completes and resets correctly.
- Every section introduces new information.
- Planned features are distinguishable from working features.
- CTAs lead to appropriate destinations.
- Content remains accessible by keyboard.
- There are no overlapping elements, clipped visuals, excessive gaps, or horizontal scrolling.

Finish with a concise summary of changes and any product decisions still needed.