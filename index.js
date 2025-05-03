import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
import { OrbitControls} from 'https://unpkg.com/three@0.157.0/examples/jsm/controls/OrbitControls.js?module';  // ?module is needed to prevent white screen


// Set up scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Background color  dark gray 0x222222

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LOADER
const loader = new THREE.TextureLoader();

// Geometery for components
const topGeometry = new THREE.SphereGeometry(1.7,32,16,0, Math.PI * 2, 0, Math.PI / 2);
topGeometry.scale(1, 0.5, 1); // Flatten the hemisphere to height = 50% radius
const middleGeometry = new THREE.CylinderGeometry(1.7,1.7,2.5,35);
const bottomGeometry = new THREE.SphereGeometry(1.7,32,16,0, Math.PI * 2, 0, Math.PI / 2, Math.PI / 2);
// const bottomGeometry = new THREE.SphereGeometry(1.7,32,16);
bottomGeometry.scale(1, 0.5, 1); // Flatten the hemisphere to height = 50% radius

// Create initial white capsule
const topMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
const middleMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});

// Create capsule components with white material
const topHemisphere = new THREE.Mesh(topGeometry, topMaterial);
topHemisphere.position.y = 2.5 / 2;  // simi circle
topHemisphere.rotation.y = Math.PI / 2; // rotate 90 clockwise

const middleCylinder = new THREE.Mesh(middleGeometry, middleMaterial);
const bottomHemisphere = new THREE.Mesh(bottomGeometry, bottomMaterial);

bottomHemisphere.rotation.y = -Math.PI / 2; // rotate 90 clockwise
bottomHemisphere.position.y = -2.5 / 2;     // Positions the hemisphere on the y axis
bottomHemisphere.rotation.x = Math.PI;      // Inverts the hemisphere from a n to a U
// bottomHemisphere.rotation.x = 0;      // Inverts the hemisphere from a n to a U
// bottomHemisphere.material.wireframe = true; //debugging


const capsule = new THREE.Group(); 
capsule.add(topHemisphere);
capsule.add(middleCylinder);
capsule.add(bottomHemisphere);

// Add capsule to the scene
scene.add(capsule);

// Add lighting  *********************************
const light = new THREE.PointLight(0xffffff, 1 , 100);  // 0xffffff
light.position.set(10, 10, 10);
scene.add(light);

// Add ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Soft white light
scene.add(ambientLight);

// Set camera position
camera.position.set(0, 0, 5);  // Ensure camera position

// Add orbit controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();

// Fetch and populate dropdown

let fetchAttempts = 0;
const MAX_FETCH_ATTEMPTS = 5;


async function fetchData() {
    if (fetchAttempts >= MAX_FETCH_ATTEMPTS) {
        console.error("Max fetch attempts reached");
        return;
    }
    try {
        const response = await fetch('/api/files');
        
        console.log('Response: ', response); // Log response object
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        
        const files = await response.json();


        console.log('Files: ', files); // log the file data

        populateDropdown(files);
    } catch (error) {
        console.error('Error fetching files:', error);
    }
}

function populateDropdown(files) {
    const dropdown = document.getElementById('fileDropdown');

    // Clear existing options if any present
    dropdown.innerHTML = '<option disabled selected>--Select a file--</option>';

    const uniqueBaseNames = new Set();

    files.forEach((file) => {
        const match = file.match(/^(.+)-(top|middle|bottom)\.jpg$/);
        const baseName = match ? match[1] : file.replace(/\.[^/.]+$/, '');
        uniqueBaseNames.add(baseName);
    });

    uniqueBaseNames.forEach((baseName) => {
        const option = document.createElement('option');
        option.value = baseName;
        option.textContent = baseName;
        dropdown.appendChild(option);       
    });

    dropdown.addEventListener('change', () => {
        console.log('Selected file:', dropdown.value); // debug
        updateTexture(dropdown.value);
    });
}
////////////////////////////////////////////////////////////////////
// Update capsule texture
function updateTexture(fileName) {
// const loader = new THREE.TextureLoader();
// Top texture
    const topTexture = loader.load(`./files/${fileName}-top.jpg`);
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;
topTexture.flipY = true;

        topMaterial.map =topTexture;
        topMaterial.needsUpdate = true;
 // Middle texture   
    const middleTexture = loader.load(`./files/${fileName}-middle.jpg`);
    middleTexture.wrapS = THREE.RepeatWrapping;
    middleTexture.wrapT = THREE.RepeatWrapping;
middleTexture.flipY = true;

        middleMaterial.map = middleTexture;
        middleMaterial.needsUpdate = true; 
// Bottom texture  
    const bottomTexture = loader.load(`./files/${fileName}-bottom.jpg`);
    bottomTexture.wrapS = THREE.RepeatWrapping;
    bottomTexture.wrapT = THREE.RepeatWrapping;
    bottomTexture.center.set(0.5, 0.5);
    bottomTexture.rotation = Math.PI;
bottomTexture.flipY = true; 

        bottomMaterial.map = bottomTexture;
        bottomMaterial.needsUpdate = true;




 
    
    
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the capsule
    // capsule.rotation.x += 0.005;
    capsule.rotation.y += 0.005;   // keap this

    renderer.render(scene, camera);
}

animate();
fetchData();



