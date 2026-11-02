#!/usr/bin/env python3
"""Import the CRM/portal screenshots rendered from the apps' own code.

Reads /home/user/mock-supabase/shots/<app>/captions.json, converts the PNGs to
webp under public/images/real/<case>/app-*.webp and writes
src/real-generated.json, which src/real.ts merges into the «Dal vivo» gallery.

Run:  python3 scripts/import-shots.py
"""
import json, os, sys
from PIL import Image

SHOTS = '/home/user/mock-supabase/shots'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'real')
GEN = os.path.join(os.path.dirname(__file__), '..', 'src', 'real-generated.json')

# shots dir → case slug, and which pages also get a phone frame.
# shots dir → (case slug, desktop pages in display order, pages that also get a phone frame)
APPS = {
    'athlon': ('athlon', ['dashboard', 'contatti', 'contatto', 'planning', 'pagamenti_falliti', 'whatsapp', 'agenda', 'registro_giornaliero', 'performance', 'scuola_nuoto_dashboard', 'billing_run', 'contratti'], ['dashboard', 'contatti', 'planning']),
    'portale': ('athlon', ['home'], None),  # phone-first: every phone screen, plus the home on desktop
    'ronchiverdi': ('ronchiverdi', ['dashboard', 'abbonamenti_andamento', 'incassato', 'persona', 'agenda_calendario', 'accessi_report', 'richiesta', 'report', 'direzione', 'voucher'], ['dashboard', 'persona']),
    'tca': ('tennis-club-ambrosiano', ['dashboard', 'persone', 'persona', 'analytics', 'scuola_tennis', 'agenda', 'persone_duplicati', 'summer_camp', 'iscrizioni_eventi', 'invita_amico'], ['dashboard', 'agenda']),
    'passion': ('passion-fitness', ['dashboard', 'abbonamenti', 'lead', 'prove', 'rinnovi', 'debitori', 'persona', 'task', 'ticket', 'report_giornaliero'], ['dashboard', 'abbonamenti']),
}
URLS = {'athlon': 'crm.athlonroma.it', 'portale': 'app.athlonroma.it', 'ronchiverdi': 'crm.ronchiverdi.it', 'tca': 'CRM TCA', 'passion': 'crm.passionfitness.it'}

gen = json.load(open(GEN)) if os.path.exists(GEN) else {}
for app, (case, desk_pages, phone_pages) in APPS.items():
    cap_path = os.path.join(SHOTS, app, 'captions.json')
    if not os.path.exists(cap_path):
        print('skip (no captions yet):', app)
        continue
    caps = json.load(open(cap_path))
    os.makedirs(os.path.join(OUT, case), exist_ok=True)
    items = []
    seen = set()
    for c in caps:
        f = c['file']
        dev = 'm' if f.startswith('m_') else 'd'
        page = f[2:-4]
        src = os.path.join(SHOTS, app, f)
        if not os.path.exists(src):
            continue
        is_phone = dev == 'm'
        if app == 'portale':
            keep = is_phone or page in desk_pages
        else:
            keep = (page in desk_pages) if not is_phone else bool(phone_pages and page in phone_pages)
        if not keep:
            continue
        kind = 'phone' if is_phone else 'browser'
        im = Image.open(src).convert('RGB')
        w = 780 if is_phone else 1600
        im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
        name = f'app-{app}-{dev}-{page}.webp'
        im.save(os.path.join(OUT, case, name), 'WEBP', quality=78, method=6)
        key = (page, dev)
        if key in seen:
            continue
        seen.add(key)
        items.append({'src': f'{case}/{name}', 'kind': kind, 'url': URLS[app], 'page': c.get('page', ''), 't': c['t'], 'd': c['d'], 't_en': c.get('t_en', c['t']), 'd_en': c.get('d_en', c['d']), 'app': app})
    # desktop pages in the curated order, each phone shot right after its desktop twin
    items.sort(key=lambda it: (desk_pages.index(it['src'].rsplit('-', 1)[1][:-5]) if it['src'].rsplit('-', 1)[1][:-5] in desk_pages else 99))
    order = []
    for it in items:
        if it['kind'] == 'browser':
            order.append(it)
            twin = next((p for p in items if p['kind'] == 'phone' and p['src'].rsplit('-', 1)[1] == it['src'].rsplit('-', 1)[1] and p['app'] == it['app']), None)
            if twin:
                order.append(twin)
    for it in items:
        if it not in order:
            order.append(it)
    gen.setdefault(case, [])
    gen[case] = [g for g in gen[case] if g.get('app') != app] + order
    print(app, '→', case, len(order), 'screens')
json.dump(gen, open(GEN, 'w'), ensure_ascii=False, indent=1)
total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs if f.startswith('app-'))
print('generated images total KB', total // 1024)
