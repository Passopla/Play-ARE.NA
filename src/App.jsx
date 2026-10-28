import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LinearMipmapLinearFilter, Matrix4, NearestFilter, MOUSE, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { useState, useEffect, useRef, useMemo } from 'react';
import { roomLayout, roomsNear, ROOM_SPACING } from './layout';
import { fetchArenaImages, arenaSlug } from './arena';
import { colliders, colliderFromObject, halfExtents, moveAndCollide, nearestFloorTop } from './physics';
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
function Rooms({ rooms, images }) {
  const cells = useMemo(() => rooms.map((room) => room.cell), [rooms]);
  const [active, setActive] = useState(() => new Set());
  const lastCell = useRef(null);

  useEffect(() => {
    lastCell.current = null; // new channel: recompute on the next frame
  }, [cells]);

  useFrame(({ camera, controls }) => {
    const { x, z } = controls?.target ?? camera.position;
    const cell = `${Math.round(x / ROOM_SPACING)},${Math.round(z / ROOM_SPACING)}`;
    if (cell === lastCell.current) return;
    lastCell.current = cell;
    setActive((prev) => roomsNear(cells, [x, z], prev, LOAD_RINGS, LOAD_RINGS + 1));
  });

  return [...active].flatMap((room) =>
    // Each image streams in on its own rather than waiting for the whole room
    (rooms[room]?.items ?? []).map(({ index, position, rotation }) => (
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
      if (!captured.has(e.code) || e.target.closest?.('input, textarea')) return;
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

// Camera-relative direction along a surface (normal `up`) from held move keys, written into
// `out` (zero if none). Forward blends the camera's view and screen-up directions flattened onto
// the surface, so it stays sensible whether you look along a surface or straight at a wall
// (where W then means "up the wall").
function moveDirection(pressed, camera, up, out, right) {
  let r = 0, f = 0;
  for (const code of pressed) {
    if (!MOVE_KEYS[code]) continue;
    r += MOVE_KEYS[code][0];
    f += MOVE_KEYS[code][1];
  }
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
const RUN_SPEED = 5;
const SPRINT_MULTIPLIER = 1.6; // Shift
const GRAVITY = 25;
const JUMP_SPEED = 9; // jump height = JUMP_SPEED² / (2 * GRAVITY) ≈ 1.6, about 4x the character
const WALL_JUMP_PUSH = 5; // jumping off a wall pushes this fast away from it, plus JUMP_SPEED upward
const WALL_LET_GO_TIME = 0.15; // feet leave a wall after this long without touching it (ran off an edge)
const COYOTE_TIME = 0.1; // can still jump this long after running off an edge
const JUMP_BUFFER = 0.12; // a jump pressed this long before landing still fires
const FALL_LIMIT = -30; // respawn below this height
const CAMERA_HEIGHT = 0.25; // camera orbits this far above the character's centre
const CAMERA_DISTANCE = 3;
const GAME_KEYS = new Set([...NAV_KEYS, 'Space']);

// Switch which surface the feet stick to. The body is taller along its up axis, so it's
// pushed out from the surface by the difference to keep the feet on it.
function standOn(b, axis, sign) {
  const old = b.half;
  b.up = { axis, sign };
  b.upVec.set(0, 0, 0);
  b.upVec[axis] = sign;
  b.half = halfExtents(axis, PLAYER_RADIUS, PLAYER_HALF_HEIGHT);
  b.pos[axis] += (b.half[axis] - old[axis]) * sign;
}

// Placeholder character: capsule with a visor showing which way it faces. Magnetic feet: touching
// a wall sticks to it and gravity then pulls toward that wall, so you can run on it indefinitely.
// The orbit camera follows, so left-drag/scroll still look around and zoom.
function Player() {
  const group = useRef();
  const keys = usePressedKeys(GAME_KEYS);
  const body = useRef(null);
  const [move, right, lastTarget, side] = useMemo(
    () => [new Vector3(), new Vector3(), new Vector3(), new Vector3()],
    []
  );
  const basis = useMemo(() => new Matrix4(), []);

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
        up: { axis: 'y', sign: 1 },
        upVec: WORLD_UP.clone(),
        half: halfExtents('y', PLAYER_RADIUS, PLAYER_HALF_HEIGHT),
        facing: new Vector3(0, 0, 1),
        sinceGround: Infinity,
        sinceJumpPress: Infinity,
        spaceWasDown: false,
      };
      // Pull the camera in behind, keeping its current viewing angle
      const offset = camera.position.clone().sub(controls.target).setLength(CAMERA_DISTANCE);
      controls.target.copy(spawn).y += CAMERA_HEIGHT;
      camera.position.copy(controls.target).add(offset);
    }
    const b = body.current;
    const { pressed, shift } = keys.current;
    const onWall = b.up.axis !== 'y';

    // Run along whatever surface the feet are on, keeping velocity toward/away from it
    moveDirection(pressed, camera, b.upVec, move, right);
    const normalSpeed = b.vel.dot(b.upVec);
    b.vel.copy(move).multiplyScalar(RUN_SPEED * (shift ? SPRINT_MULTIPLIER : 1));
    b.vel.addScaledVector(b.upVec, normalSpeed);

    const spaceDown = pressed.has('Space');
    b.sinceJumpPress = spaceDown && !b.spaceWasDown ? 0 : b.sinceJumpPress + dt;
    b.spaceWasDown = spaceDown;
    if (b.sinceJumpPress < JUMP_BUFFER && b.sinceGround < COYOTE_TIME) {
      if (onWall) {
        // Leap off the wall back into normal gravity
        b.vel.addScaledVector(b.upVec, WALL_JUMP_PUSH - normalSpeed);
        b.vel.y = JUMP_SPEED;
        standOn(b, 'y', 1);
      } else {
        b.vel.y = JUMP_SPEED;
      }
      b.sinceJumpPress = b.sinceGround = Infinity;
    }
    b.vel.addScaledVector(b.upVec, -GRAVITY * dt);

    const contacts = moveAndCollide(b.pos, b.vel, b.half, colliders, dt);
    let grounded = contacts.some(([axis, sign]) => axis === b.up.axis && sign === b.up.sign);
    // Magnetic feet: stick to any new surface touched, except the undersides of floors
    const surface = contacts.find(
      ([axis, sign]) => !(axis === b.up.axis && sign === b.up.sign) && !(axis === 'y' && sign === -1)
    );
    if (surface) {
      standOn(b, ...surface);
      grounded = true;
    }
    b.sinceGround = grounded ? 0 : b.sinceGround + dt;
    if (b.up.axis !== 'y' && b.sinceGround > WALL_LET_GO_TIME) standOn(b, 'y', 1); // ran off a wall's edge

    if (b.pos.y < FALL_LIMIT) {
      b.pos.copy(b.spawn);
      b.vel.set(0, 0, 0);
      standOn(b, 'y', 1);
    }

    // Stand along the surface normal, facing the direction of travel
    if (move.lengthSq()) b.facing.copy(move);
    b.facing.addScaledVector(b.upVec, -b.facing.dot(b.upVec));
    if (b.facing.lengthSq() < 1e-6) b.facing.set(b.up.axis === 'z' ? 1 : 0, 0, b.up.axis === 'z' ? 0 : 1);
    b.facing.normalize();
    side.crossVectors(b.upVec, b.facing);
    group.current.quaternion.setFromRotationMatrix(basis.makeBasis(side, b.upVec, b.facing));
    group.current.position.copy(b.pos);

    // Camera follows: shift it by however far the target moved
    lastTarget.copy(controls.target);
    controls.target.copy(b.pos).addScaledVector(b.upVec, CAMERA_HEIGHT);
    camera.position.add(lastTarget.subVectors(controls.target, lastTarget));
    controls.update();
  });

  return (
    <group ref={group}>
      <mesh>
        {/* radius, straight length: 0.08 + 0.24 + 0.08 = 0.4 tall */}
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HALF_HEIGHT * 2 - PLAYER_RADIUS * 2, 8, 16]} />
        <meshNormalMaterial />
      </mesh>
      <mesh position={[0, 0.11, 0.065]}>
        <boxGeometry args={[0.1, 0.035, 0.04]} />
        <meshBasicMaterial color="#111" />
      </mesh>
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
  const [gameMode, setGameMode] = useState(false);

  // V toggles game mode (third-person character) and back to free navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyV' || e.repeat || e.target.closest?.('input, textarea')) return;
      document.activeElement?.blur(); // so Space jumps instead of pressing a focused button
      setGameMode((on) => !on);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadChannel = async (input) => {
    setStatus('Loading…');
    try {
      const urls = await fetchArenaImages(input);
      if (!urls.length) throw new Error('No images in that channel');
      setImages(urls);
      setStatus(`${urls.length} images`);
      // Shareable link: ?channel=<slug>
      window.history.replaceState(null, '', `?channel=${encodeURIComponent(arenaSlug(input))}`);
    } catch (e) {
      setStatus(e.message);
    }
  };

  // Load the channel from the URL on first visit
  useEffect(() => {
    if (channel) loadChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rooms = useMemo(() => roomLayout(images.length), [images]);
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
    >
      <form
        className="channel-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (channel.trim()) loadChannel(channel);
        }}
      >
        <input
          aria-label="Are.na channel link"
          placeholder="Paste an Are.na channel link"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
        <button type="submit">Load</button>
        {status && <span role="status">{status}</span>}
      </form>
      <p className="controls-hint">
        {gameMode
          ? 'Game · WASD run · Shift sprint · Space jump · drag to look · V to exit'
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
          enablePan={!gameMode} // the camera stays locked on the character in game mode
          maxDistance={gameMode ? 15 : 20 * Math.sqrt(loadedRooms)}
          minDistance={gameMode ? 0.5 : 2} // closer in game mode: the character is tiny
        />
        {gameMode ? <Player /> : <KeyboardMove />}
        <Rooms rooms={rooms} images={images} />
        {/* Add a helper grid for better orientation */}
       {/* <gridHelper args={[100, 100]} /> */}
      </Canvas>
    </div>
  );
}

export default App;
