// Centralised contact-form configuration.
//
// CONTACT_ENDPOINT is intentionally empty: there is no real webhook/API to
// send submissions to yet, and the brief for this project is explicit that
// a fake backend is worse than an honest fallback. With it empty, the form
// submits natively as a mailto (no JavaScript required, always works).
// Once a real endpoint exists (e.g. an n8n webhook), set it here — the form
// picks it up automatically and switches to a JSON POST with client-side
// validation feedback. Nothing else in the templates needs to change.
export const CONTACT_ENDPOINT = '';
export const CONTACT_EMAIL = 'info@ready2digital.it';
