# 3D Image Layout with Three.js

This project is a basic template designed to help people get started with Three.js. It showcases a 3D layout of images using React and Three.js, allowing for interactive exploration of images placed in a 3D space.

screenCap: ![SCREENCAP](https://d2w9rnfcy7mm78.cloudfront.net/35042926/original_cb32293a4381e0f365057a1c92d0812c.gif?1741307461)

## Features

- Displays images in a 3D environment using Three.js
- Interactive controls to explore the scene
- Supports both static images and animated GIFs
- Simple and precise coordinate systems for positioning

## Dependencies

This project uses the following libraries:

- [React](https://reactjs.org/): A JavaScript library for building user interfaces
- [Three.js](https://threejs.org/): A 3D library that makes WebGL simpler
- [@react-three/fiber](https://github.com/pmndrs/react-three-fiber): A React renderer for Three.js
- [@react-three/drei](https://github.com/pmndrs/drei): Useful helpers for react-three-fiber

Inspired by this GIF: ![Inspiration GIF](https://d2w9rnfcy7mm78.cloudfront.net/25331503/original_8fd108a2dc340a19c9238bf5dac151f2.gif?1703160360)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd 3d-image-layout
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Image Credits

The images used in this project were sourced from [are.na](https://www.are.na):

![Image 1](https://d2w9rnfcy7mm78.cloudfront.net/3894388/original_1e9e4ee58447dd9add36c08b6e4b2dd2.gif?1553011688)
![Image 2](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIyNTMzMTU2MC9vcmlnaW5hbF8yOWEyNGJlNGYzMTBiM2JmZTEyNjE3MGU1OGUzNmRlZi5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=)
![Image 3](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI3NzE0NDE5L29yaWdpbmFsX2JiMTNhNmEwOThlMWI0ZGQyMDIwMDYxOC00LTFkMnpyaDQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjozMDAsImhlaWdodCI6MzAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOnRydWV9LCJ3ZWJwIjp7InF1YWxpdHkiOjc1fSwiZmxhdHRlbiI6eyJiYWNrZ3JvdW5kIjp7InIiOjIwMywiZyI6MjAzLCJiIjoyMDN9fSwianBlZyI6eyJxdWFsaXR5Ijo3NX0sInJvdGF0ZSI6bnVsbH19)
![Image 4](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAzNTIxOS9vcmlnaW5hbF9jYzI5ZTAxMDE1MWVmNzZkMDI2N2JkODRlNGNiZDZiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=)
![Image 5](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAyMzY5MC9vcmlnaW5hbF9hZTBjNmE1NjU1MWYzMWI0YTI2MjcwMzJiY2ViYzBiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=)
![Image 6](https://d2w9rnfcy7mm78.cloudfront.net/34702321/original_065555d22addd36aa9eecbd9d621c5a7.gif?1740113172)
![Image 7](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjI5Mi9vcmlnaW5hbF8zNjU0ZjA5NzZhNTFhZjhiODNhMzQ5NTgwMjJlMjdkMi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=)
![Image 8](https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjE3Ni9vcmlnaW5hbF9mOGJhYWYwYTZlMDI3NWI5YjFiNzM0MTJjYWMxYTcwOS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=)
![Image 9](https://d2w9rnfcy7mm78.cloudfront.net/34702184/original_dc6fcb41eecc6bf457e7e388f47aac3f.gif?1740112610)

## Credits

Designed by Karl Ndebele using Cursor. Images were sourced from [are.na](https://www.are.na).

## License

This project is open-source and available under the [MIT License](LICENSE).
