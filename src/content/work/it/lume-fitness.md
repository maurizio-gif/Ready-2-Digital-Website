---
caseId: "lume"
locale: "it"
slug: "lume-fitness"
client: "Lume Fitness"
title: "Dal lead alla gestione del cliente, in un unico sistema"
excerpt: "Una rete di palestre multi-sede in apertura: dalla prevendita degli abbonamenti prima ancora che la sede fisica apra, alla gestione del cliente una volta iscritto."
sector: "Palestre multi-sede"
featured: true
cover: "/images/work/lume.jpg"
coverAlt: "Il catalogo corsi del sito Lume Fitness"
services: ["Digital Experience", "Business Systems", "Automation", "Integrations"]
metrics: []
technologies: ["Astro", "React", "Supabase", "Stripe", "PerfectGym API", "n8n", "Airtable"]
architecture: ["Lead", "Prevendita", "Pagamento", "Gestionale", "Cliente attivo"]
relatedCase: "athlon"
seoTitle: "Lume Fitness — Case study Ready2Digital"
seoDescription: "Come Ready2Digital gestisce il ciclo di vita del cliente per la rete multi-sede Lume Fitness: dalla prevendita al CRM, fino al gestionale."
---

## Context

Lume Fitness apre più sedi (Macerata, Montecassiano, Piediripa) in momenti diversi. Ogni apertura ha bisogno di vendere abbonamenti prima ancora che la sede fisica sia pronta, e di gestire chi si iscrive senza sapere ancora quando potrà davvero entrare in palestra.

## Challenge

Una prevendita non è una vendita normale: ha una scadenza (il prezzo agevolato vale solo fino a una data), può essere fatta online o allo sportello da un consulente in loco, e deve confluire nello stesso gestionale con cui, il giorno dell'apertura, la sede lavorerà tutti i giorni. Tenere questi due momenti — prevendita e gestione ordinaria — su sistemi diversi avrebbe significato migrare a mano ogni contratto il giorno dell'apertura.

## Solution

Un sito per sede con countdown e prezzo agevolato, un checkout online, e un link riservato ai consulenti che permette di registrare un'iscrizione fatta in loco anche dopo la scadenza online. Ogni iscrizione — arrivata online o allo sportello — crea direttamente il contratto nel gestionale della sede, non in un sistema temporaneo da svuotare dopo.

## What we built

- Landing per sede con piani prezzo, countdown alla scadenza della prevendita e chiusura automatica del checkout online alla data limite.
- Pagamento online (Stripe), sia a rata unica sia con addebito ricorrente.
- Integrazione con il gestionale della palestra: ogni iscrizione — online o raccolta da un consulente in sede — crea anagrafica e contratto senza doppio inserimento.
- Automazioni per l'attribuzione della campagna di provenienza e per le email di follow-up nei giorni prima della scadenza.
- Il sito definitivo del club (corsi, sedi, abbonamenti, verifica socio), pensato per restare in piedi anche dopo la fine della fase di prevendita.
