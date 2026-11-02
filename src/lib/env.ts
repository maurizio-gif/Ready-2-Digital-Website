// Small facts about the device, asked once per call: the components use them to
// choose shorter distances and faster reveals on phones, and to skip pointer
// effects where there is no pointer.

/** True on touch screens, where there is no hover and scrolling is native. */
export const isTouch = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/** True when the reader asked the system for less motion. */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True when a pointer that can hover is in use (mouse, trackpad). */
export const finePointer = () => window.matchMedia('(pointer: fine)').matches;
