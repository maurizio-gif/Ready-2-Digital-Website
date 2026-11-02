// Small facts about the device, asked once per call: the components use them to
// choose shorter distances and faster reveals on phones, and to skip pointer
// effects where there is no pointer.
//
// They are also called while rendering, and the prerender (scripts/prerender.mjs)
// renders on a server with no screen: there they answer "no".

const media = (query: string) => typeof window !== 'undefined' && window.matchMedia(query).matches;

/** True on touch screens, where there is no hover and scrolling is native. */
export const isTouch = () => media('(hover: none) and (pointer: coarse)');

/** True when the reader asked the system for less motion. */
export const reducedMotion = () => media('(prefers-reduced-motion: reduce)');

/** True when a pointer that can hover is in use (mouse, trackpad). */
export const finePointer = () => media('(pointer: fine)');
