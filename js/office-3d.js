/**
 * ==========================================================================
 * JobOS Isometric 3D Virtual Office Engine (js/office-3d.js)
 * Premium Dark Isometric Command Center with Floating Grid Platform,
 * Central Orchestration Ring, 7 Low-Poly AI Puppy Workstations & Cyan Accents
 * Strictly recreated based on the reference design specification.
 * ==========================================================================
 */

export class Office3DEngine {
  constructor(containerId = 'threejs-canvas-mount') {
    this.containerId = containerId;
    this.animationFrameId = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.puppyGroups = [];
    this.serverLeds = [];
    this.orbLights = [];
    this.targetCameraPos = null;
    this.targetLookAt = null;
    this.currentLookAt = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isDestroyed = false;
    this.isRotating360 = false;
    this.rotationAngle = 0;
    this.raycaster = null;
    this.mouseVector = null;
    this.interactiveObjects = [];

    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 560;

    // 1. Scene & Deep Space Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070a12);
    this.scene.fog = new THREE.FogExp2(0x070a12, 0.0075);

    // 2. Camera Setup (True Isometric Axonometric Projection)
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
    this.camera.position.set(0, 26, 28);
    this.targetCameraPos = new THREE.Vector3(0, 26, 28);
    this.targetLookAt = new THREE.Vector3(0, 0.2, 0);
    this.currentLookAt = new THREE.Vector3(0, 0.2, 0);
    this.camera.lookAt(this.currentLookAt);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.ACESFilmicToneMapping) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
    }

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xdde6f5, 0.95);
    this.scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    mainKeyLight.position.set(16, 30, 20);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    const d = 22;
    mainKeyLight.shadow.camera.left = -d;
    mainKeyLight.shadow.camera.right = d;
    mainKeyLight.shadow.camera.top = d;
    mainKeyLight.shadow.camera.bottom = -d;
    mainKeyLight.shadow.camera.near = 5;
    mainKeyLight.shadow.camera.far = 70;
    mainKeyLight.shadow.bias = -0.0008;
    this.scene.add(mainKeyLight);

    // Subtle cyan backlight for futuristic rim reflection
    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 0.5);
    cyanRimLight.position.set(-18, 14, -18);
    this.scene.add(cyanRimLight);

    // Warm amber central command spotlight
    const centerSpot = new THREE.PointLight(0xf59e0b, 2.4, 22);
    centerSpot.position.set(0, 5.5, 0);
    this.scene.add(centerSpot);

    // 5. Build Procedural Grid Floor Texture
    const gridTexture = this.createGridTexture();

    // 6. Materials Palette
    const floorTopMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      roughness: 0.65,
      metalness: 0.2
    });

    const floorSideMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.75,
      metalness: 0.15
    });

    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x222a3a,
      roughness: 0.45,
      metalness: 0.35
    });

    const deskLegMat = new THREE.MeshStandardMaterial({
      color: 0x0e121a,
      roughness: 0.6,
      metalness: 0.5
    });

    const monitorBezelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d14,
      roughness: 0.8
    });

    // Emissive Screen Glow Materials
    const screenMaterials = {
      amber: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.4, roughness: 0.2 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.4, roughness: 0.2 }),
      purple: new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 1.4, roughness: 0.2 }),
      orange: new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xea580c, emissiveIntensity: 1.4, roughness: 0.2 }),
      teal: new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x0d9488, emissiveIntensity: 1.4, roughness: 0.2 })
    };

    // 7. Floating Diamond Island Platform (Rotated 45° for Isometric Perspective)
    const platformGroup = new THREE.Group();
    platformGroup.rotation.y = Math.PI / 4;

    // Slab Body: size 23.5 x 23.5 x 1.1
    const slabGeo = new THREE.BoxGeometry(23.5, 1.1, 23.5);
    const slabMaterials = [
      floorSideMat, floorSideMat, // +x, -x
      floorTopMat, floorSideMat,  // +y (top grid), -y
      floorSideMat, floorSideMat  // +z, -z
    ];
    const slabMesh = new THREE.Mesh(slabGeo, slabMaterials);
    slabMesh.position.y = -0.55;
    slabMesh.receiveShadow = true;
    platformGroup.add(slabMesh);

    // Beveled rim lip around platform
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x18202e, roughness: 0.6, metalness: 0.3 });
    const rimGeo = new THREE.BoxGeometry(23.9, 0.2, 23.9);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = -0.05;
    platformGroup.add(rimMesh);

    // Soft drop shadow underneath the floating island
    const shadowGeo = new THREE.PlaneGeometry(36, 36);
    const shadowTexture = this.createShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.65, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.25;
    platformGroup.add(shadowMesh);

    this.scene.add(platformGroup);

    // 8. Central Command Circular Zone (Boundary + Glowing Pool)
    const ringGeo = new THREE.RingGeometry(5.75, 6.05, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    this.centerRing = new THREE.Mesh(ringGeo, ringMat);
    this.centerRing.rotation.x = -Math.PI / 2;
    this.centerRing.position.set(0, 0.02, 0);
    this.scene.add(this.centerRing);

    // Warm radial spotlight pool inside circle
    const poolGeo = new THREE.CircleGeometry(5.75, 64);
    const poolTexture = this.createSpotlightPoolTexture();
    const poolMat = new THREE.MeshBasicMaterial({ map: poolTexture, transparent: true, opacity: 0.85, depthWrite: false });
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.rotation.x = -Math.PI / 2;
    poolMesh.position.set(0, 0.015, 0);
    this.scene.add(poolMesh);

    // 9. Workstation Generator Helper
    const createDesk = ({ x, z, rotY, screenColorKey, isCenter = false, agentId }) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.set(x, 0, z);
      stationGroup.rotation.y = rotY;

      const deskWidth = isCenter ? 3.6 : 3.2;
      const deskDepth = isCenter ? 1.8 : 1.6;

      // Tabletop
      const tableGeo = new THREE.BoxGeometry(deskWidth, 0.15, deskDepth);
      const tableMesh = new THREE.Mesh(tableGeo, deskTopMat);
      tableMesh.position.y = 1.35;
      tableMesh.castShadow = true;
      tableMesh.receiveShadow = true;
      stationGroup.add(tableMesh);

      // Chamfered front strip with subtle cyan/amber glow
      const stripMat = screenMaterials[screenColorKey] || screenMaterials.cyan;
      const stripGeo = new THREE.BoxGeometry(deskWidth, 0.03, 0.04);
      const stripMesh = new THREE.Mesh(stripGeo, stripMat);
      stripMesh.position.set(0, 1.38, deskDepth / 2 - 0.02);
      stationGroup.add(stripMesh);

      // Legs
      const halfW = deskWidth / 2 - 0.2;
      const halfD = deskDepth / 2 - 0.2;
      [[-halfW, -halfD], [halfW, -halfD], [-halfW, halfD], [halfW, halfD]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.35, 0.12), deskLegMat);
        leg.position.set(lx, 0.675, lz);
        leg.castShadow = true;
        stationGroup.add(leg);
      });

      // Dual Monitors (Angled setup)
      const screenMat = screenMaterials[screenColorKey] || screenMaterials.cyan;
      const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), deskLegMat);
      monStand.position.set(0, 1.65, -halfD + 0.3);
      stationGroup.add(monStand);

      // Main Center Monitor
      const mon1Bezel = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.95, 0.06), monitorBezelMat);
      mon1Bezel.position.set(-0.65, 2.05, -halfD + 0.35);
      mon1Bezel.rotation.y = 0.15;
      stationGroup.add(mon1Bezel);

      const mon1Screen = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.85), screenMat);
      mon1Screen.position.set(-0.65, 2.05, -halfD + 0.385);
      mon1Screen.rotation.y = 0.15;
      stationGroup.add(mon1Screen);

      // Side Angled Monitor
      const mon2Bezel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.95, 0.06), monitorBezelMat);
      mon2Bezel.position.set(0.75, 2.05, -halfD + 0.45);
      mon2Bezel.rotation.y = -0.32;
      stationGroup.add(mon2Bezel);

      const mon2Screen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85), screenMat);
      mon2Screen.position.set(0.75, 2.05, -halfD + 0.485);
      mon2Screen.rotation.y = -0.32;
      stationGroup.add(mon2Screen);

      // Keyboard
      const kbMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.4), deskLegMat);
      kbMesh.position.set(0, 1.44, 0.15);
      stationGroup.add(kbMesh);

      // Little Coffee Mug on desk (as seen in reference image)
      const mugMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 });
      const mugMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.22, 12), mugMat);
      mugMesh.position.set(deskWidth / 2 - 0.4, 1.48, 0.2);
      mugMesh.castShadow = true;
      stationGroup.add(mugMesh);

      // Office Ergonomic Task Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, halfD + 0.45);

      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 1.1), deskTopMat);
      seatMesh.position.y = 0.95;
      chairGroup.add(seatMesh);

      const backMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.12), deskTopMat);
      backMesh.position.set(0, 1.55, 0.48);
      chairGroup.add(backMesh);

      const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 10), deskLegMat);
      poleMesh.position.y = 0.5;
      chairGroup.add(poleMesh);

      const baseStar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 5), deskLegMat);
      baseStar.position.y = 0.15;
      chairGroup.add(baseStar);

      stationGroup.add(chairGroup);

      // Click/Raycast Anchor
      stationGroup.userData = { agentId };
      this.interactiveObjects.push(tableMesh);
      tableMesh.userData = { agentId };

      this.scene.add(stationGroup);
      return stationGroup;
    };

    // 10. Puppy Mascot Generator (Low-Poly / Voxel Styling)
    const createPuppy = ({ coatColor, earColor, collarColor, snoutColor = 0xffedd5, hasHeadset = false, animType = 'typing', agentId }) => {
      const pGroup = new THREE.Group();
      const coatMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.55 });
      const earMat = new THREE.MeshStandardMaterial({ color: earColor, roughness: 0.6 });
      const snoutMat = new THREE.MeshStandardMaterial({ color: snoutColor, roughness: 0.65 });
      const noseMat = new THREE.MeshStandardMaterial({ color: 0x090d14, roughness: 0.4 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x090d14 });
      const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const collarMat = new THREE.MeshStandardMaterial({ color: collarColor, roughness: 0.4 });

      // Body (Torso)
      const bodyGeo = new THREE.BoxGeometry(0.85, 0.95, 0.8);
      const bodyMesh = new THREE.Mesh(bodyGeo, coatMat);
      bodyMesh.position.y = 1.45;
      bodyMesh.castShadow = true;
      pGroup.add(bodyMesh);

      // Collar
      const collarGeo = new THREE.BoxGeometry(0.88, 0.14, 0.84);
      const collarMesh = new THREE.Mesh(collarGeo, collarMat);
      collarMesh.position.y = 1.95;
      pGroup.add(collarMesh);

      // Golden Badge
      const badgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 }));
      badgeMesh.position.set(0, 1.95, -0.44);
      badgeMesh.rotation.x = Math.PI / 2;
      pGroup.add(badgeMesh);

      // Head Pivot Group
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 2.3, 0);

      // Head Block
      const headGeo = new THREE.BoxGeometry(0.9, 0.85, 0.85);
      const headMesh = new THREE.Mesh(headGeo, coatMat);
      headMesh.castShadow = true;
      headPivot.add(headMesh);

      // Snout
      const snoutGeo = new THREE.BoxGeometry(0.48, 0.35, 0.42);
      const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
      snoutMesh.position.set(0, -0.16, -0.52);
      headPivot.add(snoutMesh);

      // Nose
      const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), noseMat);
      noseMesh.position.set(0, -0.06, -0.72);
      headPivot.add(noseMesh);

      // Eyes with glints
      [[-0.24, -0.54], [0.24, -0.54]].forEach(([ex, ez]) => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), eyeMat);
        eye.position.set(ex, 0.08, ez);
        headPivot.add(eye);

        const glint = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.07), glintMat);
        glint.position.set(ex + 0.02, 0.11, ez);
        headPivot.add(glint);
      });

      // Floppy Ears
      const earGeo = new THREE.BoxGeometry(0.25, 0.75, 0.16);
      const earL = new THREE.Mesh(earGeo, earMat);
      earL.position.set(-0.55, 0.05, 0.05);
      earL.rotation.z = -0.18;
      headPivot.add(earL);

      const earR = new THREE.Mesh(earGeo, earMat);
      earR.position.set(0.55, 0.05, 0.05);
      earR.rotation.z = 0.18;
      headPivot.add(earR);

      // Headset if applicable
      if (hasHeadset) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.035, 6, 20, Math.PI), deskLegMat);
        band.rotation.x = -Math.PI / 2;
        band.position.y = 0.45;
        headPivot.add(band);

        const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), screenMaterials.amber);
        mic.rotation.z = Math.PI / 3;
        mic.position.set(-0.48, -0.15, -0.28);
        headPivot.add(mic);
      }

      pGroup.add(headPivot);

      // Front Paws (resting on desk / typing)
      const pawGeo = new THREE.BoxGeometry(0.24, 0.18, 0.35);
      const pawL = new THREE.Mesh(pawGeo, snoutMat);
      pawL.position.set(-0.32, 1.45, -0.32);
      pGroup.add(pawL);

      const pawR = new THREE.Mesh(pawGeo, snoutMat);
      pawR.position.set(0.32, 1.45, -0.32);
      pGroup.add(pawR);

      // Tail
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, 1.25, 0.45);
      const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.55, 8), coatMat);
      tailMesh.position.set(0, 0.22, 0.18);
      tailMesh.rotation.x = 0.45;
      tailPivot.add(tailMesh);
      pGroup.add(tailPivot);

      pGroup.userData = { agentId };
      this.scene.add(pGroup);

      return {
        group: pGroup,
        headPivot,
        tailPivot,
        pawL,
        pawR,
        animType,
        agentId
      };
    };

    // ========================================================================
    // 11. SPAWN 7 WORKSTATIONS & AGENTS (Matching Reference Image Exactly)
    // ========================================================================

    // 1. Center Command: ORCHESTRATOR (Golden Retriever)
    createDesk({ x: 0, z: -0.2, rotY: 0, screenColorKey: 'amber', isCenter: true, agentId: 'orchestrator' });
    const orchPup = createPuppy({
      coatColor: 0xeab308, // Golden yellow
      earColor: 0xa16207,
      collarColor: 0xf59e0b,
      snoutColor: 0xffedd5,
      hasHeadset: true,
      animType: 'orchestrating',
      agentId: 'orchestrator'
    });
    orchPup.group.position.set(0, 0, 0.4);
    orchPup.group.rotation.y = 0;
    this.puppyGroups.push(orchPup);

    // 2. North / Top Workstation: SCOUT (White puppy with Cyan collar)
    createDesk({ x: 0, z: -7.8, rotY: 0, screenColorKey: 'cyan', agentId: 'scout' });
    const scoutPup = createPuppy({
      coatColor: 0xf8fafc, // White
      earColor: 0x38bdf8,  // Cyan/blue
      collarColor: 0x0284c7,
      snoutColor: 0xffedd5,
      hasHeadset: true,
      animType: 'typing',
      agentId: 'scout'
    });
    scoutPup.group.position.set(0, 0, -7.2);
    scoutPup.group.rotation.y = 0;
    this.puppyGroups.push(scoutPup);

    // 3. North-East Workstation: JOB INTELLIGENCE (Purple Corgi)
    createDesk({ x: 5.8, z: -4.8, rotY: -Math.PI / 4, screenColorKey: 'purple', agentId: 'job-intelligence' });
    const intelPup = createPuppy({
      coatColor: 0x9333ea, // Vibrant purple
      earColor: 0x6b21a8,
      collarColor: 0xc084fc,
      snoutColor: 0xf3e8ff,
      animType: 'thinking',
      agentId: 'job-intelligence'
    });
    intelPup.group.position.set(5.35, 0, -4.35);
    intelPup.group.rotation.y = -Math.PI / 4;
    this.puppyGroups.push(intelPup);

    // 4. East Workstation: APPLICATION AGENT (Ginger/Orange Shiba)
    createDesk({ x: 7.8, z: 1.8, rotY: -Math.PI / 2, screenColorKey: 'orange', agentId: 'application-agent' });
    const appPup = createPuppy({
      coatColor: 0xea580c, // Warm orange
      earColor: 0x9a3412,
      collarColor: 0xf97316,
      snoutColor: 0xffedd5,
      animType: 'typing',
      agentId: 'application-agent'
    });
    appPup.group.position.set(7.2, 0, 1.8);
    appPup.group.rotation.y = -Math.PI / 2;
    this.puppyGroups.push(appPup);

    // 5. South-East Workstation: VERIFICATION AGENT (Mint/Teal Frenchie)
    createDesk({ x: 4.5, z: 6.8, rotY: -3 * Math.PI / 4, screenColorKey: 'teal', agentId: 'verification-agent' });
    const verifPup = createPuppy({
      coatColor: 0x0d9488, // Mint/teal
      earColor: 0x115e59,
      collarColor: 0x2dd4bf,
      snoutColor: 0xccfbf1,
      hasHeadset: true,
      animType: 'auditing',
      agentId: 'verification-agent'
    });
    verifPup.group.position.set(4.0, 0, 6.3);
    verifPup.group.rotation.y = -3 * Math.PI / 4;
    this.puppyGroups.push(verifPup);

    // 6. South Workstation: TRACKING AGENT (Cream with Yellow ears)
    createDesk({ x: -3.5, z: 7.0, rotY: Math.PI, screenColorKey: 'cyan', agentId: 'tracking-agent' });
    const trackPup = createPuppy({
      coatColor: 0xfef08a, // Cream
      earColor: 0xeab308,
      collarColor: 0xca8a04,
      snoutColor: 0xfffbeb,
      animType: 'typing',
      agentId: 'tracking-agent'
    });
    trackPup.group.position.set(-3.5, 0, 6.4);
    trackPup.group.rotation.y = Math.PI;
    this.puppyGroups.push(trackPup);

    // 7. West Workstation: EMAIL AGENT (Silver/Slate Dachshund)
    createDesk({ x: -7.8, z: -0.8, rotY: Math.PI / 2, screenColorKey: 'cyan', agentId: 'email-agent' });
    const emailPup = createPuppy({
      coatColor: 0x64748b, // Silver/slate
      earColor: 0x334155,
      collarColor: 0x38bdf8,
      snoutColor: 0xf1f5f9,
      animType: 'typing',
      agentId: 'email-agent'
    });
    emailPup.group.position.set(-7.2, 0, -0.8);
    emailPup.group.rotation.y = Math.PI / 2;
    this.puppyGroups.push(emailPup);

    // ========================================================================
    // 12. FUTURISTIC OFFICE ACCENTS (Matching Reference Image)
    // ========================================================================

    // A. 6 Cyan Luminous Sphere Lamps on Pedestals along Platform Perimeter
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.85,
      roughness: 0.15
    });

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x242e3f,
      roughness: 0.7,
      metalness: 0.2
    });

    const orbPositions = [
      [-5.2, -10.2], // North-West
      [-11.8, -2.5], // West
      [-8.2, 6.5],   // South-West
      [7.8, -7.8],   // North-East
      [11.8, 5.5],   // East
      [1.8, 11.2]    // South
    ];

    orbPositions.forEach(([ox, oz]) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(ox, 0, oz);

      // Tapered Pedestal
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.1, 16), pedestalMat);
      ped.position.y = 0.55;
      ped.castShadow = true;
      pGroup.add(ped);

      // Glowing Cyan Sphere
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), orbMat);
      sphere.position.y = 1.62;
      sphere.castShadow = false;
      pGroup.add(sphere);

      // Real Point Light
      const pLight = new THREE.PointLight(0x06b6d4, 1.4, 9);
      pLight.position.y = 1.62;
      pGroup.add(pLight);
      this.orbLights.push(pLight);

      this.scene.add(pGroup);
    });

    // B. Monolith Server Rack Tower (Right Side, as in reference image)
    const serverGroup = new THREE.Group();
    serverGroup.position.set(10.2, 0, -2.2);

    const rackGeo = new THREE.BoxGeometry(1.3, 4.2, 1.1);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.5, metalness: 0.7 });
    const rackMesh = new THREE.Mesh(rackGeo, rackMat);
    rackMesh.position.y = 2.1;
    rackMesh.castShadow = true;
    serverGroup.add(rackMesh);

    // Horizontal Server Blade LEDs
    const ledMatGreen = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledMatCyan = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    for (let i = 0; i < 9; i++) {
      const ledGeo = new THREE.BoxGeometry(0.95, 0.08, 0.04);
      const isGreen = i % 2 === 0;
      const led = new THREE.Mesh(ledGeo, isGreen ? ledMatGreen : ledMatCyan);
      led.position.set(0, 0.6 + i * 0.38, 0.56);
      serverGroup.add(led);
      this.serverLeds.push({ mesh: led, isGreen, origY: led.position.y });
    }
    this.scene.add(serverGroup);

    // C. Futuristic Hologram Capsule Column (North Corner, as in reference image)
    const capsuleGroup = new THREE.Group();
    capsuleGroup.position.set(0, 0, -12.5);

    // White Pedestal Base
    const holoBaseGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.6, 16);
    const holoBaseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const holoBase = new THREE.Mesh(holoBaseGeo, holoBaseMat);
    holoBase.position.y = 0.8;
    holoBase.castShadow = true;
    capsuleGroup.add(holoBase);

    // Translucent Cyan Cylinder Containment Chamber
    const glassGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 2.35;
    capsuleGroup.add(glassMesh);

    // Inner Core Light
    const coreLight = new THREE.PointLight(0x38bdf8, 1.5, 8);
    coreLight.position.y = 2.35;
    capsuleGroup.add(coreLight);

    this.scene.add(capsuleGroup);

    // 13. Raycaster for Interactive Workstation Selection
    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2();

    this.clickHandler = (e) => {
      const rect = container.getBoundingClientRect();
      this.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.raycaster.setFromCamera(this.mouseVector, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
      if (intersects.length > 0) {
        const agentId = intersects[0].object.userData?.agentId;
        if (agentId && window.app?.selectDesk) {
          window.app.selectDesk(agentId);
        }
      }
    };
    container.addEventListener('click', this.clickHandler);

    // 14. Mouse Move Damped Parallax
    this.mouseMoveHandler = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.mouseX = x * 2.2;
      this.mouseY = y * 1.6;
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);

    // 15. Resize Handler
    this.resizeHandler = () => {
      if (!container || !this.camera || !this.renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 560;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this.resizeHandler);

    // 16. Start Simulation Animation Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  // Procedural 512x512 Seamless Floor Grid Texture
  createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark charcoal tile base
    ctx.fillStyle = '#17202e';
    ctx.fillRect(0, 0, 512, 512);

    const tiles = 8;
    const size = 512 / tiles;

    for (let x = 0; x < tiles; x++) {
      for (let y = 0; y < tiles; y++) {
        // Individual tile with subtle gradient
        const grad = ctx.createLinearGradient(x * size, y * size, (x + 1) * size, (y + 1) * size);
        grad.addColorStop(0, '#1c2637');
        grad.addColorStop(1, '#151d2a');
        ctx.fillStyle = grad;
        ctx.fillRect(x * size + 1.5, y * size + 1.5, size - 3, size - 3);

        // Subtle inner highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * size + 2.5, y * size + 2.5, size - 5, size - 5);
      }
    }

    // Grid Grout Lines
    ctx.strokeStyle = '#0e141f';
    ctx.lineWidth = 3;
    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(512, i * size);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    if (this.renderer?.capabilities?.getMaxAnisotropy) {
      texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 16);
    }
    return texture;
  }

  // Procedural Radial Soft Shadow Texture for Island Floating Depth
  createShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }

  // Procedural Warm Spotlight Pool for Central Orchestrator Circle
  createSpotlightPoolTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
    grad.addColorStop(0.9, 'rgba(245, 158, 11, 0.01)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }

  // Camera Presets & Angles
  setCameraAngle(mode) {
    if (!this.targetCameraPos) return;

    if (mode === 'rotate') {
      this.isRotating360 = !this.isRotating360;
      return;
    }

    this.isRotating360 = false;

    if (mode === 'orch') {
      // Orchestrator Focus (Close-in on central command circle)
      this.targetCameraPos.set(0, 9.5, 10.5);
      this.targetLookAt.set(0, 1.2, 0);
    } else if (mode === 'scout') {
      // Scout Pod Focus
      this.targetCameraPos.set(0, 11, 1.5);
      this.targetLookAt.set(0, 1.4, -7.8);
    } else {
      // Default Isometric
      this.targetCameraPos.set(0, 26, 28);
      this.targetLookAt.set(0, 0.2, 0);
    }
  }

  animate() {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const t = this.clock.getElapsedTime();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = prefersReducedMotion ? 0.25 : 1.0;

    // Handle 360 Rotation or Smooth Camera Lerp
    if (this.isRotating360 && !prefersReducedMotion) {
      this.rotationAngle += 0.006;
      const radius = 34;
      this.camera.position.x = Math.sin(this.rotationAngle) * radius;
      this.camera.position.z = Math.cos(this.rotationAngle) * radius;
      this.camera.position.y += (25 - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0.5, 0);
    } else {
      // Damped Smooth Camera Lerp to target position + cursor parallax
      this.camera.position.x += (this.targetCameraPos.x + this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCameraPos.y + this.mouseY - this.camera.position.y) * 0.05;
      this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.05;

      this.currentLookAt.x += (this.targetLookAt.x - this.currentLookAt.x) * 0.05;
      this.currentLookAt.y += (this.targetLookAt.y - this.currentLookAt.y) * 0.05;
      this.currentLookAt.z += (this.targetLookAt.z - this.currentLookAt.z) * 0.05;
      this.camera.lookAt(this.currentLookAt);
    }

    // Gentle central ring pulse
    if (this.centerRing) {
      this.centerRing.rotation.z = t * 0.08 * motionScale;
    }

    // Subtle server rack LED blinking simulation
    this.serverLeds.forEach((led, idx) => {
      const freq = (idx + 1) * 3.5;
      const intensity = Math.sin(t * freq) > 0.2 ? 1.0 : 0.25;
      led.mesh.material.opacity = intensity;
    });

    // Soft puppy idle animations (typing, head tilt, wagging tail)
    this.puppyGroups.forEach((puppy, idx) => {
      const type = puppy.animType;

      // Gentle tail wag
      const wagSpeed = (type === 'typing' || type === 'orchestrating') ? 9 : 5;
      puppy.tailPivot.rotation.y = Math.sin(t * wagSpeed * motionScale + idx) * 0.35;

      if (type === 'orchestrating') {
        // Orchestrator confident head nod & subtle body breath
        puppy.headPivot.rotation.y = Math.sin(t * 1.2 * motionScale) * 0.25;
        puppy.headPivot.rotation.x = Math.sin(t * 2.0 * motionScale) * 0.1;
        puppy.group.position.y = Math.sin(t * 2.5 * motionScale) * 0.02;
      } else if (type === 'typing') {
        // Typing paws alternate tap
        puppy.pawL.position.y = 1.45 + Math.sin(t * 14 * motionScale + idx) * 0.04;
        puppy.pawR.position.y = 1.45 + Math.cos(t * 14 * motionScale + idx) * 0.04;
        puppy.headPivot.rotation.x = 0.12 + Math.sin(t * 2.5 * motionScale + idx) * 0.05;
        puppy.headPivot.rotation.y = Math.sin(t * 1.2 * motionScale + idx) * 0.15;
      } else if (type === 'thinking') {
        // Thoughtful inquisitive head tilt
        puppy.headPivot.rotation.z = 0.18 + Math.sin(t * 1.1 * motionScale) * 0.06;
        puppy.headPivot.rotation.y = Math.cos(t * 0.9 * motionScale) * 0.2;
      } else {
        // Gentle attentive idle
        puppy.headPivot.rotation.y = Math.sin(t * 1.0 * motionScale + idx) * 0.15;
        puppy.headPivot.rotation.x = Math.sin(t * 1.4 * motionScale + idx) * 0.06;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('resize', this.resizeHandler);
    const container = document.getElementById(this.containerId);
    if (container) {
      container.removeEventListener('click', this.clickHandler);
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
