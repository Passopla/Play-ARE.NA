import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AnimationMixer, LoopOnce, MeshLambertMaterial, SRGBColorSpace, TextureLoader } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Playable characters, first is the default. All share one rig, so every clip below fits each.
// height = model units (cm) from feet to top of head, used to scale it to the game's size.
export const CHARACTERS = {
  WOMAN_01: { label: 'Samu', model: import.meta.env.BASE_URL + 'Characters/WOMAN_01/WOMAN_01/WOMAN_00_Model.fbx', texture: import.meta.env.BASE_URL + 'Characters/WOMAN_01/WOMAN_01/WOMAN_00_Texture.png', height: 197 },
  MAN_00: { label: 'Bongz', model: import.meta.env.BASE_URL + 'Characters/MAN_00/MAN_00/MAN_00_Model.fbx', texture: import.meta.env.BASE_URL + 'Characters/MAN_00/MAN_00/MAN_00_Texture.png', height: 197 },
};
const ROOT_TRACK = 'metarig.position'; // Mixamo put the body's travel on the rig root
const FADE = 0.15; // seconds to blend between clips
const BORED_AFTER = 10; // seconds standing still before a fidget (talk, dance) plays

// Mixamo clips, all from the same upload so they drive this rig's bone names.
// speed = playback rate. once = play through, hold the last frame, then hand over to `then`.
// groundSpeed = how fast the clip's feet travel (cm/s, measured from the planted foot); playback
// then follows the character's actual speed, so feet never slide.
// Travel is stripped from every clip except the mantle: the physics does the moving.
const CLIPS = {
  run: { file: 'Standard Run', groundSpeed: 316 },
  jump: { file: 'Running Jump', once: true, then: 'fall' },
  doubleJump: { file: 'Running Jump', once: true, then: 'fall' }, // own action so it restarts mid-air
  wallJump: { file: 'Jump From Wall', once: true, then: 'fall' },
  fall: { file: 'Falling Idle' },
  land: { file: 'Hard Landing', once: true, speed: 1.5, then: 'idle' },
  hang: { file: 'Hanging Idle' },
  climbUp: { file: 'Climbing Up Wall (1)', groundSpeed: 65 },
  climbDown: { file: 'Climbing Down Wall', groundSpeed: 65, alignTo: 'climbUp' }, // exported 1.3m higher
  mantle: { file: 'Braced Hang To Crouch', once: true, rootMotion: true },
  // Standing still: each idle plays through and then another is picked at random
  idleCalm: { file: 'idle/Idle', once: true, then: 'idle' },
  idleHappy: { file: 'idle/Happy Idle', once: true, then: 'idle' },
  talk: { file: 'idle/Talking', once: true, then: 'idle' },
  hipHop: { file: 'idle/Hip Hop Dancing', once: true, then: 'idle' },
  booty: { file: 'idle/Booty Hip Hop Dance', once: true, then: 'idle' },
  salsa: { file: 'idle/Salsa Dancing', once: true, then: 'idle' },
  circle: { file: 'idle/Walk In Circle', once: true, then: 'idle' },
};
const IDLES = ['idleCalm', 'idleHappy'];
const FIDGETS = ['talk', 'hipHop', 'booty', 'salsa', 'circle'];
const EMOTES = [...FIDGETS, ...IDLES]; // C steps through these while standing still
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Braced Hang To Crouch, measured from the clip, in body heights. It starts with the hands at
// `grip` above the feet, and ends crouched `forward` in front of where it started.
export const MANTLE = { time: 0.75, grip: 0.9, forward: 0.26 };

// Subtract the root's start-to-end drift (keeping the bob) and shift it by `offset`
function removeTravel(clip, offset = [0, 0, 0]) {
  const track = clip.tracks.find((t) => t.name === ROOT_TRACK);
  if (!track) return;
  const { times, values: v } = track;
  const n = times.length;
  const end = times[n - 1] || 1;
  const drift = [0, 1, 2].map((k) => v[(n - 1) * 3 + k] - v[k]);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) v[i * 3 + k] += offset[k] - (drift[k] * times[i]) / end;
  }
}

const rootStart = (clip) => [...clip.tracks.find((t) => t.name === ROOT_TRACK).values.slice(0, 3)];

// Plays whichever clip `pose.current` names, cross-fading between them. 'idle' means "standing
// still": it cycles randomly through IDLES, with a FIDGET once it's been still for BORED_AFTER,
// or plays the next of EMOTES each time C is pressed.
export function Character({ who, pose, pace, height }) {
  const look = CHARACTERS[who];
  const names = Object.keys(CLIPS);
  const [model, ...files] = useLoader(FBXLoader, [look.model, ...names.map((n) => encodeURI(`${import.meta.env.BASE_URL}anims/${CLIPS[n].file}.fbx`))]);
  const texture = useLoader(TextureLoader, look.texture);

  const { mixer, actions } = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.material = new MeshLambertMaterial({ map: texture });
      o.frustumCulled = false; // bounds come from the bind pose; animated limbs leave them
    });

    const mixer = new AnimationMixer(model);
    const raw = Object.fromEntries(names.map((n, i) => [n, files[i].animations[0]]));
    const actions = {};
    for (const n of names) {
      const { once, speed = 1, rootMotion, alignTo } = CLIPS[n];
      const clip = raw[n].clone(); // loader results are cached; don't edit them in place
      if (!rootMotion) {
        const from = rootStart(raw[n]);
        removeTravel(clip, alignTo ? rootStart(raw[alignTo]).map((x, k) => x - from[k]) : undefined);
      }
      const action = mixer.clipAction(clip);
      if (once) {
        action.setLoop(LoopOnce);
        action.clampWhenFinished = true;
      }
      action.timeScale = speed;
      actions[n] = action;
    }
    actions.mantle.timeScale = actions.mantle.getClip().duration / MANTLE.time;
    return { mixer, actions };
  }, [model, texture]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => mixer.stopAllAction(), [mixer]);

  const playing = useRef({ requested: null, name: null, still: 0 });
  const asked = useRef(null); // emote picked with C, played on the next frame

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyC' || e.repeat || e.target.closest?.('input, textarea, select')) return;
      if (pose.current !== 'idle') return;
      asked.current = EMOTES[(EMOTES.indexOf(playing.current.name) + 1) % EMOTES.length];
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pose]);

  useFrame((_, delta) => {
    const p = playing.current;
    p.still += delta;
    const finished = CLIPS[p.name]?.then && !actions[p.name].isRunning();
    let next = p.name;
    if (pose.current !== p.requested) {
      next = p.requested = pose.current;
      p.still = 0;
    } else if (finished) next = CLIPS[p.name].then;
    if (next === 'idle') {
      next = p.still > BORED_AFTER ? pick(FIDGETS) : pick(IDLES);
      if (FIDGETS.includes(next)) p.still = 0;
    }
    if (asked.current) {
      if (pose.current === 'idle') {
        next = asked.current;
        p.still = 0;
      }
      asked.current = null;
    }

    if (next === p.name) {
      if (finished) actions[next].reset(); // picked the same idle again: replay it
    } else {
      const from = actions[p.name];
      const to = actions[next].reset().play();
      // The mantle ends with the root up on the ledge, right where the body is teleported to,
      // so cut instantly; blending would sink it back down for a moment
      if (from && p.name === 'mantle') from.stop();
      else if (from) to.crossFadeFrom(from, FADE, false);
      p.name = next;
    }
    const { groundSpeed } = CLIPS[p.name] ?? {};
    if (groundSpeed) actions[p.name].timeScale = pace.current / ((groundSpeed * height) / look.height);
    mixer.update(delta);
  });

  return (
    <>
      <hemisphereLight args={['#ffffff', '#55556a', 3]} />
      <primitive object={model} scale={height / look.height} position={[0, -height / 2, 0]} />
    </>
  );
}
