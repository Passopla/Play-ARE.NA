# Floating Linked Images 3D: The Game

The game side of [Floating Linked Images 3D](https://github.com/Passopla/Floating-Linked-Images-3D). Paste any public [are.na](https://www.are.na) channel and it becomes a world of floating billboards. Then press **V** and explore it as a miniature character: run across the images, jump the gaps, climb the walls and pull yourself up onto their edges.

> Looking for the original 3D image layout, the version on the Studio side of [amanziconnexions.com](https://amanziconnexions.com)? That lives on the [`master`](https://github.com/Passopla/Floating-Linked-Images-3D/tree/master) branch. This `game` branch is where the game is being built.

Inspired by this GIF: ![Inspiration GIF](https://d2w9rnfcy7mm78.cloudfront.net/25331503/original_8fd108a2dc340a19c9238bf5dac151f2.gif?1703160360)

## What's in it

- **Any are.na channel:** paste a link, or drag one onto the page. Each room keeps the original nine-image layout. It always has floors, and a random mix of walls.
- **Channels of any size:** images stream in 25 at a time, filling the rooms nearest you first. A 3,000-image channel never loads all at once.
- **Sharp up close, light far away:** each image shows a small version at a distance and swaps in the full-size version as you get near. Rooms you leave are unloaded.
- **Two characters, Samu and Bongz**, animated with Mixamo:
  - run, jump and double jump
  - climb any wall, pull up onto its top edge, or leap off it
  - hard landings after big falls
  - idle animations, plus talking or dancing when left standing a while
- **Close third-person camera** over the shoulder. Click to capture the mouse, and the camera pulls in instead of ending up behind an image.
- **Light and dark mode** with an animated sun and moon toggle.

## Controls

| | Explore mode | Game mode (press **V**) |
|---|---|---|
| Move | WASD / arrows (Shift = faster) | WASD / arrows to run (Shift = sprint) |
| Look | Left-drag to orbit | Click to capture the mouse, then move it (Esc frees it) |
| Pan | Right-drag (two-finger click-drag on a trackpad) | |
| Zoom | Scroll | Scroll |
| Jump | | Space, and Space again in mid-air for a double jump |
| Climb | | Run or jump into a wall, then W/S to climb and A/D to shuffle. Space leaps off |

## Getting started

1. Clone the repository and switch to this branch:
   ```bash
   git clone https://github.com/Passopla/Floating-Linked-Images-3D.git
   cd Floating-Linked-Images-3D
   git checkout game
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Optional: add your [are.na API token](https://dev.are.na) in a file called `.env.local` in the project folder. Public channels work without one.
   ```
   ARENA_TOKEN=your-token-here
   ```
   The token stays on the server: the dev server and the Vercel function add it to are.na requests, so it never reaches the browser. `.env.local` is git-ignored.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Optional: run the layout and physics checks:
   ```bash
   npm run check
   ```

## Deploying on Vercel

1. Import the repository. Vite is detected on its own.
2. If this project's production deployment should be the game, set **Settings → Git → Production Branch** to `game`.
3. Add `ARENA_TOKEN` under **Settings → Environment Variables**. Don't use a `VITE_` prefix, because those variables are built into the browser code.

`vercel.json` routes `/arena/*` to `api/arena.js`, which forwards only the two are.na requests the app makes, with the token added.

## Tuning the game feel

Every movement setting is a named constant at the top of the game section in `src/App.jsx`: run speed, jump height, double-jump burst, climb speed, camera distance and mouse sensitivity, among others. Animation clips and the idle timer are in `src/character.jsx`.

## Built with

- [React](https://reactjs.org/) and [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/), with [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) and [@react-three/drei](https://github.com/pmndrs/drei)

## Credits

Designed by Karl Ndebele.

- **Images:** from [are.na](https://www.are.na) channels
- **Characters (Samu and Bongz):** from [AI Generated Character Pack 2](https://rotinda-dag.itch.io/ai-generated-character-pack-2) by rotinda dag
- **Animations:** from [Mixamo](https://www.mixamo.com)

## License

The code is open-source under the [MIT License](LICENSE). The MIT License doesn't cover the character models or the animations. They belong to their creators and are used under their own terms: the character pack may be used in personal and commercial projects, but the pack itself may not be redistributed or resold. Please get the characters from [the creator's page](https://rotinda-dag.itch.io/ai-generated-character-pack-2), not from this repository.
