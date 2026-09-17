import { getCollection } from 'astro:content';
import { routeFor, otherLocale, type Locale } from './routes';

// A /work/[slug] (or /progetti/[slug]) page can't look up its alternate-
// locale URL in the static routes table — the slug is per-entry, not
// per-route. It looks it up by `caseId` in the collection instead.
export async function getWorkAlternateUrl(caseId: string, locale: Locale): Promise<string | null> {
  const target = otherLocale(locale);
  const entries = await getCollection('work');
  const match = entries.find((e) => e.data.caseId === caseId && e.data.locale === target);
  if (!match) return null;
  return `${routeFor('work', target)}${match.data.slug}/`;
}
