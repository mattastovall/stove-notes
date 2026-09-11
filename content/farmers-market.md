---
share: true
published_url: https://mattastovall.github.io/stove-notes/farmers-market/
---
realfoodgroup.org


# rfg — PRD

A membership-only map of farmers markets. Members pay a subscription to access a curated, national map of farmers markets where the daily/weekly open status comes from the operators themselves, so a member can trust that the market showing "open today" actually is.

**Platform strategy:** native iOS app is the product (the map experience; the consumer web app is the acquisition/payment funnel (marketing, signup, Stripe checkout, account). **Goal: speed of development — get a functional, polished iOS app into most iPhones' hands quickly, fed by a web funnel that converts traffic with the least friction.**

Status scope: PRD / scoping draft. Greenfield, no code exists.



## 1. Pass/Fail Rubric

Derived from the request(membership-only map of farmers markets)and the deciding answers: shopper subscription; national scope; dynamic availability/updates; iOS app + web funnel; dual-channel payments(Stripe on web, StoreKit in-app).



| # | Criterion | Pass when | Fail when |
|---|-----------|-----------|-----------|
| R1 | Membership-only access | No map/detail/status content is usable without a paid membership beyond a branded teaser region. | Shoppers can fully browse the map for free. |
| R2 | Dynamic availability | At least 70% of listed markets have a fresh operator- or staff-confirmed status (updated within last 7 days) at MVP; every market page distinguishes "confirmed today" vs "default schedule". | Most market pages show only static scheduleand nothing about today's status. |
| R3 | National coverage | Directory contains seeded listingsin all US states at launch, with a tracked % of actively-updated markets. | Launch is limited to a single region with no plan for the rest of the country. |
| R4 | Operator self-service | A market manager can claim a marketand update status without staff involvement, within 48h of claim. | Operators must call or email staff for every status change. |
| R5 | Payment/entitlement (web) | Web funnel collects credit card via **Stripe**; purchase unseals member content (app+web) without a manual staff step; entitlement is checked server-side. | Gating is client-side only or requires manual account standing. |
| R6 | Payment/entitlement (iOS) | iOS app offers the same subscription via **StoreKit IAP** at same-or-better price; IAP entitlement validated server-side(verified App Store transactions); purchase works in-app. | In-app purchase missing, pricier than web, or gating is client-side only. |
| R7 | Apple compliance | No in-app links/CTAs directing users to pay on the web; "Sign in with Apple" offered alongside other logins (app uses any third-party/federated login; restore purchases present. | App directs users out to web checkout from inside the app, or omits required IAP/restore/SiWA. |
| R8 | Trust/audit | Every operator status change is attributed, timestamped, and append-only; member alerts are triggered from the same canonical record. | Status can be overwritten without a trace. |
| R9 | iOS app + web funnel, broad device support | Native SwiftUI app ships to the App Store covering most iPhonesin market (deployment target ≈ iOS 16,≈95% of active devices; adaptive layouts); consumer web funnel(marketing + signup + Stripe + account) is live at launch. | Requires Android, or a too-new OS floor, or no web funnel at launch. |
| R10 | Speed of development | Functional polished MVP (iOS app + web funnel) lands in the App Store(TestFlight → release) within a few months of solo dev start; zero custom infra where a managed service works. | Architectural choices(custom backend, custom map engine, bespoke billing) delay first release substantially. |



## 2. Product Spec

### Product summary

rfg is a membership-only, native iOS map of farmers markets in the US with daily, operator-updated open/close status. Members pay a subscription for a curated, trustworthy view of which markets are actually happening today, this week, and next. The consumer web app is the main funnel: marketing, signup, and **Stripe** checkout (credit card), plus account management. The iOS app is the product experience and also offers the same subscription via **StoreKit** (Apple requires in-app purchase whenever digital membership unlocks content inside the app; web sales remain allowed as long as in-app IAP exists at the same or better price and no in-app links push users to the web checkout.. Operators and staff use a thin web tool so data stays fresh without bloating the consumer app..



### Users / personas

- **The weekend shopper(member)** — wants fresh produce from a real market, not a supermarket. Frustrated with driving to a market that's closed, moved, or seasonal even though Google said "open." Values reliability and curation. Discovers rfg via web/marketing, subscribes online(or in-app), then uses the iOS app to find markets..
- **The devoted regular** — has 3–4 favorite markets, wants alerts on the schedule changesand weather closures for favorites..
- **Market manager / operator** — runs a farmers market, wants members to show up; has 5 minutes a week to confirm status, no tech appetite. Updates status via a simple web link or email/push reminder (no app install required).
- **Producer / vendor** — sells at an market, wants members to find them; participates in market-level updates, later in listings..
- **Staff curator(rfg admin)** — seeds the directory, verifies claims, moderates content, handles disputes, using a minimal web console..



### Problem statement

Google Maps and aggregators list farmers markets, but they are stale and flat: they show a recurring schedule, not today's reality. Markets close for weather, public holidays, last-minute site changes, and their owners' own seasonal shifts. There is no reliable"is it actually happening" signal. Shoppers lose trips; markets lose foot traffic. A subscriber-funded model aligns the incentive to keep the data true: members only pay, so only accurate, current, curated markets remain..



### Goals

- Ship a polished, functional native iOS app covering most iPhones quickly(speed of development is a first-class goal; use the most batteries-included managed stack available..
- Stand up a **web funnel** (marketing → signup → Stripe checkout → account) as the primary acquisition/payment entry point, feeding the iOS app..
- Offer **in-app subscription** via StoreKit with parity(pricing, entitlement)so Apple rules are satisfied and iOS users can pay without leaving the app..
- Provide a curated national directory of farmers markets with honest, operator-confirmed availability..
- Convert cold traffic into paying members via a small teaser + visible demonstrably-fresh status inside the wall..
- Make it trivially easy for market operators to keep their day/shared status updated(assuming good data hygiene reduces refunds/churn). Operators do not need to install the app..
- Grow favorites-based marketing(vendors/markets want members) via status accuracy and retention..



### Non-goals(MVP)

- No Android, and the consumer web app is **not** a full-featured map — it is the funnel + account(signup, Stripe checkout, billing, teaser preview; the full map experience lives in the iOS app.. A web map could come post-MVP..
- No e-commerce, delivery, or product ordering..
- No reviews/social feed..
- No producer-level marketplace or subscription..
- No international data / no open data export behind the paywall(No data licensing deals for data resale..
- No complex offline-first sync; map requires network, cache recent market detail only..



### Current context / baseline assumptions

- National ambition; seed data can bootstrap from USDA Local Food Directories(farmers market directory, public-domain listing)plus manual curation, then operator claims keeps it clean..
- No existing codebase; greenfield. **Dual-channel payments**: Stripe on the web(primary funnel, credit card) **and** StoreKit 2 IAP in the iOS app(Apple-required same-or-better price, no in-app links to external checkout.. App Store Server Notifications/Server API for entitlement validation and server-side gating..
- **Stack default(speed-first, batteries-included)**:
  - **iOS app**: SwiftUI + MapKit(system map, no map SDK fee/complexity)+ SwiftData/CoreData local cache. Deployment target iOS 16+(≈95% of active iPhones..
  - **Web funnel + operator/staff console**: Next.js(shared Supabase backend; Stripe Checkout + Customer Portal for subscriptions/billing..
  - **Backend**: managed BaaS — **Supabase**(Postgres + built-in auth, Realtime, Edge Functions, APNs push-ready) **or Firebase**; choose the one that reaches parity with fewest lines of code. Custom server only if/when needed later..
  - **Push**: APNs via the BaaS provider; operator reminders also email/SMS via managed email service..
- Notifications: push to members(with in-app fallback); email/SMS reminders to operators and staff alerts..



### MVP scope

1. **Web funnel(primary entry)** — marketing/landing page, teaser preview of the map/status value, signup, **Stripe Checkout**(2-wk free trial then $35/mo or $200/yr; card captured via Stripe), account/billing page(Stripe Customer Portal,, cancel/update/refunds,, and post-purchase app install CTA(deferred deep link/fire install..
2. **iOS app** — searchable/filterable map centered on user location; market detail screens with address, hours, schedule, seasonality, categories of items, and current status..
3. **Status model** — markets have a recurring schedule(day-of-week pattern)plus an explicit status "today": `open today (confirmed)`, `closed`, `modified today (e.g., early close)`, `unconfirmed — schedule last verified {date}`. Status shows in list and detail..
4.. **Membership(web, Stripe)** — 2-week free trial, then $35/month or $200/year via Stripe; web purchase unseals member content across web+app(server-side entitlement mirroring Stripe subscription..
5.. **Membership(iOS, StoreKit)** — same plan via StoreKit 2 IAP(identical price or better), trial granted by App Store, entitlement validated server-side via App Store Server API(signed transactions,+ Server Notifications V2 for renewals/expiry/grace; restore purchases supporteD; no in-app links to web checkout..
6.. **Operator claim + status updates** — an operator claims a market via a phone/email-verified code(from web or in-app link), then updates today's status and recurring schedule changes with a simple form(2-minute flow, on web) — reflects in the app in minutes. Staff verify the claim..
7.. **Alerts** — favorites + alert preference per market; "market you follow changed status today" via push notification(and in-app alerts center..
8.. **Admin(web console)** — staff seeds/imports, verifies, edits, suspends claims; view status-freshness health dashboards and dispute list..
9.. **Teaser/paywall** — unauthenticated users see a bounded preview(a few markets, blurred/watermarked, with "last confirmed" hint) and are routed to the web funnel(primary) or in-app paywall(secondary; per Apple rules no in-app link out to web checkout, so in-app users face the StoreKit sheet directly..



### Post-MVP scope

- National producer/vendor pages and standings(rank via freshness), producer self-claim..
- Android and/or full web map app(reuse BaaS backend and API; cross-platform path: SwiftUI→maybe Kotlin Multiplatform later, or keep native.
..
- Reviews/community..
- Producer subscriptions / featured placement / ads..
- Weather-API integration to auto-flag probable closers for operators..
- B2B subscriptions for tourism boards, journalists, data agreements..
- Marketplace analytics: shopper footfall(derived from check-ins/opt-in location)sold back sanctioned..
- Smart watch / widgets / lock-screen weather-closure complications..



## User stories

1. As a shopper, I land on the web site, see what rfg offers, subscribe with my card via Stripe, then install the appand my membership is already there..
2. As a shopper, I open the app, find markets near me on the map and see "open today (confirmed)" on the row, so I know it's worth driving these..
3. As a shopper, I can open a market page and see today's status, source(operator vs staff vs system),and last-confirmed timestamp, so I can trust it..
4.. As a shopper, I can favorite markets and choose "only show me confirmed-open today,"and get a push when a favorite market's status changes..
5.. As an operator, I claim my market by receiving a verification code, then change today's status per 2 minutes once a week from a web link,and it reflects in the app immediately..
6.. As an operator, I get an easy reminder(email/text)if I haven't updated in a week, so my market never shows stale..
7.. As staff, I import a public directory snapshot,and claims,and dispute a vanished market(shopper alert/refund..
8.. As staff, I see a dashboard of "markets with no fresh status" to keep freshness > 70%..



## Core flows

1.. **Discovery(web)→ app** → marketing/landing → teaser → signup + Stripe checkout → entitlement → install iOS app (deep link/fire install→ membership present→ repeat use in app..
2.. **Discovery(in-app)→ paywall** → teaser map → StoreKit sheet(Apple-mandated; no external purchase link)→ IAP → entitlement→ full map..
3.. **Subscription lifecycle** — Stripe webhook(web purchases) / App Store Server Notifications(in-app)→ update `Entitlement` mirror→ gate content server-side; cancel/refund via Stripe Customer Portal or App Store manage/restore..
4.. **Operator status** → claim request → staff approve or auto-approve after verification → operator sets status(web)→ audit row written → push alerts fanned out to followers → map reflects..
5.. **Stale workflow** → scheduler computes markets without a fresh status → reminders to operator; after N days, market auto-downgraded to"Schedule last verified fallback: date"and surfaced in staff queues..
6.. **Curation** — monthly staff session: re-verify markets our public contacts changed; suspend stale/unreachable..



## Roles / permissions

| Role | Can | Cannot |
|------|-----|--------|
| Guest(web/app)| See teaser listing(limited fields, watermark; web CTA to signup; in-app StoreKit paywall) | See full details, status history, filters, alerts |
| Member | Everything in MVP: full map, filters, detail, status, alerts, favorites(on web+app; bought via Stripe or StoreKit) | Admin/moderation ops |
| Operator(claim holder)| Update claim of market's status/schedule via limited web form | Have the final say on listings that staff flagged; changes are audit-attributed |
| Staff Curator | Import, verify, claim, suspend, dispute resolve, refunds | (nothing above their escalation) |
| System | Sends reminders, downgrades stale markets, computes status by schedule defaults | Is the final decision-maker; auditability expects system only acts on policy |


Reference(trust note): System/automation can *propose*and*execute policy-defined* actions(e.g., stale downgrade)but the audit/event log records the actor = `system` and the policy version that justified it.. They can keep the operator's claim/approval as the decision..



## Information architecture

- **Web funnel**: Landing(marketing + teaser)→ Signup/Checkout(Stripe)→ Welcome/app-install CTA→ Account/Billing(Stripe Customer Portal..
- **iOS app**: Tab bar: **Map**(primary)/**Favorites + Alerts**/**Settings/Account**.. Guest state: teaser map + StoreKit paywall sheet, then join funnel(also links to web signup for web-funnel users outside the app; no in-app link to *pay* on web..
- **Operator web**: landing → claim/verify → status form → status history..
- **Staff web console**: tabs: Directory / Claims queue / Recent operator status edits / Stale health / Subscriptions & refunds..



### Screen / surface list

**Web funnel**
1.. Marketing/landing page(teaser preview, value copy, pricing($35/mo, $200/yr,, 2-wk trial), signup CTA..
2.. Signup / Stripe Checkout(credit card, trial terms, email capture; post-purchase app install CTA..
3.. Account / billing(Stripe Customer Portal: manage, cancel, update card, receipts; membership status/expiration; app install/deep link..

**iOS app**
4.. Guest teaser map(blurred pins, watermark)with join CTA(paywall sheet..
5.. Member map view(filters: today-only, distance, categories, favorites; clustered pins..
6.. Market detail(status banner top, address/geo, schedule, categories, "verified by" line, claim-a-market CTA for operators..
7.. Search results list with per-market "open today (confirmed)" badges..
8.. Paywall sheet(StoreKit product: 2-wk trial → $35/mo or $200/yr; restore purchase link; terms/privacy links; **no web checkout link** per Apple rules..
9.. Favorites + alerts settings(per-market push on/off..
10.. Account/billing/cancel/restore screen(in-app status from StoreKit; manage via App Store; for web-purchased memberships show source(Stripe)and billing handled on web..
11.. Settings: notification permissions prompt(contextual after favorite),units, region(nearby location permission..

**Web (operator/staff)**
12.. Operator claim / verify page(s..
13.. Operator status form + status history..
14.. Staff dashboard(health, fresh, stale, disputes..
15.. Staff import + claim approval page..



## API design(v1, REST, JSON)

Public:
- `GET /v1/markets` — search/filter paginated; guest returns title/teaser only(fields filtered); member returns full..
- `GET /v1/markets/:id` — full detail for member..
- `GET /v1/markets/:id/status` — current status + source + timestamp..
- `GET /v1/health/coverage` — admin: % markets with fresh status this week..

Member:
- `POST /v1/favorites`
- `GET /v1/favorites` with freshness
- `POST /v1/alerts`(rules: on_change, daily_at; channel: push)

Entitlement:
- `POST /v1/entitlements/stripe/webhook` — Stripe webhook(verified signature)→ update membership mirror..
- `POST /v1/entitlements/apple` — send App Store `signedTransaction`/`signedRenewalInfo`; server validates via App Store Server API → grants/revokes `member` scope..
- `POST /v1/entitlements/apple/notifications` — App Store Server Notifications V2(JWS-verified)for renewals, expiry, grace, refunds..
- `GET /v1/entitlements/me` — current plan, status, period, expiration, channel(web|app_store)(drives paywall/gating states..

Operator(auth required by role, via web):
- `POST /v1/markets/claim` — claims(hashed phone/email verification)
- `POST /v1/claims/:id/verify`
- `POST /v1/markets/:id/status` — create new status event(idempotency key required)
- `PUT /v1/markets/:id/schedule`

Versioning: `/v1` frozen for launch; `/v2` for breaking. All writes idempotent on `Idempotency-Key`. Travel requestsand writes separated; status creation is a write-only event store, reads resolve latest..



## Data model(MVP, core entities)

- `Member`(id,, provider_user_id, email, name,, created/updated)
- `Market`(id,, usda_id nullable,, name,, lat,, lng,, street,, city,, state,, zip,, website,, phone,, photo,, categories[] ,, curated: bool,, source: system|usda|staff|operator-claimed,, status: verified|stale,, created_by,, updated_at)
- `Schedule`(id,, market_id,, day_of_week,, start/end time,, recurrence: weekly|biweekly|monthly|seasonal,, season_start/end,, notes)
- `StatusEvent`(id,, market_id,, status: open|closed|modified,, hours_override,, note,, source: operator|staff|system,, actor_id,, idempotency_key UNIQUE,, version,, created_at)— write-only, query latestById
- `Claim`(id,, market_id,, operator_account_id,, verification_method,, verified_at,, revoked_at,, status: pending|active|revoked)
- `OperatorAccount`(id,, name,, email/phone,, markets[] ,, last_activity)
- `Entitlement`(id,, member_id,, provider: stripe|app_store,, channel: web|ios,, plan,, external_subscription_id(Stripe sub id | Apple original_transaction_id),, status: active|trialing|past_due|canceled|expired,, current_period_start/end,, cancel_at,, grace_period_expiry,, updated_at) — mirror of billing state(Stripe & Apple are sources of truth; this cached projection drives server-side gating; one row per member per channel..
- `Favorite`(member_id,, market_id)
- `Alert`(member_id,, market_id,, channel: push,, trigger: on_change|daily,, active)
- `AuditLog`(actor_type/actor_id,, action,, target,, before/after JSON,, id)

Notes: `StatusEvent` is append-only(records immutable. Market effective status = most recent `StatusEvent.status`. Stale is derived(computed `fresh := last StatusEvent < 7 days OR staff-check < 30 days`), never stored as trusted. `Entitlement` rows for Stripe and Apple channels are reconciled separately; user is `member` iff any active/trialing entitlement exists..



## Notification model

- **Member alerts**: new `StatusEvent` for a market → push via APNs to followers with `on_change`, plus in-app alert center; daily backup digest set planned..
- **Stale follow-up**: system job sends operator reminder when > schedule lastUpdate `stale_at`(7 days,, then an escalation email to staff at day 14 if no operator confirmed..
- **Payment lifecycle**: Stripe webhooks / App Store Server Notifications → trial ending, grace period, expiry → suspend/pause access → rejoin push/email(pointing to web funnel or in-app paywall; per Apple rules, in-app payment rejoin uses StoreKit not web links..
- Notifications point into the product(link to the market page / alert settings,, never replace it..



## Security / audit / trust model

- Server-side paywall enforced by API middleware(`member` scope on all content routes relative to guest teaser.. Client-only gating is never sufficient..
- `StatusEvent` append-only with `source`and operator id; disputes resolved via staff override(new event labeled `staff_override`), not mutation..
- Operators verified via phone/email one-time code bound to market; claim cannot auto-approve without proof(or staff action..
- **Stripe**: webhooks verified by signature; idempotent per event; customer data via Stripe(PCI scope avoided entirely — never touch raw card data..
- **StoreKit**: validate `signedTransaction`/`signedRenewalInfo` JWTs via App Store Server API; App Store Server Notifications V2 verified by JWS signature; idempotent by `original_transaction_id`..
- **Apple compliance guardrails**: the app MUST NOT link to or promote web checkout from inside the app(directs users to IAP instead);IAP price ≤ web price(same $35/mo, $200/yr);restore purchases supported;"Sign in with Apple" offered alongside other login methods(required if app uses third-party/federated sign-in.. Full map content behind paywall is fine via IAP for a digital membership; operators/staff are non-consumer web tooling..
- OWASP-baseline: sanitize note fields,, rate limit claim/verify endpoints,, idempotency keys on all writes,, audit log for refunds/reversaland claim revocations..
- Least privilege: staff console role-card separated from operator tooling; disallowed cross-market actions..
- PII scope: email/phone only where needed(alerts/claims;; phone used for claims&alerts,, non-ad-serving.. No ad philosophy..



## Edge casesand failure modes

- **Market didn't report today** — status falls back to `unconfirmed — schedule last verified <date>`; UI won't say "open."
- Ruling schedule vs operator Explicit overrides; override wins until nextop date,,then revert to schedule basis..
- Season ends / market shuts down — staff suspension + member alert for favorites..
- Weather closures — operator status closed with note; alert fans out..
- Duplicate claims on one market — staff resolves,, conflicting claim blocked; pending merge request flow..
- Operator goes silent — stale escalation → staff re-verification..
- **Dual-channel billing drift** — a member subscribes on web(Stripe)and in-app(StoreKit)and gets double-billed: `Entitlement` reconciliation must treat one active subscription per member; the app and web both surface "you're already a member — manage/cancel via source channel.". Refund/chargeback on one channel must not strand the other; staff dispute tooling..
- **Apple grace/billing retry** — grace period + billing retry via StoreKit; entitlement expiry mid-week pauses accessand paywall resurfaces(in-app via StoreKit;; restore purchases re-grant with no data loss..
- **Web subscriber opens app without login** — "Sign in with Apple"/email magic link pairs web account and app account(match by email/Apple identity) so membership carries over; install/deep link carries session token..
- **No network / poor signal** — map degrades gracefully(show cached markets with "last updated" stamp; no hard crash; paywall can wait..
- Timezone: markets be shown in *local market time*; "today" computed at request for member's TZ,,but status is set for market TZ..
- Import duplication → USDA matches by name+state+fuzzy; staff confirms; merge tool..
- Empty states:"No markets open today near you — expand / it's seasonal now(+ turn on alerts..
- Push opt-out: member with notifications off still sees in-app alert center; status badge on app icon optional..



## Success metrics

- **Speed-to-launch(goal)**: MVP(iOS app + web funnel)in the App Store(TestFlight → public release)within ~2–3 months of solo dev start; measured by milestone dates not vanity..
- Activation: web funnel visitors → trial start ≥ 5%(monthly;; Stripe web trial→paid ≥ 35%;StoreKit IAP trial→paid ≥ 35%..
- Retention: month-3 member retention ≥ 50%; churn rooted at the top at 25%..
- Freshness health: ≥ 70% of markets with status within last 7 days; ≥ 90% within 30..
- Operator coverage: ≥ 15% of listed markets claimed by operators..
- Trust: refunds < 1.5% of MRR; "wrongly listed open" report / support case rate < 0.5% of members/mo..
- Prime KPI:"days a member uses the app*" — engagement before and after subscribing(teaser vs paid)proving value..
- Funnel split: web-purchased memberships vs in-app(IAP)memberships — web target ≥ 60%(Stripe fees+commission lower than Apple's 30/15%..
- App Store ratings ≥ 4.5★and support tickets < 2% of installs/mo(polish signal..



## Rollout plan

1.. **Week 0–2** — seed import(USDA,, merge/dedupe,, staff tool scaffold);Supabase project; data model migration; web landing/signup skeleton.
..
2.. **Week 3–6** — iOS app core: map + market detail + teaser/paywall + StoreKit subscription; web funnel: Stripe Checkout + Customer Portal + post-purchase app-install CTA; operator claim/status web flow; staff console basics.. TestFlight alpha with curated Portland,, OR region..
3.. **Week 7–10** — alerts/push,, favorites,, stale automations,, dual-channel entitlement reconciliation,, restore purchases,, Apple compliance pass(no external purchase links in-app,, same-or-better IAP price,, Sign in with Apple,, review notes);polish pass(animation,, empty/error states,, accessibility);TestFlight beta with 20–50 pilot users + 10–15 market operators(personal outreach,, operator feedback loop..
4.. **Launch(month 3)** — App Store release + web funnel live,2 metro launch(Portland,, OR + Austin,, TX)with operator outreach,, monitor freshness/refunds/churn;iterate weekly..
5.. **M1+** — operator self-serve national(claim links in listings,, reminders,, coverage push top-40 metros;; marketing(instagram,, events,, restaurants,, food media;;measure web-vs-IAP split and push traffic toward web funnel where permitted(marketing/email only — not in-app..



## Open questions

1.. Backend: **Supabase vs Firebase** — both cover Postgres/auth/push/realtime;pick by DX/tooling comfortand nearest-to-zero custom infra.(Assumption default: Supabase.)
2.. Do operators manage status via **web only**(recommended,, no install friction)or also in-app?— Assumption: web only at MVP..
3.. Apple compliance for dual-channel: web+Stripe is permitted **if** in-app IAP exists at same-or-better price,and the app never links out to web checkout(in-app user who hits paywall faces StoreKit sheet only.. Confirm the "same or lower" wording for annual anchor($200/yr)vs monthly($35/mo)IAP with Apple's review during submission..
4.. Is"curated" staff at MVP really 1 staff must-have,, or community in post-MVP(fairly long but MVP can be just staff + open importwith support)..
5.. Do members get city/state-level weekly digest or only per-market alerts?Default: per-market push + digest later..
6.. Is there demand for"market availability public via link/share for invitations"(status visible only member)— current MVP: status not public outside membership,, except handle watermark in teaser..



## 3. Notes

### Assumptions(made to fill this spec

- Membership model = consumer subscription;operators contribute for free / understaffed(per chosen answer..
- National scope per chosen answer;but freshness target per metro realistically;macro‑health metric defines national coverage..
- **iOS app + web funnel**: native SwiftUI app(deployment target iOS 16+,≈95% of active iPhones);consumer web app is funnel+account only(marketing, signup, Stripe,, app-install CTA;not a full web map at MVP.. No Android at MVP..
- **Speed-first stack(assumed,, not decided::SwiftUI + MapKit + SwiftData + StoreKit 2;web: Next.js + Stripe Checkout/Customer Portal;backend Supabase(BaaS: Postgres + Auth + Realtime + Edge Functions + APNs push;;operator+staff as minimal web on same BaaS.. No custom server at MVP unless BaaS gap arises..
- Seed from USDA Local Food Directories(public,, real dataset.. Verified: exists today,, last updated periodically — but exact schema/format not inspected yet for this spec..
- MVP goals: 2-minute operator experience;;freshness > 70% in launch metros;;trial→paid ≥ 35%;iOS app + web funnel in the App Store within ~2–3 months..
- Apple commission(30% standard,, 15% small-business)applies only to in-app IAP purchases;;web Stripe purchases avoid Apple's cut(fees ~2.9%+30¢).Prefer routing subscriptions to web where permitted(marketing/email;not via in-app links..


### Risks

- **Apple App Review(dual-channel** — must pass commerce review(pricing parity,, trial terms,, no in-app external-purchase links,, restore,, Sign in with Apple for account-based apps.. Mitigate: complete metadata,, test accounts,, mock operator demo,, review-notes value pitch..
- **Data reliability is the product** — the value prop lives or dies on status truth;seed data USDA will be stale/rusty → hard rule: every listing shows a verified-by dateand"unconfirmed" state;operator self-serve is the fix.. Operator activation is the top risk..Mitigate: onboarding outreach,, instant claim,, minimal form..
- **National + small curation staff** — national seed coverage will momentarily be low-freshness;might hurt the perception of"membership-only map"→ market honesty,, filter"only show active" teaser..
- **Churn on refunds** — if freshness drops,, refund rate rises.. Monitoring is a must(metric above..
- **Web-vs-IAP economics** — Apple takes 30%(or 15% small business)on IAP;Stripe web subscriptions are far cheaper.. Keep web funnel primary and never route in-app users to web to pay(Apple rule;;drive web subscriptions via external marketing only..
- **Dual-channel double-billing/account linking** — web subscriber + in-app purchase on same account must reconcile to one entitlement;account pairing(Sign in with Apple / email matching)is critical;build early..
- **USDA directory licensing quality/schema** — must double-check terms for resale/derivative publishingand import fields..
- **Paywall friction** — if map teaser is too strong,, no subscriptions;if too weak,, no perceived value.. Test both at launch..
- **Push permission friction** — alerts are core value;ask for notifications contextually(after favorite,, not at cold start,, since iOS prompts are one-shot..
- **Operator contact data** — cold outreach needs correct phone/email;derive from web searchand public listings;expects low ROI unless outreach is personalized..


### What was NOT verified

- USDA Local Food Directories schema,, license,, refresh cadence,,and whether exports are provided for bulk import..
- Bot detection/geofencing for operator claim code delivery(phone vs email)—follow-up engineering decision..
- Exact Supabase/Firebase capability parity for APNs push + scheduled jobs at MVP—verify before committing,,but both are fast paths..
- Final App Review posture for "web+Stripe funnel + in-app StoreKit subscription" with same-or-better pricing and no in-app links out — highly standard pattern,,but the annual-vs-monthly price relationship and trial handling must be confirmed with Apple during submission..
- Type of market(see"producer chain" beyond farmers—CSAs/food hubs/phily)beyond MVP;not scoped..