# PageLoader Bug Report

Full diagnosis of why the vertical word carousel in `PageLoader.tsx` renders static
text ("Apps" frozen, no animation) instead of cycling through `["Apps", "Portfolio", "Work"]`.

---

## Bug 1 — `document.fonts.ready` kills the spin timer (root cause of "no animation")

### What the code does
```ts
document.fonts.ready.then(() => {
  if (cancelled) return;

  ctx = gsap.context(() => {
    // GSAP entrance tweens ...

    // word spin timer lives INSIDE here
    timers.push(
      setTimeout(() => {
        const spin = setInterval(() => {
          setWordIndex((prev) => (prev + 1) % WORDS.length);
        }, SPIN_INTERVAL);
      }, ENTRANCE_DELAY),
    );
  }, overlay);
});
```

### Why it breaks in Next.js

`document.fonts.ready` is a `Promise<FontFaceSet>` that resolves when all fonts in
the document are loaded. In Next.js App Router the timing is unpredictable:

- **Early resolution**: if fonts are already cached, the promise resolves
  synchronously (microtask queue) — before React finishes hydrating the overlay
  DOM. `gsap.context(() => {}, overlay)` then runs selector queries like
  `[data-loader-left]` and finds **zero elements** because the ref'd `overlay`
  node exists but its children haven't been committed to the DOM yet.
  GSAP fails silently, `ctx` is set to a broken context, and every `gsap.set` /
  `gsap.to` inside it is a no-op. The `setTimeout` for the spin is registered
  inside `gsap.context` — but GSAP doesn't manage `setTimeout`. The timeout
  fires but `cancelled` may be stale depending on StrictMode timing (see Bug 2).

- **Late resolution / never resolves**: if a custom font (`--font-geist-mono`)
  fails to load, `fonts.ready` never resolves in some environments. The entire
  `.then()` block never executes. React renders "Apps" (initial state) and
  nothing ever calls `setWordIndex`.

### DOM injection detail

`gsap.context(fn, scope)` internally calls `scope.querySelectorAll(selector)` for
every selector string passed to GSAP tweens inside `fn`. When `fonts.ready`
resolves too early the React fiber tree has not yet committed child nodes to the
real DOM. The overlay `<div>` (the scope) is in the DOM but its children —
`[data-loader-left]`, `[data-loader-slot]`, `[data-loader-right]` — are not.
`querySelectorAll` returns an empty `NodeList`. GSAP creates tweens targeting
zero elements. No animation plays. No error is thrown.

### Fix

Split into two independent `useEffect`s. Remove `document.fonts.ready` entirely —
it is only required when GSAP needs to **measure text dimensions** (e.g.
`SplitText`, `getBoundingClientRect`). Pure `transform` + `opacity` tweens do not
need font metrics.

```ts
// Effect 1 — GSAP visuals only
useEffect(() => {
  const overlay = overlayRef.current;
  if (!overlay) return;
  const ctx = gsap.context(() => { /* entrance, progress, fade */ }, overlay);
  return () => ctx.revert();
}, [onComplete]);

// Effect 2 — word spin, pure React, no GSAP dependency
useEffect(() => {
  let spinInterval: ReturnType<typeof setInterval> | null = null;
  const startTimer = setTimeout(() => {
    spinInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, SPIN_INTERVAL);
  }, ENTRANCE_DELAY);
  const stopTimer = setTimeout(() => {
    if (spinInterval) clearInterval(spinInterval);
  }, (TOTAL_DURATION - 0.4) * 1000);
  return () => {
    clearTimeout(startTimer);
    clearTimeout(stopTimer);
    if (spinInterval) clearInterval(spinInterval);
  };
}, []);
```

---

## Bug 2 — React StrictMode double-invoke makes `cancelled` unreliable

### What the code does
```ts
let cancelled = false;

document.fonts.ready.then(() => {
  if (cancelled) return; // guard
  // ...
  setTimeout(() => {
    if (cancelled) return; // guard inside timer
    const spin = setInterval(() => { ... });
  }, ENTRANCE_DELAY);
});

return () => {
  cancelled = true; // cleanup
  timers.forEach(clearTimeout);
  ctx?.revert();
};
```

### Why it breaks

Next.js in development uses `React.StrictMode`. In StrictMode, React **mounts →
unmounts → remounts** every component on first render to catch side effects.
Each `useEffect` call gets its own closure scope with its own `cancelled` variable.

Timeline:

| Step | Closure | `cancelled` |
|------|---------|-------------|
| 1st effect runs | closure-A | `false` |
| `fonts.ready` queued for closure-A | closure-A | `false` |
| StrictMode cleanup fires | closure-A | set to `true` |
| 2nd effect runs | closure-B | `false` |
| `fonts.ready` queued for closure-B | closure-B | `false` |
| closure-A's `.then()` resolves | closure-A | `true` → early return ✓ |
| closure-B's `.then()` resolves | closure-B | `false` → continues ✓ |

This part works correctly. **But** — because `fonts.ready` is async, the exact
order of steps 6 and 7 depends on the browser's microtask queue. If both promises
resolve in the same microtask flush (common when fonts are cached), both closures
can enter the `.then()` body before either cleanup has run, resulting in two
concurrent GSAP contexts and two spin intervals firing simultaneously. The UI
flickers between word indices unpredictably.

### Fix

Keeping the two effects separate (Bug 1 fix) resolves this for the spin. For GSAP,
`ctx.revert()` in the cleanup is sufficient — it kills all tweens registered in
that context. No `cancelled` flag is needed when the async wrapper is removed.

---

## Bug 3 — `AnimatePresence mode="popLayout"` collapses the slot width

### What the code does
```tsx
<AnimatePresence mode="popLayout" initial={false}>
  <motion.span key={wordIndex} ...>
    {WORDS[wordIndex]}
  </motion.span>
</AnimatePresence>
```

### Why it breaks

`mode="popLayout"` is designed for **list reordering** (e.g. a sortable todo list).
When an item exits, Framer Motion immediately removes it from the normal document
flow by applying `position: absolute` to the exiting element and snapshotting its
last layout position. This is intended to let other list items reflow into the
gap while the removed item plays its exit animation.

Inside the carousel slot:

1. Word exits → Framer sets it to `position: absolute`, removes it from flow.
2. Slot `<div>` (which has no explicit `width`) now has **zero in-flow children**.
3. Slot collapses to `width: 0`.
4. Entering word is also `position: absolute` (set by Framer during popLayout),
   so it doesn't re-expand the slot.
5. Both words animate but are invisible — they're outside the `overflow: hidden`
   clip area because the clipping box collapsed.

### Fix

Use `mode="sync"`. Sync mode lets the exiting and entering elements coexist in
the DOM simultaneously during the transition without touching their `position`.
Add `position: absolute` manually to the `motion.span` so both words occupy the
same space and slide past each other inside the clip. Add a hidden sizer `<span>`
to hold the slot's width while both animated spans are out of normal flow.

```tsx
<div
  data-loader-slot=""
  style={{ position: "relative", height: SLOT_H, overflow: "hidden" }}
>
  {/* holds slot width — animated words are absolute and don't contribute to layout */}
  <span aria-hidden="true" style={{ visibility: "hidden", display: "block",
    fontWeight: 700, whiteSpace: "nowrap", lineHeight: SLOT_H }}>
    {WORDS[wordIndex]}
  </span>

  <AnimatePresence mode="sync" initial={false}>
    <motion.span
      key={wordIndex}
      initial={{ y: "110%", opacity: 0 }}
      animate={{ y: "0%",   opacity: 1 }}
      exit={{    y: "-110%", opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0.2, 1] }}
      style={{
        position: "absolute", top: 0, left: 0,
        display: "block", fontWeight: 700,
        whiteSpace: "nowrap", lineHeight: SLOT_H,
      }}
    >
      {WORDS[wordIndex]}
    </motion.span>
  </AnimatePresence>
</div>
```

---

## Bug 4 — `motion.span` missing `position: absolute` causes layout thrash

### Why it matters even without `popLayout`

Even when `mode="sync"` is used, without `position: absolute` on the `motion.span`
there are briefly **two** `<span>` elements in the DOM during the transition —
the exiting one and the entering one. Both are `display: block` in normal flow.
They stack vertically, doubling the height of the slot, pushing `[data-loader-right]`
("Portfolio.") to the right as the slot width jumps between word lengths. The
`overflow: hidden` on the slot clips the bottom word entirely, making only one
word visible at a time — no overlap, no carousel feel, just a hard cut.

`position: absolute` removes both words from normal flow so they occupy the same
`top: 0 / left: 0` position and animate past each other cleanly.

---

## Summary of all changes

| Location | Before | After | Reason |
|----------|--------|-------|--------|
| `useEffect` structure | Single effect, everything inside `document.fonts.ready.then()` | Two effects — GSAP effect + spin effect | `fonts.ready` timing breaks GSAP context and kills spin timer |
| `document.fonts.ready` | Wraps all GSAP + timer code | Removed entirely | Not needed for transform/opacity tweens; caused silent DOM-not-ready failures |
| `AnimatePresence mode` | `"popLayout"` | `"sync"` | `popLayout` collapses slot width by removing exiting word from flow |
| `motion.span` style | No `position` set | `position: "absolute", top: 0, left: 0` | Without it two words stack in flow during transition, doubling slot height |
| Slot — hidden sizer span | Not present | Added `visibility: hidden` span mirroring current word | Holds slot width while both animated spans are out of normal flow |

---

## Files to edit

- `components/PageLoader.tsx` (or wherever the component lives) — apply all five
  changes above. The fixed version is in `PageLoader.tsx` alongside this file.