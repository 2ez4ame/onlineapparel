// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let object;
let controls;
let objToRender = 'tshirt';
const loader = new GLTFLoader();

loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    console.log('Model loaded:', gltf);
    object = gltf.scene;
    object.position.set(0, -10, 0);
  
    // Set initial color for the T-shirt material
    object.traverse((node) => {
      if (node.isMesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: "#ffffff", // Set initial color
          side: THREE.DoubleSide // Render both sides
        });
        node.castShadow = true; // Ensure the object casts shadows
        node.receiveShadow = true; // Ensure the object receives shadows
      }
    });

    scene.add(object);
    console.log(`${objToRender} model loaded successfully`);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(`Error loading ${objToRender} model:`, error);
  }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);
camera.position.z = objToRender === "tshirt" ? 50 : 500;

const topLight = new THREE.DirectionalLight(0xFFA07A, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, objToRender === "tshirt" ? 5 : 1);
scene.add(ambientLight);

const planeGeometry = new THREE.PlaneGeometry(500, 500);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -10.5;
plane.receiveShadow = true;
scene.add(plane);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
topLight.castShadow = true;
topLight.shadow.mapSize.width = 1024;
topLight.shadow.mapSize.height = 1024;
topLight.shadow.camera.near = 0.5;
topLight.shadow.camera.far = 500;

controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);

  if (object) {
    console.log('Rendering object:', object);
    if (objToRender === "eye") {
      object.rotation.y += 0.01;
      const bobbingSpeed = 0.02;
      const bobbingAmplitude = 0.1;
      object.position.y = -10 + Math.sin(Date.now() * bobbingSpeed) * bobbingAmplitude;
      
      const tiltSpeed = 0.01;
      object.rotation.x += Math.sin(Date.now() * tiltSpeed) * 0.005;
      const mouseTiltFactor = 0.01;
      object.rotation.y += (mouseX / window.innerWidth - 0.5) * mouseTiltFactor;
      object.rotation.x += (mouseY / window.innerHeight - 0.5) * mouseTiltFactor;
    }
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

// Add color picker functionality
document.getElementById("colorPicker").addEventListener("input", (e) => {
  const color = e.target.value;

  // Apply color to the T-shirt model material
  if (object) {
    object.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.color.set(color);
      }
    });
  }
});

animate();