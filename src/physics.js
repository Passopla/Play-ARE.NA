import { Box3 } from 'three';

// Images are flat; colliders get this much depth on their flat axis so fast falls can't skip through
export const COLLIDER_THICKNESS = 0.2;
// Longest distance moved per substep; must stay under half the collider thickness
const MAX_STEP = 0.08;

// Every mounted image registers its world-space box here (rooms stream in and out)
export const colliders = new Set();

export function colliderFromObject(object) {
  object.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(object);
  for (const a of ['x', 'y', 'z']) {
    if (box.max[a] - box.min[a] < 1e-3) {
      box.min[a] -= COLLIDER_THICKNESS / 2;
      box.max[a] += COLLIDER_THICKNESS / 2;
    }
  }
  return box;
}

// Resting exactly on a surface must not count as inside it; float rounding would otherwise
// shove a standing body sideways off the edge of the floor
const EPSILON = 1e-6;

function overlaps(pos, half, b) {
  return (
    pos.x - half.x < b.max.x - EPSILON && pos.x + half.x > b.min.x + EPSILON &&
    pos.y - half.y < b.max.y - EPSILON && pos.y + half.y > b.min.y + EPSILON &&
    pos.z - half.z < b.max.z - EPSILON && pos.z + half.z > b.min.z + EPSILON
  );
}

// Moves a box-shaped body one axis at a time, pushing it out of anything it ends up inside.
// Mutates pos and vel; returns the surfaces touched as [axis, sign] normals,
// e.g. ['y', 1] = standing on top of something, ['x', -1] = hit a wall while moving +x.
// ponytail: axis-aligned boxes only, which is all the layout makes. Swap for @react-three/rapier
// when you need slopes or rotated geometry.
export function moveAndCollide(pos, vel, half, boxes, dt) {
  const contacts = [];
  const distance = Math.hypot(vel.x, vel.y, vel.z) * dt;
  const steps = Math.max(1, Math.ceil(distance / MAX_STEP));
  const h = dt / steps;
  for (let s = 0; s < steps; s++) {
    for (const a of ['x', 'y', 'z']) {
      const d = vel[a] * h;
      if (!d) continue;
      pos[a] += d;
      for (const b of boxes) {
        if (!overlaps(pos, half, b)) continue;
        pos[a] = d > 0 ? b.min[a] - half[a] : b.max[a] + half[a];
        vel[a] = 0;
        contacts.push([a, d > 0 ? -1 : 1]);
      }
    }
  }
  return contacts;
}

// Collision box of a body standing on a surface whose normal lies along upAxis
export function halfExtents(upAxis, radius, halfHeight) {
  return { x: radius, y: radius, z: radius, [upAxis]: halfHeight };
}

// Top of the flat (floor-like) collider nearest to a point, or null if none are loaded
export function nearestFloorTop(point) {
  let best = null;
  let bestDistance = Infinity;
  for (const b of colliders) {
    if (b.max.y - b.min.y > COLLIDER_THICKNESS + 1e-6) continue; // walls
    const x = (b.min.x + b.max.x) / 2;
    const z = (b.min.z + b.max.z) / 2;
    const d = (x - point.x) ** 2 + (z - point.z) ** 2;
    if (d < bestDistance) {
      bestDistance = d;
      best = { x, y: b.max.y, z };
    }
  }
  return best;
}
