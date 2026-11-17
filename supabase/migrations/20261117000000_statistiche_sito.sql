-- Statistiche del sito: visitatori, sessioni, pagine viste ed eventi, e i lead del
-- modulo contatti collegati alle visite che li hanno portati.
--
-- Chi scrive: solo le funzioni Vercel (api/track.js, api/contact.js) con la chiave
-- service_role, attraverso le due funzioni qui sotto. RLS è attiva su ogni tabella e
-- non ci sono policy: anon e authenticated non leggono e non scrivono niente.
--
-- Cosa NON c'è: indirizzi IP (la funzione li usa solo per il paese, che arriva già
-- calcolato da Vercel, e non li salva), user agent completi, fingerprint.
--
--   visitatori  uno per browser che ha accettato i cookie analitici (cookie r2d_vid)
--   sessioni    una per visita: 30 minuti di inattività chiudono la sessione (cookie r2d_sid)
--   eventi      pagine viste ed eventi (chat, contatto). Senza consenso: solo pagine viste
--               anonime, senza visitatore né sessione, per avere i totali di traffico
--   lead        chi ha lasciato i dati dal modulo; collegato a visitatore e sessioni
--               solo se quel browser aveva accettato i cookie analitici

create table public.lead (
  id uuid primary key default gen_random_uuid(),
  creato_il timestamptz not null default now(),
  nome text not null,
  cognome text not null,
  email text not null,
  cellulare text not null,
  azienda text,
  interessi text[] not null default '{}',
  progetto text not null,
  lingua text not null default 'it',
  consenso_marketing boolean not null default false,
  visitatore_id uuid,
  sessione_id uuid,
  chat_sessione text
);
create index lead_email_idx on public.lead (lower(email));
create index lead_creato_idx on public.lead (creato_il desc);

create table public.visitatori (
  id uuid primary key,
  primo_accesso timestamptz not null default now(),
  ultimo_accesso timestamptz not null default now(),
  sessioni integer not null default 0,
  lead_id uuid references public.lead (id) on delete set null
);
create index visitatori_lead_idx on public.visitatori (lead_id) where lead_id is not null;

create table public.sessioni (
  id uuid primary key,
  visitatore_id uuid not null references public.visitatori (id) on delete cascade,
  lead_id uuid references public.lead (id) on delete set null,
  iniziata_il timestamptz not null default now(),
  ultima_attivita timestamptz not null default now(),
  durata_s integer not null default 0,
  pagine integer not null default 0,
  pagina_ingresso text,
  pagina_uscita text,
  referrer text,
  sorgente text,       -- utm_source, o il dominio del referrer, o «diretto»
  mezzo text,          -- utm_medium, o «referral» / «organico» / «social» / «nessuno»
  campagna text,
  utm_term text,
  utm_content text,
  click_id text,       -- gclid / fbclid / msclkid, se c'era
  paese text,
  regione text,
  citta text,
  dispositivo text,    -- desktop / mobile / tablet
  browser text,
  sistema text,
  lingua_sito text,
  lingua_browser text,
  schermo text,
  chat_sessione text,  -- la conversazione con l'agente AI (r2d_chat_sito / r2d_chat_diagnosi in n8n)
  nuovo_visitatore boolean not null default true
);
create index sessioni_visitatore_idx on public.sessioni (visitatore_id, iniziata_il desc);
create index sessioni_lead_idx on public.sessioni (lead_id) where lead_id is not null;
create index sessioni_iniziata_idx on public.sessioni (iniziata_il desc);

create table public.eventi (
  id uuid primary key,
  creato_il timestamptz not null default now(),
  tipo text not null check (tipo in ('pagina', 'evento')),
  nome text,                 -- per gli eventi: chat_aperta, chat_messaggio, contatto_inviato…
  visitatore_id uuid references public.visitatori (id) on delete cascade,
  sessione_id uuid references public.sessioni (id) on delete cascade,
  percorso text not null,
  titolo text,
  lingua_sito text,
  durata_ms integer,         -- tempo con la pagina visibile, aggiornato quando la si lascia
  dati jsonb,
  -- solo per le pagine viste anonime (senza sessione), per poterle comunque suddividere
  paese text,
  dispositivo text,
  sorgente text
);
create index eventi_creato_idx on public.eventi (creato_il desc);
create index eventi_sessione_idx on public.eventi (sessione_id, creato_il) where sessione_id is not null;
create index eventi_visitatore_idx on public.eventi (visitatore_id) where visitatore_id is not null;
create index eventi_percorso_idx on public.eventi (percorso, creato_il desc) where tipo = 'pagina';

alter table public.lead add constraint lead_visitatore_fk foreign key (visitatore_id) references public.visitatori (id) on delete set null;
alter table public.lead add constraint lead_sessione_fk foreign key (sessione_id) references public.sessioni (id) on delete set null;

alter table public.lead enable row level security;
alter table public.visitatori enable row level security;
alter table public.sessioni enable row level security;
alter table public.eventi enable row level security;
revoke all on public.lead, public.visitatori, public.sessioni, public.eventi from anon, authenticated;

/* ------------------------------------------------------------------ */
/* traccia(p): una chiamata per ogni pagina vista, evento o uscita     */
/* ------------------------------------------------------------------ */
-- p = {
--   tipo: 'pagina' | 'evento' | 'uscita',
--   id: uuid dell'evento (lo genera il browser: «uscita» aggiorna la durata di quella pagina),
--   sostituisce: uuid della pagina vista anonima da togliere (consenso dato su quella pagina),
--   visitatore, sessione: uuid o null (null = nessun consenso: pagina vista anonima),
--   percorso, titolo, nome, dati, durata_ms, lingua_sito,
--   sessione_nuova: { referrer, sorgente, mezzo, campagna, utm_term, utm_content, click_id,
--                     lingua_browser, schermo },
--   paese, regione, citta, dispositivo, browser, sistema   (aggiunti dal server)
-- }
create or replace function public.traccia(p jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vis uuid := nullif(p ->> 'visitatore', '')::uuid;
  v_ses uuid := nullif(p ->> 'sessione', '')::uuid;
  v_id uuid := coalesce(nullif(p ->> 'id', '')::uuid, gen_random_uuid());
  v_tipo text := p ->> 'tipo';
  v_ora timestamptz := now();
  v_nuova jsonb := coalesce(p -> 'sessione_nuova', '{}'::jsonb);
  v_lead uuid;
  v_nuovo_vis boolean := false;
  v_ses_nuova boolean := false;
begin
  -- L'uscita da una pagina: tempo di permanenza e durata della sessione.
  if v_tipo = 'uscita' then
    update public.eventi
       set durata_ms = least(greatest((p ->> 'durata_ms')::integer, 0), 6 * 3600 * 1000)
     where id = v_id and tipo = 'pagina';
    if v_ses is not null then
      update public.sessioni
         set ultima_attivita = v_ora,
             durata_s = greatest(durata_s, extract(epoch from (v_ora - iniziata_il))::integer)
       where id = v_ses;
    end if;
    return;
  end if;

  if v_tipo not in ('pagina', 'evento') then
    return;
  end if;

  -- Senza consenso: solo la pagina vista, senza identificativi.
  if v_vis is null or v_ses is null then
    if v_tipo = 'pagina' then
      insert into public.eventi (id, tipo, percorso, titolo, lingua_sito, paese, dispositivo, sorgente)
      values (v_id, 'pagina', left(p ->> 'percorso', 300), left(p ->> 'titolo', 200), p ->> 'lingua_sito',
              p ->> 'paese', p ->> 'dispositivo', left(v_nuova ->> 'sorgente', 120))
      on conflict (id) do nothing;
    end if;
    return;
  end if;

  insert into public.visitatori (id) values (v_vis)
  on conflict (id) do update set ultimo_accesso = v_ora
  returning lead_id, (xmax = 0) into v_lead, v_nuovo_vis;

  insert into public.sessioni (
    id, visitatore_id, lead_id, iniziata_il, ultima_attivita, pagina_ingresso, referrer, sorgente, mezzo,
    campagna, utm_term, utm_content, click_id, paese, regione, citta, dispositivo, browser, sistema,
    lingua_sito, lingua_browser, schermo, nuovo_visitatore
  ) values (
    v_ses, v_vis, v_lead, v_ora, v_ora, left(p ->> 'percorso', 300), left(v_nuova ->> 'referrer', 500),
    left(coalesce(v_nuova ->> 'sorgente', 'diretto'), 120), left(coalesce(v_nuova ->> 'mezzo', 'nessuno'), 60),
    left(v_nuova ->> 'campagna', 200), left(v_nuova ->> 'utm_term', 200), left(v_nuova ->> 'utm_content', 200),
    left(v_nuova ->> 'click_id', 40), p ->> 'paese', p ->> 'regione', p ->> 'citta', p ->> 'dispositivo',
    p ->> 'browser', p ->> 'sistema', p ->> 'lingua_sito', left(v_nuova ->> 'lingua_browser', 20),
    left(v_nuova ->> 'schermo', 20), v_nuovo_vis
  )
  on conflict (id) do update
     set ultima_attivita = v_ora,
         durata_s = greatest(public.sessioni.durata_s, extract(epoch from (v_ora - public.sessioni.iniziata_il))::integer)
  returning (xmax = 0) into v_ses_nuova;

  if v_ses_nuova then
    update public.visitatori set sessioni = sessioni + 1 where id = v_vis;
  end if;

  if v_tipo = 'pagina' then
    -- Consenso dato su una pagina già contata in forma anonima: quella vista diventa questa.
    if nullif(p ->> 'sostituisce', '') is not null then
      delete from public.eventi where id = (p ->> 'sostituisce')::uuid and sessione_id is null and tipo = 'pagina';
    end if;
    insert into public.eventi (id, tipo, visitatore_id, sessione_id, percorso, titolo, lingua_sito)
    values (v_id, 'pagina', v_vis, v_ses, left(p ->> 'percorso', 300), left(p ->> 'titolo', 200), p ->> 'lingua_sito')
    on conflict (id) do nothing;
    if found then
      update public.sessioni
         set pagine = pagine + 1, pagina_uscita = left(p ->> 'percorso', 300)
       where id = v_ses;
    end if;
  else
    insert into public.eventi (id, tipo, nome, visitatore_id, sessione_id, percorso, lingua_sito, dati)
    values (v_id, 'evento', left(p ->> 'nome', 60), v_vis, v_ses, left(p ->> 'percorso', 300), p ->> 'lingua_sito', p -> 'dati')
    on conflict (id) do nothing;
    -- La conversazione con l'agente AI resta legata alla sessione.
    if p ->> 'nome' in ('chat_aperta', 'chat_messaggio') and (p -> 'dati' ->> 'chat') is not null then
      update public.sessioni set chat_sessione = left(p -> 'dati' ->> 'chat', 64)
       where id = v_ses and chat_sessione is distinct from left(p -> 'dati' ->> 'chat', 64);
    end if;
  end if;
end;
$$;

/* ------------------------------------------------------------------ */
/* registra_lead(p): il modulo contatti → lead + collegamento visite   */
/* ------------------------------------------------------------------ */
-- Restituisce l'id del lead. Se il browser aveva il consenso analitico (visitatore e
-- sessione presenti), il lead si collega al visitatore: tutte le sue sessioni, passate
-- e future, portano l'id del lead.
create or replace function public.registra_lead(p jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vis uuid := nullif(p ->> 'visitatore', '')::uuid;
  v_ses uuid := nullif(p ->> 'sessione', '')::uuid;
  v_lead uuid;
begin
  if v_vis is not null and not exists (select 1 from public.visitatori where id = v_vis) then
    v_vis := null;
  end if;
  if v_ses is not null and not exists (select 1 from public.sessioni where id = v_ses) then
    v_ses := null;
  end if;

  insert into public.lead (nome, cognome, email, cellulare, azienda, interessi, progetto, lingua,
                           consenso_marketing, visitatore_id, sessione_id, chat_sessione)
  values (p ->> 'nome', p ->> 'cognome', p ->> 'email', p ->> 'cellulare', nullif(p ->> 'azienda', ''),
          coalesce(array(select jsonb_array_elements_text(coalesce(p -> 'interessi', '[]'::jsonb))), '{}'),
          p ->> 'progetto', coalesce(p ->> 'lingua', 'it'), coalesce((p ->> 'consenso_marketing')::boolean, false),
          v_vis, v_ses, nullif(left(p ->> 'chat_sessione', 64), ''))
  returning id into v_lead;

  if v_vis is not null then
    update public.visitatori set lead_id = v_lead where id = v_vis;
    update public.sessioni set lead_id = v_lead where visitatore_id = v_vis;
  end if;

  return v_lead;
end;
$$;

revoke all on function public.traccia(jsonb) from public, anon, authenticated;
revoke all on function public.registra_lead(jsonb) from public, anon, authenticated;
grant execute on function public.traccia(jsonb) to service_role;
grant execute on function public.registra_lead(jsonb) to service_role;

/* ------------------------------------------------------------------ */
/* Viste per leggere i numeri (Table editor / SQL editor di Supabase)  */
/* ------------------------------------------------------------------ */
-- Pagine viste: tutte, con e senza consenso. Sessioni e visitatori: solo con consenso.
create view public.report_giornaliero with (security_invoker = true) as
select g.giorno,
       coalesce(pv.pagine_viste, 0) as pagine_viste,
       coalesce(pv.pagine_viste_anonime, 0) as di_cui_anonime,
       coalesce(s.sessioni, 0) as sessioni,
       coalesce(s.visitatori, 0) as visitatori,
       coalesce(s.nuovi_visitatori, 0) as nuovi_visitatori,
       s.durata_media_s,
       s.pagine_per_sessione,
       s.rimbalzo_pct,
       coalesce(l.lead, 0) as lead
from (
  select distinct (creato_il at time zone 'Europe/Rome')::date as giorno from public.eventi
  union select distinct (creato_il at time zone 'Europe/Rome')::date from public.lead
) g
left join (
  select (creato_il at time zone 'Europe/Rome')::date as giorno,
         count(*) as pagine_viste,
         count(*) filter (where sessione_id is null) as pagine_viste_anonime
  from public.eventi where tipo = 'pagina' group by 1
) pv using (giorno)
left join (
  select (iniziata_il at time zone 'Europe/Rome')::date as giorno,
         count(*) as sessioni,
         count(distinct visitatore_id) as visitatori,
         count(*) filter (where nuovo_visitatore) as nuovi_visitatori,
         round(avg(durata_s))::integer as durata_media_s,
         round(avg(pagine), 1) as pagine_per_sessione,
         round(100.0 * count(*) filter (where pagine <= 1) / nullif(count(*), 0), 1) as rimbalzo_pct
  from public.sessioni group by 1
) s using (giorno)
left join (
  select (creato_il at time zone 'Europe/Rome')::date as giorno, count(*) as lead from public.lead group by 1
) l using (giorno)
order by g.giorno desc;

create view public.report_pagine with (security_invoker = true) as
select percorso,
       count(*) as pagine_viste,
       count(distinct sessione_id) as sessioni,
       round(avg(durata_ms) filter (where durata_ms is not null) / 1000.0, 1) as tempo_medio_s,
       max(creato_il) as ultima_vista
from public.eventi
where tipo = 'pagina' and creato_il > now() - interval '30 days'
group by percorso
order by pagine_viste desc;

create view public.report_sorgenti with (security_invoker = true) as
select sorgente, mezzo, campagna,
       count(*) as sessioni,
       count(distinct visitatore_id) as visitatori,
       count(distinct lead_id) as lead,
       round(avg(durata_s))::integer as durata_media_s,
       round(avg(pagine), 1) as pagine_per_sessione
from public.sessioni
where iniziata_il > now() - interval '30 days'
group by sorgente, mezzo, campagna
order by sessioni desc;

-- Per ogni lead: da dove è arrivato la prima volta, quante visite prima di scrivere, cosa ha letto.
create view public.report_lead with (security_invoker = true) as
select l.id as lead_id, l.creato_il, l.nome, l.cognome, l.email, l.azienda, l.consenso_marketing,
       l.visitatore_id is not null as visite_collegate,
       prima.sorgente as prima_sorgente, prima.mezzo as primo_mezzo, prima.campagna as prima_campagna,
       prima.pagina_ingresso as prima_pagina, prima.iniziata_il as prima_visita,
       (select count(*) from public.sessioni s where s.lead_id = l.id and s.iniziata_il <= l.creato_il) as sessioni_prima_del_contatto,
       (select count(*) from public.sessioni s where s.lead_id = l.id) as sessioni_totali,
       (select array_agg(distinct e.percorso) from public.eventi e where e.visitatore_id = l.visitatore_id and e.tipo = 'pagina') as pagine_lette,
       l.chat_sessione
from public.lead l
left join lateral (
  select * from public.sessioni s where s.visitatore_id = l.visitatore_id order by s.iniziata_il asc limit 1
) prima on true
order by l.creato_il desc;

revoke all on public.report_giornaliero, public.report_pagine, public.report_sorgenti, public.report_lead from anon, authenticated;

/* ------------------------------------------------------------------ */
/* Conservazione: statistiche per 13 mesi, come dice l'informativa      */
/* ------------------------------------------------------------------ */
create or replace function public.pulisci_statistiche()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.eventi where creato_il < now() - interval '13 months';
  delete from public.sessioni where ultima_attivita < now() - interval '13 months';
  delete from public.visitatori v
   where v.ultimo_accesso < now() - interval '13 months'
     and not exists (select 1 from public.sessioni s where s.visitatore_id = v.id);
$$;
revoke all on function public.pulisci_statistiche() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('r2d-pulisci-statistiche', '17 3 * * *', $$select public.pulisci_statistiche()$$);
