import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { TextureLoader, RepeatWrapping, NearestFilter } from 'three';
import { useState, Suspense, useEffect, useRef } from 'react';
import './App.css';

function Window({ position, imageUrl, rotation = [0, 0, 0] }) {
  const meshRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  
  useEffect(() => {
    // Create a temporary image element to get the dimensions
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      // Keep the image from being too big, but keep the aspect ratio
      const maxSize = 3;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        width = maxSize;
        height = width / aspectRatio;
      } else {
        height = maxSize;
        width = height * aspectRatio;
      }
      
      setDimensions({ width, height });
    };
  }, [imageUrl]);

  // Use useTexture to load the image/gif
  const texture = useTexture(imageUrl);
  
  // configure the texture for GIF support
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
      texture.flipY = true;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[dimensions.width, dimensions.height]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true}
        toneMapped={false}
        side={2} // Render both sides of the plane
      />
    </mesh>
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

function simplePos(x, z) {
  const halfSpacing = 2; // Matches your existing spacing
  return [
    x * halfSpacing, 
    -0.01, 
    z * halfSpacing
  ];
}

function App() {
  const images = [
    'https://d2w9rnfcy7mm78.cloudfront.net/3894388/original_1e9e4ee58447dd9add36c08b6e4b2dd2.gif?1553011688',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIyNTMzMTU2MC9vcmlnaW5hbF8yOWEyNGJlNGYzMTBiM2JmZTEyNjE3MGU1OGUzNmRlZi5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI3NzE0NDE5L29yaWdpbmFsX2JiMTNhNmEwOThlMWI0ZGQyMDIwMDYxOC00LTFkMnpyaDQuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjozMDAsImhlaWdodCI6MzAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOnRydWV9LCJ3ZWJwIjp7InF1YWxpdHkiOjc1fSwiZmxhdHRlbiI6eyJiYWNrZ3JvdW5kIjp7InIiOjIwMywiZyI6MjAzLCJiIjoyMDN9fSwianBlZyI6eyJxdWFsaXR5Ijo3NX0sInJvdGF0ZSI6bnVsbH19',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAzNTIxOS9vcmlnaW5hbF9jYzI5ZTAxMDE1MWVmNzZkMDI2N2JkODRlNGNiZDZiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNTAyMzY5MC9vcmlnaW5hbF9hZTBjNmE1NjU1MWYzMWI0YTI2MjcwMzJiY2ViYzBiOC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
    'https://d2w9rnfcy7mm78.cloudfront.net/34702321/original_065555d22addd36aa9eecbd9d621c5a7.gif?1740113172',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjI5Mi9vcmlnaW5hbF8zNjU0ZjA5NzZhNTFhZjhiODNhMzQ5NTgwMjJlMjdkMi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
    'https://images.are.na/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNDcwMjE3Ni9vcmlnaW5hbF9mOGJhYWYwYTZlMDI3NWI5YjFiNzM0MTJjYWMxYTcwOS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjMwMCwiaGVpZ2h0IjozMDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbWVudCI6dHJ1ZX0sIndlYnAiOnsicXVhbGl0eSI6NzV9LCJmbGF0dGVuIjp7ImJhY2tncm91bmQiOnsiciI6MjAzLCJnIjoyMDMsImIiOjIwM319LCJqcGVnIjp7InF1YWxpdHkiOjc1fSwicm90YXRlIjpudWxsfX0=',
    'https://d2w9rnfcy7mm78.cloudfront.net/34702184/original_dc6fcb41eecc6bf457e7e388f47aac3f.gif?1740112610'
  ];

  

  const createWindows = () => {
    const windows = [];
    const spacing = 4;
    const halfSpacing = spacing / 2;

    // Four images on the edges (forming a square)
    const edgePositions = [
      { pos: [halfSpacing, 2, 0], rot: [0, -Math.PI / 2, 0] }, // Right
      { pos: [-halfSpacing, 1, 0], rot: [0, Math.PI / 2, 0] }, // Left
      { pos: [0, -1, halfSpacing], rot: [0, Math.PI, 0] }, // Back
      { pos: [0, 0, -halfSpacing], rot: [0, 0, 0] }, // Front
    ];

    // Add edge images
    edgePositions.forEach((config, i) => {
      windows.push(
        <Window
          key={`edge-${i}`}
          position={config.pos}
          rotation={config.rot}
          imageUrl={images[i]}
        />
      );
    });

    // Four images on the floor
    const floorPositions = [
      // [-halfSpacing/2, -0.01, -halfSpacing/2],
      // [halfSpacing/2, -0.01, -halfSpacing/2],
      // [-halfSpacing/2, -0.01, halfSpacing/2],
      // [halfSpacing/2, -0.01, halfSpacing/2],

      // SIMPLE POSITIONS
      simplePos(-0.5, 2),  // Same as [-halfSpacing/2, -0.01, -halfSpacing/2]
      simplePos(0.5, -2),   // Same as [halfSpacing/2, -0.01, -halfSpacing/2]
      simplePos(-2, 0.5),   // Same as [-halfSpacing/2, -0.01, halfSpacing/2]
      simplePos(2, 0.5),    // Same as [halfSpacing/2, -0.01, halfSpacing/2]
    ];

    // Add floor images (rotated to face up)
    floorPositions.forEach((pos, i) => {
      windows.push(
        <Window
          key={`floor-${i}`}
          position={pos}
          rotation={[-Math.PI / 2, 0, 0]} // Rotate to face up
          imageUrl={images[i + 4]}
        />
      );
    });

    // Floating image above
    windows.push(
      <Window
        key="floating"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]} // Face down
        imageUrl={images[8]}
      />
    );

    return windows;
  };

  return (
    <div className="App">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Scene />
        <ambientLight intensity={1} />
        <OrbitControls 
          enableZoom={true}
          maxDistance={20}
          minDistance={2}
          target={[0, 0, 0]}
        />
        <Suspense fallback={null}>
          {createWindows()}
        </Suspense>
        {/* Add a helper grid for better orientation */}
       {/* <gridHelper args={[100, 100]} /> */}
      </Canvas>
    </div>
  );
}

export default App;
