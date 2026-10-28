import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LinearMipmapLinearFilter, Matrix4, NearestFilter, MOUSE, Quaternion, Ray, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { Suspense, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { fillNearest, roomLayout, roomsNear, ROOM_SPACING } from './layout';
import { arenaSlug, fetchArenaPage, fetchChannelLength, PAGE_SIZE } from './arena';
import { colliders, colliderFromObject, moveAndCollide, nearestFloorTop } from './physics';
import { Character, CHARACTERS, MANTLE } from './character';
import './App.css';

const DEFAULT_IMAGES = [
  'https://d2w9rnfcy7mm78.cloudfront.net/3894388/original_1e9e4ee58447dd9add36c08b6e4b2dd2.gif?1553011688',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIyNTMzMTU2MC9vcmlnaW5hbF8yOWEyNGJlNGYzMTBiM2JmZTEyNjE3MGU1OGUzNmRlZi5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI3NzE0NDE5L29yaWdpbmFsX2JiMTNhNmEwOThlMWI0ZGQyMDIwMDYxOC00LTFkMnpyaDQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjozMDAsImhlaWdodCI6MzAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOnRydWV9LCJ3ZWJwIjp7InF1YWxpdHkiOjc1fSwiZmxhdHRlbiI6eyJiYWNrZ3JvdW5kIjp7InIiOjIwMywiZyI6MjAzLCJiIjoyMDN9fSwianBlZyI6eyJxdWFsaXR5Ijo3NX0sInJvdGF0ZSI6bnVsbH19',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAzNTIxOS9vcmlnaW5hbF9jYzI5ZTAxMDE1MWVmNzZkMDI2N2JkODRlNGNiZDZiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAyMzY5MC9vcmlnaW5hbF9hZTBjNmE1NjU1MWYzMWI0YTI2MjcwMzJiY2ViYzBiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
  'https://d2w9rnfcy7mm78.cloudfront.net/34702321/original_065555d22addd36aa9eecbd9d621c5a7.gif?1740113172',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjI5Mi9vcmlnaW5hbF8zNjU0ZjA5NzZhNTFhZjhiODNhMzQ5NTgwMjJlMjdkMi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
  'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjE3Ni9vcmlnaW5hbF9mOGJhYWYwYTZlMDI3NWI5YjFiNzM0MTJjYWMxYTcwOS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
  'https://d2w9rnfcy7mm78.cloudfront.net/34702184/original_dc6fcb41eecc6bf457e7e388f47aac3f.gif?1740112610'
].map((url) => ({ thumb: url, display: url })); // single size, already small

// Keep the image from being too big, but keep the aspect ratio
const MAX_SIZE = 3;

// Swap thumb -> display once an image covers more screen pixels than the thumb has.
// The gap between the two thresholds stops it flickering at the boundary.
const HI_RES_ABOVE_PX = 450;
const LOW_RES_BELOW_PX = 300;

// Rooms loaded around the view: 1 ring = 3x3 rooms (81 images), unloaded one ring further out
const LOAD_RINGS = 1;

const textureLoader = new TextureLoader();

// Loads a texture owned by a single component and frees it from the GPU when it's no longer used.
// Deliberately not drei's useTexture: its shared cache is read on every re-render, so freeing
// entries made every image reload (and vanish) whenever rooms streamed in.
function useOwnedTexture(url) {
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    let loaded = null;
    let cancelled = false;
    textureLoader.load(
      url,
      (t) => {
        if (cancelled) return t.dispose();
        t.colorSpace = SRGBColorSpace;
        // Mipmaps stop far images shimmering, Nearest keeps the crisp pixel look up close,
        // anisotropy keeps floor tiles sharp at grazing angles
        t.minFilter = LinearMipmapLinearFilter;
        t.magFilter = NearestFilter;
        t.anisotropy = gl.capabilities.getMaxAnisotropy();
        loaded = t;
        setTexture(t);
      },
      undefined,
      () => {} // dead link / CORS: the image just stays hidden
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      setTexture(null);
    };
  }, [url, gl]);

  return texture;
}

function Window({ position, image, rotation = [0, 0, 0] }) {
  const meshRef = useRef();
  const [hiRes, setHiRes] = useState(false);
  const hasHiRes = image.display !== image.thumb;
  const center = useMemo(() => new Vector3(...position), [position]);
  // The thumb lives as long as the window; hi-res only while close, shown once it's ready
  const thumb = useOwnedTexture(image.thumb);
  const display = useOwnedTexture(hasHiRes && hiRes ? image.display : null);
  const texture = display ?? thumb;

  // Register as a game collider once its size is known (streamed rooms add and remove themselves)
  useEffect(() => {
    if (!thumb) return;
    const box = colliderFromObject(meshRef.current);
    colliders.add(box);
    return () => colliders.delete(box);
  }, [thumb]);

  useFrame(({ camera, size, gl }) => {
    if (!hasHiRes) return;
    const distance = camera.position.distanceTo(center);
    const screenPx =
      (MAX_SIZE / (2 * distance * Math.tan((camera.fov * Math.PI) / 360))) *
      size.height * gl.getPixelRatio();
    if (!hiRes && screenPx > HI_RES_ABOVE_PX) setHiRes(true);
    else if (hiRes && screenPx < LOW_RES_BELOW_PX) setHiRes(false);
  });

  if (!texture) return null;

  // Keep the image from being too big, but keep the aspect ratio
  const aspectRatio = texture.image.width / texture.image.height;
  const [width, height] = aspectRatio > 1
    ? [MAX_SIZE, MAX_SIZE / aspectRatio]
    : [MAX_SIZE * aspectRatio, MAX_SIZE];

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        toneMapped={false}
        side={2} // Render both sides of the plane
      />
    </mesh>
  );
}

// Only rooms around the point being looked at are mounted; far ones unmount and free their textures
// Mounted rooms still missing images ask for more with onNeedMore([x, z]), the point being looked at.
function Rooms({ rooms, images, onNeedMore }) {
  const cells = useMemo(() => rooms.map((room) => room.cell), [rooms]);
  const [active, setActive] = useState(() => new Set());
  const lastCell = useRef(null);
  const center = useRef([0, 0]);

  useEffect(() => {
    const empty = [...active].some((room) => rooms[room]?.items.some(({ index }) => !images[index]));
    if (empty) onNeedMore(center.current);
  }, [active, images, rooms, onNeedMore]);

  useEffect(() => {
    lastCell.current = null; // new channel: recompute on the next frame
  }, [cells]);

  useFrame(({ camera, controls }) => {
    const { x, z } = controls?.target ?? camera.position;
    const cell = `${Math.round(x / ROOM_SPACING)},${Math.round(z / ROOM_SPACING)}`;
    if (cell === lastCell.current) return;
    lastCell.current = cell;
    center.current = [x, z];
    setActive((prev) => roomsNear(cells, [x, z], prev, LOAD_RINGS, LOAD_RINGS + 1));
  });

  return [...active].flatMap((room) =>
    // Each image streams in on its own rather than waiting for the whole room
    (rooms[room]?.items ?? []).filter(({ index }) => images[index]).map(({ index, position, rotation }) => (
      <Window key={`${index}-${images[index].thumb}`} position={position} rotation={rotation} image={images[index]} />
    ))
  );
}

// [right, forward] per key; codes are physical keys, so WASD works on any keyboard layout
const MOVE_KEYS = {
  KeyW: [0, 1], ArrowUp: [0, 1],
  KeyS: [0, -1], ArrowDown: [0, -1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};
// Ground covered per second, as a multiple of zoom distance (zoomed out = faster). Shift = 3x.
const MOVE_SPEED = 1.2;
const WORLD_UP = new Vector3(0, 1, 0);

// Held keys (by physical code) plus whether Shift is down; ignores typing in the link box
function usePressedKeys(captured) {
  const keys = useRef({ pressed: new Set(), shift: false });

  useEffect(() => {
    const down = (e) => {
      keys.current.shift = e.shiftKey;
      if (!captured.has(e.code) || e.target.closest?.('input, textarea, select')) return;
      keys.current.pressed.add(e.code);
      e.preventDefault();
    };
    const up = (e) => {
      keys.current.shift = e.shiftKey;
      keys.current.pressed.delete(e.code);
    };
    const clear = () => keys.current.pressed.clear(); // keyups are lost when the window loses focus
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, [captured]);

  return keys;
}

// [right, forward] summed over the held move keys; opposite keys cancel out
function moveAxes(pressed) {
  let r = 0, f = 0;
  for (const code of pressed) {
    if (!MOVE_KEYS[code]) continue;
    r += MOVE_KEYS[code][0];
    f += MOVE_KEYS[code][1];
  }
  return [r, f];
}

// Camera-relative direction along a surface (normal `up`) from held move keys, written into
// `out` (zero if none). Forward blends the camera's view and screen-up directions flattened onto
// the surface, so it stays sensible whether you look along a surface or straight at a wall
// (where W then means "up the wall").
function moveDirection(pressed, camera, up, out, right) {
  const [r, f] = moveAxes(pressed);
  camera.getWorldDirection(out);
  out.add(right.set(0, 1, 0).applyQuaternion(camera.quaternion));
  out.addScaledVector(up, -out.dot(up)).normalize();
  right.crossVectors(out, up).normalize();
  out.multiplyScalar(f).addScaledVector(right, r);
  return out.lengthSq() ? out.normalize() : out; // opposite keys cancel out
}

const NAV_KEYS = new Set(Object.keys(MOVE_KEYS));

// WASD / arrows slide the camera and its orbit target together along the ground,
// relative to where the camera faces
function KeyboardMove() {
  const keys = usePressedKeys(NAV_KEYS);
  const [move, right] = useMemo(() => [new Vector3(), new Vector3()], []);

  useFrame(({ camera, controls }, delta) => {
    if (!keys.current.pressed.size || !controls) return;
    if (!moveDirection(keys.current.pressed, camera, WORLD_UP, move, right).lengthSq()) return;
    const speed = camera.position.distanceTo(controls.target) * MOVE_SPEED * (keys.current.shift ? 3 : 1);
    move.multiplyScalar(speed * delta);
    camera.position.add(move);
    controls.target.add(move);
    controls.update();
  });

  return null;
}

// Game feel knobs. Units are world units (an image is up to 3 across) and seconds.
// The character is a miniature in a world of billboards: 0.4 tall next to 3-unit images.
const PLAYER_RADIUS = 0.08;
const PLAYER_HALF_HEIGHT = 0.2;
const PLAYER_HEIGHT = PLAYER_HALF_HEIGHT * 2;
const HALF = { x: PLAYER_RADIUS, y: PLAYER_HALF_HEIGHT, z: PLAYER_RADIUS };
const RUN_SPEED = 1; // 2.5 body heights a second: a jog. The run animation's pace follows the real speed.
const SPRINT_MULTIPLIER = 1.5; // Shift
const RUN_GRIP = 15; // how quickly running speeds up and slows down (per second)
const AIR_GRIP = 2; // same in the air: low, so a jump keeps its momentum
const GRAVITY = 25;
const JUMP_SPEED = 9; // jump height = JUMP_SPEED² / (2 * GRAVITY) ≈ 1.6, about 4x the character
const AIR_JUMPS = 2; // extra jumps in mid-air (double jump)
const AIR_JUMP_SPEED = 7; // upward speed of the mid-air jump
const AIR_JUMP_DASH = 5; // ...and a burst of this speed toward the held direction, to clear gaps
const CLIMB_SPEED = 0.35; // up/down a wall
const CLIMB_SIDEWAYS = 0.6; // sideways climbing, as a fraction of CLIMB_SPEED
const WALL_GRIP = 1; // speed pressing into the wall while climbing, so contact is felt every frame
const WALL_JUMP_PUSH = 2.5; // Space on a wall leaps this fast away from it, plus JUMP_SPEED upward
const WALL_JUMP_LOCK = 0.4; // no air steering for this long after a wall jump, so the push carries
const WALL_LET_GO_TIME = 0.15; // hands leave a wall after this long without touching it (climbed past an edge)
const STEP_HEIGHT = 0.05; // ledges this low are stepped onto instead of climbed (floors sit 1cm apart)
const HARD_LANDING_SPEED = 11; // falling faster than this ends in a hard landing (a normal jump lands at 9)
const LAND_LOCK = 0.5; // can't move for this long after a hard landing
const COYOTE_TIME = 0.1; // can still jump this long after running off an edge
const JUMP_BUFFER = 0.12; // a jump pressed this long before landing still fires
const FALL_LIMIT = -30; // respawn below this height
const TURN_SPEED = 12; // how quickly the character turns to face where it's going (per second)
// Close third-person camera, over the right shoulder
const CAMERA_HEIGHT = 0.3; // looks at a point this far above the character's centre, just over the head
const CAMERA_SHOULDER = 0.12; // ...shifted this far right, so the character sits left of centre
const CAMERA_DISTANCE = 1.1; // starting distance; scroll zooms between MIN and MAX
const CAMERA_MIN = 0.4;
const CAMERA_MAX = 3;
const CAMERA_POLAR = 1.3; // starting angle down from straight overhead, in radians (1.57 = level)
const POLAR_MIN = 0.35; // highest the camera can go
const POLAR_MAX = 2.4; // lowest (looking up)
const LOOK_SENSITIVITY = 0.0025; // radians per pixel of mouse movement
const CAMERA_CLEARANCE = 0.05; // stays this far in front of an image it would otherwise go behind
const CAMERA_FOLLOW = 20; // how quickly the camera catches up (per second); smooths the mantle's teleport
const GAME_KEYS = new Set([...NAV_KEYS, 'Space']);

function enter(b, state) {
  b.state = state;
  b.stateTime = 0;
}

// Grab the wall touched in a contact: face into it and start climbing
function grab(b, contact) {
  b.wall = contact;
  b.sinceWall = 0;
  b.facing.set(0, 0, 0)[contact[0]] = -contact[1];
  b.landing = false;
  b.airJumps = 0;
  enter(b, 'climb');
}

// Mouse look for the game camera: click the scene to capture the mouse (Esc frees it), or drag.
// Scroll zooms.
function useMouseLook() {
  const gl = useThree((state) => state.gl);
  const look = useRef({ yaw: 0, polar: CAMERA_POLAR, distance: CAMERA_DISTANCE });

  useEffect(() => {
    const el = gl.domElement;
    const capture = () => el.requestPointerLock()?.catch?.(() => {}); // refused right after Esc
    const turn = (e) => {
      if (document.pointerLockElement !== el && !(e.buttons & 1)) return;
      const l = look.current;
      l.yaw -= e.movementX * LOOK_SENSITIVITY;
      l.polar = Math.min(POLAR_MAX, Math.max(POLAR_MIN, l.polar - e.movementY * LOOK_SENSITIVITY));
    };
    const zoom = (e) => {
      const l = look.current;
      l.distance = Math.min(CAMERA_MAX, Math.max(CAMERA_MIN, l.distance * Math.exp(e.deltaY * 0.001)));
    };
    el.addEventListener('click', capture);
    el.addEventListener('wheel', zoom, { passive: true });
    window.addEventListener('mousemove', turn);
    return () => {
      el.removeEventListener('click', capture);
      el.removeEventListener('wheel', zoom);
      window.removeEventListener('mousemove', turn);
      if (document.pointerLockElement === el) document.exitPointerLock();
    };
  }, [gl]);

  return look;
}

// Runs and jumps on floors, climbs any wall it runs or jumps into, pulls itself up onto the top
// edge, and leaps off with Space. States: ground, air, climb, mantle.
// The camera follows close behind; the mouse turns it.
function Player({ who }) {
  const group = useRef();
  const keys = usePressedKeys(GAME_KEYS);
  const look = useMouseLook();
  const body = useRef(null);
  const pose = useRef('fall'); // which animation Character plays
  const pace = useRef(0); // how fast it's moving, so the animation keeps pace
  const [move, right, target, side, follow, pivot, toCamera, hit] = useMemo(
    () => Array.from({ length: 8 }, () => new Vector3()),
    []
  );
  const [basis, facing, ray] = useMemo(() => [new Matrix4(), new Quaternion(), new Ray()], []);

  useFrame(({ camera, controls }, delta) => {
    if (!controls || !group.current) return;
    const dt = Math.min(delta, 0.05); // a backgrounded tab mustn't produce one giant step

    if (!body.current) {
      // Spawn on the platform nearest to where the camera was looking
      const floor = nearestFloorTop(controls.target);
      const spawn = floor
        ? new Vector3(floor.x, floor.y + PLAYER_HALF_HEIGHT + 0.5, floor.z)
        : controls.target.clone().setY(3);
      body.current = {
        spawn,
        pos: spawn.clone(),
        vel: new Vector3(),
        facing: new Vector3(0, 0, 1),
        state: 'air',
        stateTime: 0,
        wall: null, // [axis, sign, box] being climbed
        sinceWall: 0,
        airPose: null, // 'jump' / 'doubleJump' / 'wallJump' while in the air after one, else falling
        airJumps: 0, // mid-air jumps used since last touching something
        landing: false,
        sinceGround: Infinity,
        sinceJumpPress: Infinity,
        spaceWasDown: false,
      };
      // Start the camera behind, from the direction it was already looking
      look.current.yaw = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
      follow.copy(spawn).y += CAMERA_HEIGHT;
    }
    const b = body.current;
    const { pressed, shift } = keys.current;
    const [r, f] = moveAxes(pressed);
    const spaceDown = pressed.has('Space');
    b.sinceJumpPress = spaceDown && !b.spaceWasDown ? 0 : b.sinceJumpPress + dt;
    b.spaceWasDown = spaceDown;
    const jumpQueued = b.sinceJumpPress < JUMP_BUFFER;
    b.stateTime += dt;

    if (b.state === 'mantle') {
      // Frozen while the animation pulls the body up; then stand on top of the ledge
      if (b.stateTime >= MANTLE.time) {
        b.pos.addScaledVector(b.facing, MANTLE.forward * PLAYER_HEIGHT);
        b.pos.y = b.wall[2].max.y + HALF.y;
        b.vel.set(0, 0, 0);
        b.sinceGround = 0;
        enter(b, 'ground');
      }
      pose.current = 'mantle';
    } else if (b.state === 'climb') {
      const [axis, sign] = b.wall;
      if (jumpQueued) {
        // Leap off backwards, still facing the wall as the animation does
        b.vel.set(0, JUMP_SPEED, 0);
        b.vel[axis] = sign * WALL_JUMP_PUSH;
        b.sinceJumpPress = Infinity;
        b.sinceGround = COYOTE_TIME; // no second jump in mid-air
        b.airPose = 'wallJump';
        enter(b, 'air');
      } else {
        // W/S climb, A/D shuffle sideways relative to the camera, always pressing into the wall
        camera.getWorldDirection(right).cross(WORLD_UP);
        right[axis] = right.y = 0;
        if (right.lengthSq()) right.normalize();
        b.vel.copy(right).multiplyScalar(r * CLIMB_SPEED * CLIMB_SIDEWAYS);
        b.vel.y = f * CLIMB_SPEED;
        pace.current = Math.hypot(b.vel.x, b.vel.y, b.vel.z);
        b.vel[axis] = -sign * WALL_GRIP;
        const contacts = moveAndCollide(b.pos, b.vel, HALF, colliders, dt);
        const held = contacts.find(([a, s]) => a === axis && s === sign);
        if (held) b.wall = held; // may be the next image along
        b.sinceWall = held ? 0 : b.sinceWall + dt;
        const feet = b.pos.y - HALF.y;
        if (f > 0 && b.wall[2].max.y - feet <= MANTLE.grip * PLAYER_HEIGHT) {
          // Hands reached the top edge: hang from it exactly and pull up
          b.pos.y = b.wall[2].max.y - MANTLE.grip * PLAYER_HEIGHT + HALF.y;
          enter(b, 'mantle');
        } else if (f <= 0 && contacts.some(([a, s]) => a === 'y' && s === 1)) {
          b.sinceGround = 0;
          enter(b, 'ground'); // climbed down to a floor
        } else if (b.sinceWall > WALL_LET_GO_TIME) {
          b.airPose = null;
          enter(b, 'air'); // climbed past the side or bottom of the wall
        }
        pose.current = f > 0 || (r && f === 0) ? 'climbUp' : f < 0 ? 'climbDown' : 'hang';
      }
    }

    if (b.state === 'ground' || b.state === 'air') {
      const steering = !(b.airPose === 'wallJump' && b.stateTime < WALL_JUMP_LOCK);
      const stunned = b.landing && b.stateTime < LAND_LOCK;
      moveDirection(pressed, camera, WORLD_UP, move, right);
      if (stunned) move.set(0, 0, 0);
      if (move.lengthSq()) b.landing = false; // walking cancels the rest of a hard landing
      if (steering) {
        // Ease toward the target velocity rather than jumping to it
        const top = RUN_SPEED * (shift ? SPRINT_MULTIPLIER : 1);
        const ease = 1 - Math.exp(-(b.state === 'ground' ? RUN_GRIP : AIR_GRIP) * dt);
        b.vel.x += (move.x * top - b.vel.x) * ease;
        b.vel.z += (move.z * top - b.vel.z) * ease;
      }
      if (jumpQueued && b.sinceGround < COYOTE_TIME && !stunned) {
        b.vel.y = JUMP_SPEED;
        b.sinceJumpPress = b.sinceGround = Infinity;
        b.airPose = 'jump';
        b.landing = false;
      } else if (jumpQueued && b.state === 'air' && b.airJumps < AIR_JUMPS) {
        b.vel.y = AIR_JUMP_SPEED;
        if (move.lengthSq()) {
          b.vel.x = move.x * AIR_JUMP_DASH;
          b.vel.z = move.z * AIR_JUMP_DASH;
          b.facing.copy(move);
        }
        b.sinceJumpPress = Infinity;
        b.airJumps++;
        b.airPose = 'doubleJump'; // also ends a wall jump's steering lock
      }
      b.vel.y -= GRAVITY * dt;
      const impact = -b.vel.y;

      const contacts = moveAndCollide(b.pos, b.vel, HALF, colliders, dt);
      const grounded = contacts.some(([a, s]) => a === 'y' && s === 1);
      const wall = contacts.find(([a]) => a !== 'y');
      if (wall && wall[2].max.y - (b.pos.y - HALF.y) <= STEP_HEIGHT) {
        b.pos.y = wall[2].max.y + HALF.y; // a tiny ledge: step up onto it
      } else if (wall) {
        grab(b, wall);
      }

      if (b.state !== 'climb') {
        if (grounded) {
          if (b.state === 'air' && impact > HARD_LANDING_SPEED) b.landing = true;
          if (b.state === 'air') enter(b, 'ground');
          b.sinceGround = 0;
          b.airPose = null;
          b.airJumps = 0;
        } else {
          b.sinceGround += dt;
          if (b.state === 'ground' && b.sinceGround > COYOTE_TIME) enter(b, 'air');
        }
        if (steering && move.lengthSq()) b.facing.copy(move);
        // Run exactly while a direction is held, at no less than jogging pace: matching the legs
        // to the brief speed-up and slow-down looked like slow motion
        pace.current = Math.max(Math.hypot(b.vel.x, b.vel.z), RUN_SPEED);
        pose.current =
          b.state === 'air' ? b.airPose ?? 'fall' : b.landing ? 'land' : move.lengthSq() ? 'run' : 'idle';
      }
    }

    if (b.pos.y < FALL_LIMIT) {
      b.pos.copy(b.spawn);
      b.vel.set(0, 0, 0);
      b.airPose = null;
      enter(b, 'air');
    }

    // Stand upright, turning toward the direction of travel (or the wall while climbing)
    side.crossVectors(WORLD_UP, b.facing);
    facing.setFromRotationMatrix(basis.makeBasis(side, WORLD_UP, b.facing));
    group.current.quaternion.slerp(facing, 1 - Math.exp(-TURN_SPEED * dt));
    group.current.position.copy(b.pos);

    // Camera: eases after the character, looks over its right shoulder, and pulls in
    // rather than end up behind an image
    const l = look.current;
    target.copy(b.pos).y += CAMERA_HEIGHT;
    follow.lerp(target, 1 - Math.exp(-CAMERA_FOLLOW * dt));
    pivot.copy(follow).addScaledVector(right.set(Math.cos(l.yaw), 0, -Math.sin(l.yaw)), CAMERA_SHOULDER);
    toCamera.setFromSphericalCoords(1, l.polar, l.yaw);
    ray.set(pivot, toCamera);
    let distance = l.distance;
    for (const box of colliders) {
      if (box.containsPoint(pivot) || !ray.intersectBox(box, hit)) continue;
      distance = Math.min(distance, pivot.distanceTo(hit) - CAMERA_CLEARANCE);
    }
    camera.position.copy(pivot).addScaledVector(toCamera, Math.max(distance, 0.05));
    camera.lookAt(pivot);
    controls.target.copy(pivot); // Rooms streams around it; free navigation resumes from here
  });

  return (
    <group ref={group}>
      <Suspense
        fallback={
          <mesh>
            {/* radius, straight length: 0.08 + 0.24 + 0.08 = 0.4 tall */}
            <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 8, 16]} />
            <meshNormalMaterial />
          </mesh>
        }
      >
        <Character key={who} who={who} pose={pose} pace={pace} height={PLAYER_HEIGHT} />
      </Suspense>
    </group>
  );
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    // Set the camera position and look at the origin, based scene size
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
    camera.fov = 60;
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function App() {
  const [images, setImages] = useState(DEFAULT_IMAGES);
  const [channel, setChannel] = useState(
    () => new URLSearchParams(window.location.search).get('channel') ?? ''
  );
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(null); // { slug, count } while a channel is fetching
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
    } catch {} // storage can be blocked; fall back to the system setting
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);
  const [gameMode, setGameMode] = useState(false);
  const [who, setWho] = useState(Object.keys(CHARACTERS)[0]);

  // V toggles game mode (third-person character) and back to free navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyV' || e.repeat || e.target.closest?.('input, textarea, select')) return;
      document.activeElement?.blur(); // so Space jumps instead of pressing a focused button
      setGameMode((on) => !on);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The channel being streamed: its pages not yet fetched (in random order) and whether a fetch is
  // in flight. Only one request at a time, and only when a nearby room is empty, so Are.na
  // doesn't throttle big channels.
  const source = useRef(null);

  const loadChannel = async (input) => {
    const slug = arenaSlug(input);
    setStatus('');
    setLoading({ slug });
    try {
      const total = await fetchChannelLength(slug);
      if (!total) throw new Error('That channel is empty');
      const pages = Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1);
      for (let i = pages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pages[i], pages[j]] = [pages[j], pages[i]];
      }
      source.current = { slug, pages, busy: false };
      setLoading({ slug, total });
      setImages(Array(total).fill(null)); // the whole layout exists now; rooms fill as you approach
      // Shareable link: ?channel=<slug>
      window.history.replaceState(null, '', `?channel=${encodeURIComponent(slug)}`);
    } catch (e) {
      setStatus(e.message);
      setLoading(null);
    }
  };

  const loadMore = useCallback(async (center) => {
    const src = source.current;
    if (!src || src.busy || !src.pages.length) return;
    src.busy = true;
    const page = src.pages.pop();
    try {
      const batch = await fetchArenaPage(src.slug, page);
      if (source.current !== src) return; // another channel was loaded meanwhile
      // Always a new array, even for a page with no images, so Rooms asks again if still empty
      setImages((current) => fillNearest(current, roomLayout(current.length), center, batch));
      setLoading(null);
      setStatus(''); // clears an earlier rate-limit message once a retry works
      src.busy = false;
    } catch (e) {
      src.pages.push(page);
      setStatus(e.message);
      setLoading(null);
      // Back off, then nudge Rooms (a new array) so it asks again if rooms are still empty
      setTimeout(() => {
        src.busy = false;
        if (source.current === src) setImages((current) => current.slice());
      }, 5000);
    }
  }, []);

  // Load the channel from the URL on first visit
  useEffect(() => {
    if (channel) loadChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rooms = useMemo(() => roomLayout(images.length), [images.length]);
  const shown = useMemo(() => images.filter(Boolean).length, [images]);
  const loadedRooms = Math.min(rooms.length, (2 * LOAD_RINGS + 1) ** 2);

  return (
    <div
      className="App"
      onPointerDown={(e) => {
        if (e.button === 2) e.currentTarget.style.cursor = 'grabbing';
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.cursor = '';
      }}
      onMouseDown={(e) => {
        if (e.button === 1) e.preventDefault(); // stop Windows middle-click autoscroll
      }}
      // Drop a channel link (dragged from the address bar or a page) anywhere to load it
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const link = (e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')).trim();
        if (!link) return;
        e.preventDefault();
        setChannel(link);
        loadChannel(link);
      }}
    >
      {loading && (
        <div className="loading" role="status">
          <span className="loading-ring" aria-hidden="true" />
          <p>Loading {loading.slug}</p>
          <p className="loading-count">
            {loading.total ? `${loading.total} blocks · fetching the nearest ${PAGE_SIZE}` : 'Contacting Are.na…'}
          </p>
        </div>
      )}
      <form
        className="channel-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (channel.trim()) loadChannel(channel);
        }}
      >
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          {/* Sun in light mode; in dark mode a shadow slides over it into a crescent moon */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <mask id="moon-shadow">
              <rect width="24" height="24" fill="white" />
              <circle className="moon-shadow" cx="25" cy="-1" r="6" fill="black" />
            </mask>
            <circle className="sun" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-shadow)" />
            <g className="rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2M4.6 4.6 6 6M18 18l1.4 1.4M4.6 19.4 6 18M18 6l1.4-1.4" />
            </g>
          </svg>
        </button>
        <select
          aria-label="Character"
          value={who}
          onChange={(e) => {
            setWho(e.target.value);
            e.target.blur(); // otherwise WASD and arrows keep changing the selection
          }}
        >
          {Object.entries(CHARACTERS).map(([id, c]) => (
            <option key={id} value={id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          aria-label="Are.na channel link"
          placeholder="Paste an Are.na channel link"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
        <button type="submit">Load</button>
        {(status || source.current) && (
          <span role="status">{status || `${shown} of ${images.length} loaded`}</span>
        )}
      </form>
      <p className="controls-hint">
        {gameMode
          ? 'Game · click to capture the mouse (Esc frees it) · WASD run · Shift sprint · Space jump (again in mid-air to double jump) · run into a wall to climb, Space to leap off · scroll zoom · V to exit'
          : 'WASD move · drag orbit · right-drag pan · scroll zoom · V to play'}
      </p>
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Scene />
        <ambientLight intensity={1} />
        <OrbitControls
          makeDefault // exposes the target to Rooms for streaming
          screenSpacePanning={false} // panning slides along the ground
          // Left orbits, right pans like a hand tool (two-finger click-drag on trackpads),
          // wheel scrolls/drags to zoom
          mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
          enableZoom={true}
          enabled={!gameMode} // game mode drives the camera itself
          maxDistance={20 * Math.sqrt(loadedRooms)}
          minDistance={2}
        />
        {gameMode ? <Player who={who} /> : <KeyboardMove />}
        <Rooms rooms={rooms} images={images} onNeedMore={loadMore} />
        {/* Add a helper grid for better orientation */}
       {/* <gridHelper args={[100, 100]} /> */}
      </Canvas>
    </div>
  );
}

export default App;
