const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 5, 25);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => controls.lock());
scene.add(controls.getObject());

camera.position.y = 1.6;

// Light
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Movement
const keys = {};
const speed = 14;

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Dialogue
const dialogueBox = document.getElementById("dialogue");
function showDialogue(text) {
  dialogueBox.textContent = text;
  dialogueBox.style.display = "block";
  setTimeout(() => dialogueBox.style.display = "none", 2500);
}

// Raycasting
const raycaster = new THREE.Raycaster();

// Interactables
const interactables = [];

// NPCs
function createNPC(x, z, text) {
  const npc = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x7777ff })
  );
  npc.position.set(x, 1, z);
  npc.userData.dialogue = text;
  scene.add(npc);
  interactables.push(npc);
}

createNPC(-4, -4, "You’re fast. Dreams don’t like that.");
createNPC(4, -3, "If you stop moving, it gets closer.");
createNPC(0, -6, "I’ll stay here. I always do.");

// Fragments
let fragments = 0;
const countEl = document.getElementById("count");

function createFragment(x, z) {
  const frag = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshStandardMaterial({ color: 0xff00ff })
  );
  frag.position.set(x, 1, z);
  frag.userData.fragment = true;
  scene.add(frag);
  interactables.push(frag);
}

createFragment(-6, 2);
createFragment(6, 2);
createFragment(0, 6);

// Boss
let boss, bossHealth = 5;

function spawnBoss() {
  boss = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  boss.position.set(0, 1.5, -10);
  boss.userData.boss = true;
  scene.add(boss);
  interactables.push(boss);
  showDialogue("So… you finished.");
}

// Click interaction
document.addEventListener("mousedown", () => {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects(interactables);

  if (!hits.length) return;
  const obj = hits[0].object;

  if (obj.userData.dialogue) {
    showDialogue(obj.userData.dialogue);
  }

  if (obj.userData.fragment) {
    scene.remove(obj);
    interactables.splice(interactables.indexOf(obj), 1);
    fragments++;
    countEl.textContent = fragments;
    if (fragments === 3) spawnBoss();
  }

  if (obj.userData.boss) {
    bossHealth--;
    if (bossHealth <= 0) endGame();
  }
});

function endGame() {
  document.body.innerHTML =
    "<h1 style='color:white;text-align:center;margin-top:40vh;'>...</h1>";
}

// Game loop
function animate() {
  requestAnimationFrame(animate);

  if (keys["KeyW"]) controls.moveForward(speed * 0.05);
  if (keys["KeyS"]) controls.moveForward(-speed * 0.05);
  if (keys["KeyA"]) controls.moveRight(-speed * 0.05);
  if (keys["KeyD"]) controls.moveRight(speed * 0.05);

  if (boss) boss.position.z += 0.02;

  renderer.render(scene, camera);
}
animate();
