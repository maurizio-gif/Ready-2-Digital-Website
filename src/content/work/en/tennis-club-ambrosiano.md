---
caseId: "tca"
locale: "en"
slug: "tennis-club-ambrosiano"
client: "Tennis Club Ambrosiano"
title: "One customer record instead of disconnected systems"
excerpt: "Enrolments, tennis school, summer camp and events: a front office running on disconnected tools, unified onto a single customer record instead of rebuilt by hand."
sector: "Sports club"
featured: true
cover: "/images/work/tca.jpg"
coverAlt: "The clay courts of Tennis Club Ambrosiano"
services: ["Business Systems", "Digital Experience", "Integrations", "Automation"]
metrics:
  - value: "353"
    label: "Historic events imported"
    note: "From the previous management software"
  - value: "220"
    label: "Records unified"
    note: "Backfilled onto existing people"
  - value: "192"
    label: "Forms deduplicated"
    note: "Same person, different requests"
technologies: ["Astro", "TinaCMS", "Next.js", "Supabase", "PerfectGym API", "Vercel Cron"]
architecture: ["Website and channels", "Normalisation", "Deduplication", "Single record", "CRM and operations"]
relatedCase: "ronchiverdi"
seoTitle: "Tennis Club Ambrosiano — Ready2Digital case study"
seoDescription: "How Ready2Digital unified the Tennis Club Ambrosiano's customer records: a public website and a front-office CRM sharing one source of data."
---

## Context

Tennis Club Ambrosiano runs enrolments, its tennis school, a summer camp and events through a front office that receives requests across several channels — the website, email, the phone — and needs to keep track of all of them consistently.

## Challenge

The website was disconnected from the front office: enrolment forms arrived by email, the same person could show up more than once with slightly different details, and the event history from the previous management software had never made it into the new system. The result was a fragmented customer base — nobody could say with confidence how many people actually used the club.

## Understanding the process

Before writing a line of migration code, we mapped where a person's data actually comes from — a website form, a tennis-school enrolment, a booked event, a historic record in the old software — and which fields (first name, last name, email, phone) can safely establish that two rows are the same person.

## Solution

A fast static website and a separate CRM sharing the same database: the website stays simple to maintain, the front office works off a single customer record. Deduplication runs on the database with an explicit matching rule, not on a spreadsheet someone has to double-check by hand.

## What we built

- A public website for tennis-school enrolments, the summer camp, events and the newsletter — static, built to stay fast without a backend behind every page.
- A front-office CRM with a single pipeline for requests (new → in progress → won/lost), a history of every stage change, and role-based permissions.
- Migration of the historic data from the previous management software, with automatic deduplication against existing records.
- A shared calendar for appointments booked through the website and the front office's own internal tasks.
