// Run with: npm run check
import assert from 'node:assert/strict';
import { roomLayout, roomWalls, spiralCells, roomsNear, FLOOR_SLOTS, ROOM_SPACING } from './layout.js';
import { arenaSlug } from './arena.js';

// Every image is placed exactly once, in order
const rooms = roomLayout(200);
const indices = rooms.flatMap((r) => r.items.map((item) => item.index));
assert.deepEqual(indices, [...Array(200).keys()]);

// Every room starts with its floors, including a partly filled last room
for (const room of rooms) {
  const floors = Math.min(room.items.length, FLOOR_SLOTS.length);
  room.items.slice(0, floors).forEach((item, slot) => {
    const [x, y, z] = FLOOR_SLOTS[slot].position;
    assert.deepEqual(item.position, [x + room.cell[0] * ROOM_SPACING, y, z + room.cell[1] * ROOM_SPACING]);
  });
}

// Wall counts vary between rooms instead of always being 4
const wallCounts = new Set(Array.from({ length: 32 }, (_, r) => roomWalls(r).length));
assert.ok(wallCounts.size >= 3);
assert.ok(!wallCounts.has(4) || wallCounts.size > 1);

// Rooms sit on distinct spiral cells
assert.equal(new Set(rooms.map((r) => String(r.cell))).size, rooms.length);
assert.equal(new Set(spiralCells(50).map(String)).size, 50);

// Streaming: 3x3 rooms around the origin, capped by how many rooms exist
const many = spiralCells(100);
assert.equal(roomsNear(many, [0, 0]).size, 9);
assert.equal(roomsNear(spiralCells(4), [0, 0]).size, 4);
// Moving one room east keeps the west column (within unload ring), adds the east one
const start = roomsNear(many, [0, 0]);
const moved = roomsNear(many, [ROOM_SPACING, 0], start);
assert.ok([...start].every((r) => moved.has(r)));
assert.equal(moved.size, 12);
// Moving far away drops the origin rooms
assert.ok(!roomsNear(many, [ROOM_SPACING * 4, 0], moved).has(0));

assert.equal(arenaSlug('https://www.are.na/someone/my-channel?page=2'), 'my-channel');
assert.equal(arenaSlug('https://www.are.na/someone/my-channel/'), 'my-channel');
assert.equal(arenaSlug('  my-channel '), 'my-channel');

console.log('layout checks passed');
