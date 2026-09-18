---
caseId: "tca"
locale: "it"
slug: "tennis-club-ambrosiano"
client: "Tennis Club Ambrosiano"
title: "Un'unica anagrafica al posto di sistemi scollegati"
excerpt: "Iscrizioni, scuola tennis, summer camp ed eventi: una segreteria che lavorava su strumenti scollegati, unificata su un'unica anagrafica invece di ricostruita a mano."
sector: "Circolo sportivo"
featured: true
cover: "/images/work/tca.jpg"
coverAlt: "I campi in terra rossa del Tennis Club Ambrosiano"
services: ["Business Systems", "Digital Experience", "Integrations", "Automation"]
metrics:
  - value: "353"
    label: "Eventi storici importati"
    note: "Dal gestionale precedente"
  - value: "220"
    label: "Anagrafiche unificate"
    note: "Backfill sulle persone esistenti"
  - value: "192"
    label: "Form deduplicati"
    note: "Stessa persona, richieste diverse"
technologies: ["Astro", "TinaCMS", "Next.js", "Supabase", "PerfectGym API", "Vercel Cron"]
architecture: ["Sito e canali", "Normalizzazione", "Deduplica", "Anagrafica unica", "CRM e operazioni"]
relatedCase: "ronchiverdi"
seoTitle: "Tennis Club Ambrosiano — Case study Ready2Digital"
seoDescription: "Come Ready2Digital ha unificato l'anagrafica del Tennis Club Ambrosiano: sito pubblico e CRM di segreteria su un'unica fonte di dati."
---

## Context

Il Tennis Club Ambrosiano gestisce iscrizioni, scuola tennis, summer camp ed eventi attraverso una segreteria che riceve richieste da più canali — sito, email, telefono — e deve tenerne traccia in modo coerente.

## Challenge

Il sito era separato dalla segreteria: i form di iscrizione arrivavano via email, la stessa persona poteva comparire più volte con dati leggermente diversi, e lo storico degli eventi del gestionale precedente non era mai stato portato dentro il sistema nuovo. Il risultato era un'anagrafica sfaldata: nessuno poteva dire con certezza quante persone frequentassero davvero il circolo.

## Understanding the process

Prima di scrivere il codice della migrazione, abbiamo mappato da dove arrivano davvero i dati di una persona — un form del sito, un'iscrizione a scuola tennis, un evento prenotato, un contatto storico nel gestionale precedente — e su quali campi (nome, cognome, email, telefono) si può stabilire con sicurezza che due righe sono la stessa persona.

## Solution

Un sito statico veloce e un CRM separato che condividono lo stesso database: il sito resta semplice da mantenere, la segreteria lavora su un'anagrafica sola. La deduplica gira sul database con una regola di corrispondenza esplicita, non su un foglio che qualcuno deve ricontrollare a mano.

## What we built

- Sito pubblico per iscrizioni a scuola tennis, summer camp, eventi e newsletter — statico, pensato per restare veloce anche senza un backend dietro ogni pagina.
- CRM di segreteria con pipeline unica per le richieste (nuovo → in gestione → vinto/perso), storico dei passaggi e permessi diversi per ruolo.
- Migrazione dello storico dal gestionale precedente, con deduplica automatica delle anagrafiche già esistenti.
- Agenda condivisa fra gli appuntamenti prenotati dal sito e i task interni della segreteria.
