// Run with: npm run check
import assert from 'node:assert/strict';
import { moveAndCollide } from './physics.js';

const half = { x: 0.3, y: 0.8, z: 0.3 };
const box = (min, max) => ({
  min: { x: min[0], y: min[1], z: min[2] },
  max: { x: max[0], y: max[1], z: max[2] },
});
const touched = (contacts, axis, sign) => contacts.some(([a, s]) => a === axis && s === sign);
const floor = box([-2, -0.1, -2], [2, 0.1, 2]);
const wall = box([1, 0, -2], [1.2, 3, 2]);

// Falls and comes to rest on top of the floor
let pos = { x: 0, y: 3, z: 0 };
let vel = { x: 0, y: 0, z: 0 };
let contacts = [];
for (let i = 0; i < 120; i++) {
  vel.y -= 25 / 60;
  contacts = moveAndCollide(pos, vel, half, [floor], 1 / 60);
}
assert.ok(touched(contacts, 'y', 1));
assert.equal(pos.y, 0.1 + half.y);

// Very fast fall doesn't tunnel through the thin floor
pos = { x: 0, y: 2, z: 0 };
vel = { x: 0, y: -200, z: 0 };
moveAndCollide(pos, vel, half, [floor], 1 / 20);
assert.equal(pos.y, 0.1 + half.y);

// Running into a wall stops at its face, reporting the wall's normal (facing -x)
pos = { x: 0, y: 0.1 + half.y, z: 0 };
vel = { x: 6, y: -0.5, z: 0 };
contacts = moveAndCollide(pos, vel, half, [floor, wall], 1);
assert.equal(pos.x, 1 - half.x);
assert.ok(touched(contacts, 'x', -1));
// ...and says which box it was, so the climber knows where the wall's top edge is
assert.equal(contacts.find(([a]) => a === 'x')[2], wall);

// Zero-thickness planes, the real player's size: solid from either side, even at speed
const player = { x: 0.08, y: 0.2, z: 0.08 };
const plane = box([0, 0, -2], [0, 3, 2]); // a wall at x = 0
for (const side of [-1, 1]) {
  pos = { x: side, y: 1, z: 0 };
  vel = { x: -side * 30, y: 0, z: 0 };
  moveAndCollide(pos, vel, player, [plane], 1 / 30);
  assert.equal(pos.x, side * 0.08); // stopped on the side it came from
}
const thinFloor = box([-2, 0, -2], [2, 0, 2]);
pos = { x: 0, y: 2, z: 0 };
vel = { x: 0, y: -40, z: 0 };
moveAndCollide(pos, vel, player, [thinFloor], 1 / 20);
assert.equal(pos.y, 0.2); // feet exactly on the image

console.log('physics checks passed');
