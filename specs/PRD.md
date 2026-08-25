# Product Requirements Document
## Job Profitability Guardian — an AI Operations Assistant for Print Shops

**Status:** MVP for hackathon submission (3-day build)
**Case study fit:** AI Operations Assistant (OptiServe Operations)
**Data source:** 5,791-message WhatsApp export from `NAIJA PRINTERS HUB 🇳🇬🖨️✅`, cross-validated by independent keyword analysis

---

## 1. The pain point

Small and mid-size print shop owners in Nigeria quote jobs by gut feel, not by real cost. Between the moment they say a price and the moment the job is delivered, three things routinely erase the profit:

1. **They underquote at the door.** One vendor in the dataset admitted it outright: *"So I dey undercharge all this while."* Others coach each other in real time on what to charge because there's no shared benchmark — e.g. advising a peer to quote ₦1,300 instead of guessing.
2. **Costs move after the quote is locked.** Material and FX-linked prices shift mid-week ("rate 2% increase after 2 hours" was cited as a real, repeated event), so a job that was profitable at quote time is a loss by delivery time — and nobody is watching for that shift.
3. **Rework and unpaid balances quietly finish the job off.** Reprints from defects (missing ink channels, misalignment) consume material a second time at zero extra revenue, and deposits collected up front don't guarantee the balance ever arrives.

None of these show up as a single alarming event. Each one is individually survivable. The real failure is that **no one is tracking the combined effect on a job's margin in real time** — shop owners only discover a job lost money after it's finished, when it's too late to do anything about it.

This is not a content-creation problem (better artwork tools) or a lead-generation problem (more customers). It's a **visibility problem**: the data needed to catch this already exists in the owner's head (or scattered across WhatsApp chats), it's just never compared against a threshold until the damage is done.

---

## 2. Target users

There are two distinct users in this system, and the MVP has to serve both — the second one is what actually generates the data the first one needs.

**Primary persona: Chidi, owner-operator of a 3–8 person print shop** (large-format, DTF, offset, or digital) in a Nigerian commercial hub (Lagos/Shomolu/Mushin-type cluster). He:
- Quotes jobs over WhatsApp, often under time pressure, competing against other vendors in the same group.
- Doesn't have a formal costing spreadsheet he checks per job — pricing is experience-based.
- Finds out a job was unprofitable only when he reconciles at the end of the week, if at all.
- Is not going to adopt a heavyweight ERP. He will adopt something that fits into how he already works (WhatsApp-first, mobile-first, fast).
- **Is the buyer/decision-maker for this product** — he's the one who needs the dashboard, the alerts, and the reports.

**Secondary persona: Amaka, the customer placing a print order.** She:
- Messages a print shop the way she messages anyone — casually, incompletely, over several back-and-forth texts ("I need banners" → "how many?" → "maybe 200" → "what size?").
- Doesn't know or care about specs like gsm, lamination type, or color mode — she knows what she wants the end result to look like, not the production language for it.
- Has no reason to use a "form." She'll only ever interact through a normal-feeling chat.
- **Is not the buyer of this product, but she's the one whose conversation the AI needs to turn into a structured, priced job** — she's the data source, not a dashboard user. She never sees margin, risk, or cost; she only ever sees a quote come back to her.

This second persona is what makes the product real rather than a manual data-entry tool: the shop owner shouldn't have to type job details in himself at all if the AI can extract them directly from doing what a shop owner already does — chatting with the customer to work out what they want.

---

## 3. The solution

**Job Profitability Guardian** has two connected surfaces:

1. **A customer-facing storefront & AI intake** (Amaka's side) featuring:
   - A public **Services Showcase** displaying core print capabilities (Banners/Large Format, Custom Apparel & Merch, Corporate Stationery, Packaging).
   - Instant quote trigger CTAs on each service card: launching the **Web Chat Widget** (with pre-filled context) or deep-linking to the **Telegram Bot**.
   - An interactive AI conversation that asks the questions a shop owner would normally ask — item, quantity, material, finishing, deadline — in plain conversational language, and turns the conversation into a structured job spec with a calculated quote.
2. **An owner-facing operations dashboard** (Chidi's side) that watches every job that comes out of that conversation the way an ops manager watches KPIs — except the KPI here is a single number: **Current estimated margin %**. It computes true cost against quoted price, and re-evaluates that margin whenever something changes (a material price update, a reprint, an overdue balance). When a job crosses a risk threshold, it explains why, recommends a specific corrective action, and drafts the message needed to act on it — then logs the whole thing.

The two surfaces share one backend: the same job record that Amaka's conversation produces is the same job record Chidi's dashboard monitors. This is deliberate — it removes the manual re-typing step entirely, which is the difference between a real product and a data-entry tool wearing an AI badge.

**One-line pitch:** *"Printers don't lose money all at once — they lose it a little at a time, invisibly. We built the assistant that quotes the customer and watches the margin at the same time."*

---

## 4. Goals and non-goals

### MVP goals (must ship in 3 days)
- A clean, modern services showcase landing page displaying print services with dual CTAs ("Instant AI Quote" and "Order on Telegram").
- A web-based chat widget where a judge can play Amaka: answer the AI's questions and receive a quote back, live.
- The AI extracts a structured job spec + quote from that conversation with no manual re-entry required.
- Compute and display Current estimated margin per job against a cost benchmark, visible on the owner dashboard.
- Detect at least 3 distinct risk conditions and score them by urgency × financial impact.
- Recommend a specific corrective action per risk and auto-draft the message to act on it.
- Show a dashboard + incident log + one generated report.

### Explicit non-goals (out of scope for MVP)
- Full e-commerce cart, inventory tracking, checkout, and payment gateway infrastructure — print jobs are custom/negotiated; demo with drafted payment-request messages.
- Computer-vision artwork preflight / CMYK gamut correction — real pain, wrong problem class for 3 days.
- Live payment collection / escrow integration — demo with drafted payment-request messages, not a live Paystack/Moniepoint charge.
- Multi-tenant auth, billing, production hardening — single-shop demo account is sufficient.
- **Live WhatsApp during the judged demo.** The demo is virtual, so the customer-facing chat widget (see Epic A below) is the primary and only required intake channel. A working Telegram bot integration is built as a secondary channel to prove the architecture generalizes past the browser, but no part of the judged demo depends on it firing live. Telegram was chosen over WhatsApp's Business API specifically because it needs no business verification or pre-verified recipient list, so a judge can message it cold with zero setup — see Section 9 for why this doesn't undercut the WhatsApp-grounded pain point.

---

## 5. Success metrics (for the demo, and for a real pilot)

| Metric | MVP demo target | Real-world target (post-hackathon) |
|---|---|---|
| Time from risk occurring to alert shown | < 5 seconds after data entry | Real-time on webhook |
| % of seeded demo jobs correctly flagged as at-risk | 100% of intentionally-seeded risk cases | — |
| Margin visibility | Every job shows a live % | — |
| Owner adoption proxy | Judge/tester can go from "job created" to "actionable alert" in one flow, no manual math | Weekly active use by shop owner |

---

## 6. User stories

Stories are grouped by who they're written for — Amaka (the customer, generating the data) and Chidi (the owner, consuming it) — and mapped to the required case-study capability each satisfies.

### Epic A — Capture the quote conversation (customer-facing: Amaka)

**US-0.** *As a prospective customer, I want to browse the shop's available services and easily start an AI quote or Telegram chat with one click, so that I understand what the shop offers.*

- Acceptance: landing page displays service cards (Large format banners, apparel/merch, packaging, flyers) with "Instant AI Quote" (opens chat drawer) and "Order on Telegram" (deep links to bot).

**US-1.** *As a customer, I want to describe what I need in my own words and have the assistant ask me follow-up questions like a real person would, so that I don't need to know print terminology to get a quote.*

- Acceptance: chat widget accepts free text (e.g. *"I need banners for an event"*), AI asks clarifying questions one at a time (quantity, size, material/finish, deadline) until enough fields are captured, without ever showing the customer a form.

**US-2.** *As a customer, I want to receive a clear price at the end of the conversation, so that I know what I'm agreeing to before the shop starts work.*

- Acceptance: once required fields are captured, the AI returns a quote (item, qty, spec, price) in plain language within the same chat thread.

**US-3.** *As a customer, I want to be able to correct or change something I said earlier (e.g. "actually make it 300, not 200"), so that the conversation feels natural instead of rigid.*

- Acceptance: a correction mid-conversation updates the extracted job spec and, if a quote was already shown, re-quotes automatically.

### Epic B — Turn the conversation into job records (system, no manual re-entry)

**US-4.** *As a shop owner, I want quote conversations to automatically become structured print job records on my dashboard, so that I never have to type in what the customer already told the AI.*

- Acceptance: on quote completion, structured `print_jobs` records `{conversation, item, quantity, material, spec, quotedPrice, customerName}` are created automatically and appear on the dashboard with no manual step.

**US-5.** *As a shop owner, I want to also be able to log jobs manually or by pasting an existing chat message, so that jobs quoted outside the chat widget are still tracked.*

- Acceptance: free text like *"3ft banner, 200pcs, art card 250gsm, matte lam, client said 45k"* is parsed into the structured print job format with >80% field accuracy on test messages — this is the fallback path, not the primary one.

### Epic C — Monitor the KPI that matters (owner-facing: Chidi)

**US-6.** *As a shop owner, I want to see an executive overview of my shop's profitability and every open job's margin % at a glance, so that I know which jobs are healthy without doing the math myself.*

- Acceptance:
  - **4 Top-Level Guardian KPI Cards:**
    1. *Net Active Margin %:* Real-time blended profitability benchmark (Target $>30\%$).
    2. *Total ₦ at Risk:* Capital exposure from underquotes and price spikes.
    3. *Overdue Client Debt:* Outstanding balances past `balanceDueDate`.
    4. *Active Incidents Count:* Urgency-ranked actionable alerts.
  - **Per-Collection Health Indicators:** Drill-down stats for `orders` (AOV & deposits), `print_jobs` (margin pill distribution), `incidents` (root cause split), `materials` (price volatility), and `conversations` (daily volume & conversions).
  - **Visual Matrix Pricing Editor:** Interactive spreadsheet grid for updating tiered quantity rates.
  - **Design System:** Built with a high-contrast industrial palette: **Vibrant Blaze Orange** (`#FF6B00`), **Electric Cobalt Blue** (`#2563EB`), and **Obsidian Slate** (`#0B0F19`).

**US-7.** *As a shop owner, I want the system to recalculate a job's margin automatically when a material price changes, so that I find out immediately instead of at final reconciliation.*

- Acceptance: updating a material's `unitCost` re-scores every open print job referencing that material within the same session.

### Epic D — Identify risk and prioritise it (owner-facing: Chidi)

**US-8.** *As a shop owner, I want to be told when a job's margin drops below a safe threshold, so that I can intervene before it's finished.*

- Acceptance: rule fires at a configurable threshold (e.g. <15%); incident includes the reason (which input changed).

**US-9.** *As a shop owner, I want to be told when a client hasn't paid an overdue balance, so that cash flow risk doesn't sneak up on me.*

- Acceptance: deposit paid + `balanceDueDate` passed → incident created, scored by amount outstanding.

**US-10.** *As a shop owner, I want at-risk jobs ranked by how much money and how much time I have to fix them, so that I work on the right thing first.*

- Acceptance: incident list sortable by urgency-weighted score = financial exposure × inverse of time-to-deadline.

### Epic E — Recommend action and escalate (owner-facing: Chidi)

**US-11.** *As a shop owner, I want a specific recommended action for each flagged risk, not just a red flag, so that I know what to actually do.*

- Acceptance: each incident type maps to one of: reject job / renegotiate remaining units / request balance now / switch supplier — shown in plain language.

**US-12.** *As a shop owner, I want the follow-up message already drafted, so that acting on the alert takes one tap, not ten minutes of typing — whether I end up sending it on WhatsApp, Telegram, or by copy-paste.*

- Acceptance: "request balance" and "renegotiate price" actions generate ready-to-send message text, channel-agnostic (plain text, no channel-specific formatting assumed).

### Epic F — Report and remember (owner-facing: Chidi)
**US-13.** *As a shop owner, I want a log of every issue that was ever flagged and what I did about it, so that I can see patterns over time (e.g. which material keeps causing losses).*
- Acceptance: incident log persists with status (open/resolved) and resolution note.

**US-14.** *As a shop owner, I want a weekly summary of my shop's financial health in plain English, so that I don't have to build my own report.*
- Acceptance: one-click "generate weekly report" produces total margin at risk, top recurring cause, and jobs resolved vs. still open.

---

## 7. Functional requirements → case-study mapping

| Case study requirement | MVP feature |
|---|---|
| Collect operational information from one or more sources | Customer-facing AI quote chat (primary) + manual job form / pasted message (fallback) |
| Monitor important performance indicators | Current estimated margin % per job |
| Identify unusual results, delays, shortages, workload problems | Risk rules: margin drop, overdue balance, reprint logged, material price spike |
| Summarise current operational performance | Dashboard with all open jobs + status |
| Prioritise issues based on urgency and impact | Urgency × financial-impact scored incident queue |
| Recommend corrective actions | Action-per-risk-type mapping |
| Trigger notifications, task assignments, escalation | Auto-drafted follow-up message per action, sendable on any channel |
| Produce daily/weekly operational reports | One-click LLM-generated weekly summary |
| Maintain a record of detected issues and actions taken | Persistent incident log with resolution status |

---

## 8. MVP scope cut line (if time runs short, cut in this order)

1. Weekly report generator (nice-to-have polish) — cut first.
2. Mid-conversation correction handling (US-3) — fall back to a fresh conversation if the customer changes their mind.
3. Manual job form / pasted-message fallback path (US-5) — the customer chat alone is enough to demo the thesis.
4. Auto-drafted follow-up messages (fall back to plain-text recommended action).
5. **Never cut:** the customer-facing quote chat (Epic A) and the owner-facing margin + risk-detection layer (Epics C–D) — together these are the whole demo. Cutting either one breaks the "two users, one pipeline" story that makes this more than a data-entry tool.

---

## 9. Assumptions and risks

- **Assumption:** a benchmark cost table (per material/spec) can be reasonably estimated from the dataset and manually seeded for the demo; it does not need to be live-sourced in 3 days.
- **Assumption:** the demo is virtual, so a judge plays Amaka through the web chat widget (US-1/US-2) rather than through real WhatsApp — this is the primary demo path, not a fallback (see Section 4).
- **Risk:** a judge's free-text input during the live demo may be ambiguous or incomplete in ways the AI can't cleanly parse — mitigated by the AI asking a follow-up question rather than failing silently, and by having a rehearsed "happy path" script ready if the judge needs a nudge on what to type.
- **Risk:** "profitability" data (true costs) is not something print shops currently record — the MVP must make entering this data fast enough that it's plausible a real shop owner would do it daily, not just for the demo.
- **Note:** the Telegram bot integration is still built and functional to prove the same extraction pipeline generalises past the browser — see Goals and non-goals.
- **Note on channel choice vs. the pain point:** the problem thesis is grounded in real WhatsApp data (Section 1) because that's verifiably where Nigerian print shop owners already operate. Telegram is used only as a live, zero-setup demo channel, not as a claim about where this product ships. Production deployment targets WhatsApp Business API; Telegram is a stand-in chosen for demo reliability, and this distinction should be stated proactively to judges rather than left for them to ask about.