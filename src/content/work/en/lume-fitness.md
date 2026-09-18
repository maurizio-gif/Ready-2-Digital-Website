---
caseId: "lume"
locale: "en"
slug: "lume-fitness"
client: "Lume Fitness"
title: "From lead to customer management, in one system"
excerpt: "A multi-site gym network opening in stages: from pre-selling memberships before a location even exists, to managing the customer once they've joined."
sector: "Multi-site gyms"
featured: true
cover: "/images/work/lume.jpg"
coverAlt: "The class catalogue on the Lume Fitness site"
services: ["Digital Experience", "Business Systems", "Automation", "Integrations"]
metrics: []
technologies: ["Astro", "React", "Supabase", "Stripe", "PerfectGym API", "n8n", "Airtable"]
architecture: ["Lead", "Pre-sale", "Payment", "Management software", "Active member"]
relatedCase: "athlon"
seoTitle: "Lume Fitness — Ready2Digital case study"
seoDescription: "How Ready2Digital handles the customer lifecycle for the multi-site Lume Fitness network: from pre-sale to CRM, into the management software."
---

## Context

Lume Fitness opens several locations (Macerata, Montecassiano, Piediripa) at different times. Every opening needs to sell memberships before the physical site is even ready, and to manage people who join without yet knowing exactly when they'll be able to walk in.

## Challenge

A pre-sale isn't an ordinary sale: it has a deadline (the discounted price only holds until a set date), it can happen online or at a desk through a local sales rep, and it needs to land in the same management software the site will run on every day once it opens. Keeping those two moments — pre-sale and day-to-day operations — on separate systems would have meant migrating every contract by hand on opening day.

## Solution

A per-site landing page with a countdown and a discounted price, an online checkout, and a reserved link for sales reps that lets them register an in-person sign-up even after the online deadline has passed. Every sign-up — online or at the desk — creates the contract directly in the site's management software, not in a temporary system someone has to empty out later.

## What we built

- A per-site landing page with pricing tiers, a countdown to the pre-sale deadline, and an automatic checkout shutdown once that date passes.
- Online payment (Stripe), both as a single instalment and as a recurring charge.
- Integration with the gym's management software: every sign-up — online or collected by a rep on site — creates the record and the contract without double entry.
- Automation for attributing where a sign-up came from and for the follow-up emails in the days before the deadline.
- The site's permanent website (classes, locations, memberships, member verification), built to keep standing once the pre-sale phase is over.
