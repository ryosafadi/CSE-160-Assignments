import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import GUI from "gui";

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.shadowMap.enabled = true;

    let score = 0;

    const fov = 75;
    const aspect = 2; 
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 20, 35);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene()

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' || event.key === ' ') {
            const tolerance = 0.5;

            const redRot = redBoxer.rotation.z % (2 * Math.PI);
            const blueRot = blueBoxer.rotation.z % (2 * Math.PI);

            const targetRedRot = 135 * Math.PI / 180;
            const targetBlueRot = 315 * Math.PI / 180;

            const isRedRotApprox = Math.abs(redRot - targetRedRot) < tolerance ||
                                   Math.abs(redRot - (targetRedRot + 2 * Math.PI)) < tolerance ||
                                   Math.abs(redRot - (targetRedRot - 2 * Math.PI)) < tolerance;

            const isBlueRotApprox = Math.abs(blueRot - targetBlueRot) < tolerance ||
                                    Math.abs(blueRot - (targetBlueRot + 2 * Math.PI)) < tolerance ||
                                    Math.abs(blueRot - (targetBlueRot - 2 * Math.PI)) < tolerance;


            if (isRedRotApprox && isBlueRotApprox) {
                score++;
            } else if (score > 0) {
                score--;
            }

            document.getElementById('score').textContent = "Score: " + score;

            const baseSpeed = 3;
            const scoreMultiplier = 0.1;

            const newAngularVelocity = baseSpeed + (score * scoreMultiplier);

            if (redBoxer) {
                redBoxer.userData.angularVelocity = newAngularVelocity;
            }
            if (blueBoxer) {
                blueBoxer.userData.angularVelocity = newAngularVelocity;
            }
        }
    });
    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);

    const manager = new THREE.LoadingManager();

    manager.onLoad = function () {
        requestAnimationFrame(render);
    };

    manager.onError = function ( url ) {
        console.log('There was an error loading ' + url);
    };

    // SHAPES

    // SKYBOX
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'resources/images/boxing-gym/px.png',
            'resources/images/boxing-gym/nx.png',
            'resources/images/boxing-gym/py.png',
            'resources/images/boxing-gym/ny.png',
            'resources/images/boxing-gym/pz.png',
            'resources/images/boxing-gym/nz.png'
        ]);
        scene.background = texture;
    }

    // PLANE
    {
        const planeSize = 40;
        const loader = new THREE.TextureLoader(manager); 
        const texture = loader.load('resources/images/concrete.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = planeSize / 8;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    // RING BASE
    {
        const boxSize = 30;
        const cubeGeo = new THREE.BoxGeometry(boxSize, boxSize / 8, boxSize);
        const cubeMat = new THREE.MeshPhongMaterial({color: '#222'});
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(0, boxSize / 16 + 0.01, 0);
        scene.add(mesh);

        // LOGO OVERLAY
        const textureLoader = new THREE.TextureLoader();
        const logoTexture = textureLoader.load('resources/images/wba.png');
        logoTexture.wrapS = THREE.ClampToEdgeWrapping;
        logoTexture.wrapT = THREE.ClampToEdgeWrapping;
        logoTexture.minFilter = THREE.LinearFilter;
        logoTexture.magFilter = THREE.LinearFilter;

        logoTexture.repeat.set(0.5, 1.25);
        logoTexture.offset.set((1 - 0.5) / 2, (1 - 1.25) / 2);

        const logoMaterial = new THREE.MeshPhongMaterial({
            map: logoTexture,
            transparent: true,
            alphaTest: 0.5
        });

        const planeGeo = new THREE.PlaneGeometry(boxSize, boxSize);
        const logoMesh = new THREE.Mesh(planeGeo, logoMaterial);

        logoMesh.rotation.x = -Math.PI / 2;
        logoMesh.position.y = boxSize / 8 + 0.02;
        scene.add(logoMesh);
    }
    {
        
    }

    // RED CORNER
    {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 0.5, 60 / 8, 30/2 - 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 0.5, 60 / 8 + 4.75, 30/2 - 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.BoxGeometry(1, 6, 0.5);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 3, 60 / 8 + 1 , 30/2 - 3);
        mesh.rotation.y = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 - 1, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 0.5, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 2, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 3.5, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }

    // BLUE CORNER
    {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 0.5, 60 / 8, -30/2 + 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 0.5, 60 / 8 + 4.75, -30/2 + 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.BoxGeometry(1, 6, 0.5);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 3, 60 / 8 + 1, -30/2 + 3);
        mesh.rotation.y = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 - 1, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 0.5, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 2, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 3.5, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 45 * Math.PI / 180;
        scene.add(mesh);
    }

    // WHITE CORNERS
    {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 0.5, 60 / 8, -30/2 + 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 0.5, 60 / 8 + 4.75, -30/2 + 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.BoxGeometry(1, 6, 0.5);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 3, 60 / 8 + 1, -30/2 + 3);
        mesh.rotation.y = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 - 1, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 0.5, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 2, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-30/2 + 1.6, 60 / 8 + 3.5, -30/2 + 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 0.5, 60 / 8, 30/2 - 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 0.5, 60 / 8 + 4.75, 30/2 - 0.5);
        scene.add(mesh);
    }
    {
        const geometry = new THREE.BoxGeometry(1, 6, 0.5);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 3, 60 / 8 + 1, 30/2 - 3);
        mesh.rotation.y = 45 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 - 1, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 0.5, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 2, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(30/2 - 1.6, 60 / 8 + 3.5, 30/2 - 1.6);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 135 * Math.PI / 180;
        scene.add(mesh);
    }

    // ROPES
    // NEAR SIDE ROPES
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 3.5, 30/2 - 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 2, 30/2 - 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 0.5, 30/2 - 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 - 1, 30/2 - 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }

    // FAR SIDE ROPES
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 3.5, -30/2 + 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 2, -30/2 + 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 + 0.5, -30/2 + 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 60 / 8 - 1, -30/2 + 2);
        mesh.rotation.x = 90 * Math.PI / 180;
        mesh.rotation.z = 90 * Math.PI / 180;
        scene.add(mesh);
    }

    // LEFT SIDE ROPES
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-15 + 2, 60 / 8 + 3.5, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-15 + 2, 60 / 8 + 2, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-15 + 2, 60 / 8 + 0.5, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-15 + 2, 60 / 8 - 1, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }

    // RIGHT SIDE ROPES
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#bf0013'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(15 - 2, 60 / 8 + 3.5, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(15 - 2, 60 / 8 + 2, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#FFF'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(15 - 2, 60 / 8 + 0.5, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }
    {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 26, 16);
        const material = new THREE.MeshPhongMaterial({color: '#0a0091'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(15 - 2, 60 / 8 - 1, 0);
        mesh.rotation.x = 90 * Math.PI / 180;
        scene.add(mesh);
    }

    // BOXERS

    let redBoxer;
{
    const objLoader = new OBJLoader(manager); 
    objLoader.load('resources/models/boxer.obj', (root) => {
        root.rotation.x = 270 * Math.PI / 180;
        root.rotation.z = 135 * Math.PI / 180;
        root.position.set(-3.5, 3.75, 3);

        const redMaterial = new THREE.MeshPhongMaterial({color: '#bf0013'});

        root.traverse((child) => {
            if (child.isMesh) {
                child.material = redMaterial;
            }
        });

        redBoxer = root;
        redBoxer.userData.initialRotationZ = redBoxer.rotation.z;
        scene.add(redBoxer);
    });
}

    let blueBoxer;
    {
        const objLoader = new OBJLoader(manager); 
        objLoader.load('resources/models/boxer.obj', (root) => {
            root.rotation.x = 270 * Math.PI / 180;
            root.rotation.z = 315 * Math.PI / 180;
            root.position.set(3.5, 3.75, -3);

            const blueMaterial = new THREE.MeshPhongMaterial({color: '#0a0091'});

            root.traverse((child) => {
                if (child.isMesh) {
                    child.material = blueMaterial;
                }
            });

            blueBoxer = root;
            blueBoxer.userData.initialRotationZ = blueBoxer.rotation.z;
            scene.add(blueBoxer);
        });
    }

    // LIGHTING

    // AMBIENT
    {
        const color = 0xFFFFFF;
        const intensity = 0.2;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
    }

    // SPOTLIGHT
    {
        const color = 0xFFFFFF;
        const intensity = 2000;
        const light = new THREE.SpotLight(color, intensity, 0, Math.PI / 5, 0, 2);
        light.position.set(0, 30, 0);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);

        function updateLight() {
            light.target.updateMatrixWorld();
        }
        updateLight();
    }

    // POINT LIGHTS
    {
        const color = 0xFFFFFF;
        const intensity = 20;
        const light1 = new THREE.PointLight(color, intensity);
        light1.position.set(-30/2 + 0.5, 60 / 8 + 7, 30/2 - 0.5);
        scene.add(light1);

        const light2 = new THREE.PointLight(color, intensity);
        light2.position.set(30/2 - 0.5, 60 / 8 + 8, -30/2 + 0.5);
        scene.add(light2);

        const light3 = new THREE.PointLight(color, intensity);
        light3.position.set(-30/2 + 0.5, 60 / 8 + 8, -30/2 + 0.5);
        scene.add(light3);

        const light4 = new THREE.PointLight(color, intensity);
        light4.position.set(30/2 - 0.5, 60 / 8 + 8, 30/2 - 0.5);
        scene.add(light4);
    }

    // FUNCTION DEFINITIONS
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize( width, height, false );
        }
        return needResize;
    }

    let previousTime = 0;

    function render(time) {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        const deltaTime = (time - previousTime) * 0.001;
        previousTime = time;

        if (!redBoxer.userData.angularVelocity) redBoxer.userData.angularVelocity = 3;
        if (!blueBoxer.userData.angularVelocity) blueBoxer.userData.angularVelocity = 3;


        if (redBoxer) {
            redBoxer.rotation.z += redBoxer.userData.angularVelocity * deltaTime;
            redBoxer.rotation.z %= (2 * Math.PI);
        }
        if (blueBoxer) {
            blueBoxer.rotation.z += blueBoxer.userData.angularVelocity * deltaTime;
            blueBoxer.rotation.z %= (2 * Math.PI);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
}

window.addEventListener('DOMContentLoaded', main);