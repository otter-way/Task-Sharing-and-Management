import type { DropAnimationFunctionArguments } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EASE_OUT_CSS } from "@/lib/motion";

const DURATION = 200;
// The copy is all but in place 40% of the way through the ease-out, so the
// crossfade onto the row only starts once it has arrived.
const CROSSFADE_FROM = 0.4;
const GHOST_OPACITY = 0.4;

// The task moves in the query cache during the drop, but TanStack tells the
// components on the next task. Measuring before that finds the row on the day
// it came from and sends the copy back there.
function afterCacheRender() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// Flies the lifted copy onto the row where the task now lives (its new day, or
// its old one when nothing changed), settles the lift and hands over to the
// row with a short crossfade. Resolves with the row's fade, which holds the row
// at full opacity until the caller has cleared its ghost state and cancels it.
export async function landDraggedCopy(
  {
    active,
    dragOverlay,
    draggableNodes,
    transform,
  }: DropAnimationFunctionArguments,
  reduceMotion: boolean,
): Promise<Animation | undefined> {
  await afterCacheRender();

  const overlay = dragOverlay.node;
  const target = draggableNodes.get(active.id)?.node.current ?? null;
  const row = target?.isConnected ? target : null;

  const fade = {
    duration: DURATION,
    easing: "linear",
    fill: "forwards",
  } as const;
  const rowIn = row?.animate(
    [
      { opacity: GHOST_OPACITY },
      { opacity: GHOST_OPACITY, offset: CROSSFADE_FROM },
      { opacity: 1 },
    ],
    fade,
  );

  if (!row || reduceMotion) {
    await Promise.all([
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 150,
        easing: EASE_OUT_CSS,
        fill: "forwards",
      }).finished,
      rowIn?.finished,
    ]);
    return rowIn;
  }

  // dnd-kit's dragOverlay.rect measures the scaled lift inside the overlay;
  // the unscaled wrapper is what has to line up with the row.
  const from = overlay.getBoundingClientRect();
  const to = row.getBoundingClientRect();
  const landed = {
    ...transform,
    x: transform.x + to.left - from.left,
    y: transform.y + to.top - from.top,
  };
  const move = {
    duration: DURATION,
    easing: EASE_OUT_CSS,
    fill: "forwards",
  } as const;
  const lift = overlay.querySelector<HTMLElement>("[data-calendar-drag-lift]");

  await Promise.all([
    overlay.animate(
      [
        { transform: CSS.Transform.toString(transform) },
        { transform: CSS.Transform.toString(landed) },
      ],
      move,
    ).finished,
    lift?.animate([{ scale: "1.02" }, { scale: "1" }], move).finished,
    overlay.animate(
      [{ opacity: 1 }, { opacity: 1, offset: CROSSFADE_FROM }, { opacity: 0 }],
      fade,
    ).finished,
    rowIn?.finished,
  ]);
  return rowIn;
}
