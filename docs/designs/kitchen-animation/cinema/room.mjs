/**
 * The kitchen set for the CulinAIre Kitchen film study.
 *
 * Everything is built from the host's small, shared-geometry helpers.  The
 * room is deliberately open on the camera-facing and right sides so the
 * action remains readable in a three-quarter view.
 */
export function createKitchen(THREE, h) {
  const group = new THREE.Group();
  group.name = 'working-kitchen';

  const mat = {
    plaster: h.material('#ded3be', 0.92),
    plasterShade: h.material('#cfc1a7', 0.94),
    olive: h.material('#46513e', 0.76),
    oliveLight: h.material('#62694f', 0.74),
    wood: h.material('#654b36', 0.72),
    woodLight: h.material('#927253', 0.73),
    woodDark: h.material('#3c3028', 0.7),
    tile: h.material('#f0e9db', 0.48),
    tileShade: h.material('#d9d0bf', 0.52),
    grout: h.material('#bdb4a5', 0.9),
    stone: h.material('#d4cdbd', 0.35),
    stoneVein: h.material('#a7a08f', 0.62),
    terracotta: h.material('#a85f43', 0.66),
    clayLight: h.material('#c27c58', 0.61),
    brass: h.material('#ae8951', 0.3, 0.72),
    brassDark: h.material('#78613d', 0.42, 0.6),
    iron: h.material('#343a36', 0.35, 0.78),
    ironLight: h.material('#73766c', 0.35, 0.7),
    black: h.material('#202522', 0.34, 0.5),
    glass: h.material('#b7c8bf', 0.16, 0.08),
    windowGlow: h.material('#d4d9c8', 0.6),
    leaf: h.material('#63784e', 0.8),
    leafLight: h.material('#849064', 0.8),
    sage: h.material('#aeb394', 0.8),
    cream: h.material('#ece3d1', 0.85),
    porcelain: h.material('#f6f1e6', 0.28),
    citrus: h.material('#c79b56', 0.55),
    pear: h.material('#a6a467', 0.7),
    linen: h.material('#dbd0bb', 0.94),
    shadow: h.material('#777568', 0.93),
  };

  const box = (w, ht, d, material, x, y, z, parent = group, radius = 0.025) =>
    h.box(w, ht, d, material, x, y, z, parent, radius);
  const cylinder = (rt, rb, ht, material, x, y, z, parent = group, segments = 24) =>
    h.cylinder(rt, rb, ht, material, x, y, z, parent, segments);
  const sphere = (rx, ry, rz, material, x, y, z, parent = group) =>
    h.sphere(rx, ry, rz, material, x, y, z, parent);
  const torus = (radius, tube, material, x, y, z, parent = group) =>
    h.torus(radius, tube, material, x, y, z, parent);
  const label = (text, w, ht, foreground, background, x, y, z, parent = group) =>
    h.label(text, w, ht, foreground, background, x, y, z, parent);

  // Stone floor and quiet terracotta insets set a real scale beneath the cast.
  box(9, 0.12, 6.5, mat.terracotta, 0, -0.06, 0, group, 0.015);
  box(8.92, 0.014, 6.42, mat.tileShade, 0, 0.007, 0, group, 0.005);
  for (let x = -4.05; x <= 4.05; x += 0.9) {
    box(0.012, 0.003, 6.38, mat.grout, x, 0.017, 0, group, 0.001);
  }
  for (let z = -2.88; z <= 2.88; z += 0.9) {
    box(8.88, 0.003, 0.012, mat.grout, 0, 0.017, z, group, 0.001);
  }
  // A few alternating tile centres suggest handmade variation without visual noise.
  for (const [x, z] of [[-3.15, -2.25], [-1.35, 1.35], [0.45, -0.45], [2.25, 2.25], [3.15, -1.35]]) {
    box(0.42, 0.005, 0.42, mat.clayLight, x, 0.02, z, group, 0.012);
  }

  // Back wall is split around the delivery door.  There is no ceiling or camera-side wall.
  box(1.85, 2.9, 0.18, mat.plaster, -3.525, 1.45, -3.25);
  box(6.05, 2.9, 0.18, mat.plaster, 1.425, 1.45, -3.25);
  box(1.24, 0.54, 0.18, mat.plaster, -3.55, 2.63, -3.25);
  box(0.06, 2.45, 0.11, mat.woodDark, -4.12, 1.22, -3.13);
  box(0.06, 2.45, 0.11, mat.woodDark, -2.98, 1.22, -3.13);
  box(1.2, 0.07, 0.11, mat.woodDark, -3.55, 2.43, -3.13);
  // Quietly glazed, half-open delivery door.
  box(1.02, 2.26, 0.045, mat.wood, -3.58, 1.16, -3.11, group, 0.012);
  box(0.88, 1.54, 0.018, mat.oliveLight, -3.58, 1.48, -3.075, group, 0.008);
  box(0.76, 0.025, 0.025, mat.woodLight, -3.58, 0.63, -3.055, group, 0.005);
  box(0.76, 0.025, 0.025, mat.woodLight, -3.58, 1.45, -3.055, group, 0.005);
  box(0.025, 0.84, 0.025, mat.woodLight, -3.95, 1.04, -3.055, group, 0.005);
  box(0.025, 0.84, 0.025, mat.woodLight, -3.21, 1.04, -3.055, group, 0.005);
  cylinder(0.035, 0.035, 0.045, mat.brass, -3.17, 1.08, -3.035, group, 16);
  // Header timber and short vertical joints lend the plaster a crafted finish.
  box(9, 0.1, 0.2, mat.woodDark, 0, 2.91, -3.23, group, 0.018);
  box(9, 0.045, 0.18, mat.woodLight, 0, 2.82, -3.19, group, 0.012);

  // Left return wall with a broad, divided window that brings in morning light.
  box(0.18, 2.9, 1.18, mat.plaster, -4.5, 1.45, -2.66);
  box(0.18, 2.9, 1.72, mat.plaster, -4.5, 1.45, 2.39);
  box(0.18, 0.74, 3.88, mat.plaster, -4.5, 2.53, 0.0);
  box(0.18, 0.58, 3.88, mat.plasterShade, -4.5, 0.29, 0.0);
  box(0.04, 1.57, 3.78, mat.woodDark, -4.37, 1.29, 0.0);
  // Window panes sit in the left wall and are visible obliquely from the camera.
  for (const z of [-1.19, -0.4, 0.4, 1.19]) {
    box(0.035, 1.44, 0.74, mat.windowGlow, -4.365, 1.32, z, group, 0.01);
  }
  box(0.035, 0.075, 3.7, mat.woodLight, -4.33, 2.13, 0, group, 0.008);
  box(0.035, 0.065, 3.7, mat.woodLight, -4.33, 0.51, 0, group, 0.008);
  for (const z of [-0.8, 0, 0.8]) {
    box(0.05, 1.5, 0.035, mat.woodLight, -4.32, 1.32, z, group, 0.006);
  }
  box(0.22, 0.06, 4.02, mat.woodDark, -4.36, 0.02, 0, group, 0.01);
  // Sill with potted herbs, visible along the room's left edge.
  box(0.42, 0.1, 2.5, mat.woodLight, -4.12, 0.98, 0.15, group, 0.02);

  // Backsplash: ivory handmade subway tiles with restrained warm grout.
  box(4.5, 0.78, 0.035, mat.tileShade, 1.35, 1.45, -3.115, group, 0.005);
  const tileW = 0.37;
  const tileH = 0.22;
  for (let row = 0; row < 4; row += 1) {
    const y = 1.14 + row * 0.205;
    const offset = row % 2 === 0 ? 0 : tileW / 2;
    for (let col = 0; col < 12; col += 1) {
      const x = -0.72 + col * tileW + offset;
      if (x > 3.54) continue;
      box(tileW - 0.016, tileH - 0.014, 0.018,
        (row + col) % 7 === 0 ? mat.tileShade : mat.tile,
        x, y, -3.082, group, 0.014);
    }
  }
  box(4.54, 0.045, 0.07, mat.woodDark, 1.35, 1.03, -3.06, group, 0.008);
  box(4.54, 0.045, 0.07, mat.woodDark, 1.35, 1.88, -3.06, group, 0.008);

  // Back counter, timber cabinets and the oven that anchors the cooking beat.
  box(4.42, 0.075, 0.91, mat.stone, 1.4, 0.92, -2.66, group, 0.035);
  box(4.34, 0.82, 0.82, mat.olive, 1.4, 0.45, -2.66, group, 0.018);
  for (const x of [-0.53, 0.2, 2.7, 3.4]) {
    box(0.035, 0.5, 0.83, mat.woodDark, x, 0.26, -2.66, group, 0.008);
    box(0.54, 0.035, 0.04, mat.brassDark, x - 0.25, 0.36, -2.215, group, 0.008);
  }
  // Drawer faces and little brass pulls.
  for (const x of [-0.16, 0.63, 2.25, 3.15]) {
    box(0.58, 0.19, 0.035, mat.oliveLight, x, 0.43, -2.225, group, 0.016);
    box(0.12, 0.022, 0.035, mat.brass, x, 0.45, -2.19, group, 0.008);
    box(0.58, 0.22, 0.035, mat.oliveLight, x, 0.16, -2.225, group, 0.016);
    box(0.12, 0.022, 0.035, mat.brass, x, 0.18, -2.19, group, 0.008);
  }
  // Oven body and enamel cavity face toward the open room.
  box(1.1, 0.75, 0.92, mat.black, 1.45, 0.70, -2.63, group, 0.055);
  box(0.98, 0.61, 0.045, mat.iron, 1.45, 0.70, -2.135, group, 0.035);
  box(0.87, 0.5, 0.018, mat.black, 1.45, 0.70, -2.105, group, 0.02);

  box(0.78, 0.035, 0.035, mat.ironLight, 1.45, 0.86, -2.08, group, 0.012);
  for (let i = 0; i < 4; i += 1) {
    cylinder(0.042, 0.042, 0.035, mat.brass, 1.08 + i * 0.24, 0.87, -2.08, group, 20);
    torus(0.03, 0.004, mat.iron, 1.08 + i * 0.24, 0.87, -2.052, group);
  }
  // Commercial side hinge keeps the opening clear of the chef’s feet.
  const ovenDoor = new THREE.Group();
  ovenDoor.name = 'oven-door-hinge';
  ovenDoor.position.set(.98, 0.43, -2.08);
  group.add(ovenDoor);
  box(0.94, 0.52, 0.075, mat.iron, .47, 0.27, 0.012, ovenDoor, 0.035);
  box(0.76, 0.33, 0.02, mat.black, .47, 0.27, 0.056, ovenDoor, 0.025);
  box(0.44, 0.035, 0.055, mat.brass, .80, 0.40, 0.065, ovenDoor, 0.014);
  // Tray is a separate carriage so a pastry can slide out toward the viewer.
  const ovenTray = new THREE.Group();
  ovenTray.name = 'oven-tray-slide';
  ovenTray.position.set(1.45, 0.48, -2.62);
  group.add(ovenTray);
  box(0.76, 0.025, 0.66, mat.ironLight, 0, 0, 0.16, ovenTray, 0.012);
  // A neat, understated run of brass knobs along the stove rail.
  box(1.55, 0.055, 0.07, mat.iron, 2.12, 0.98, -2.63, group, 0.025);
  for (let i = 0; i < 4; i += 1) {
    torus(0.17, 0.018, mat.iron, 1.55 + i * 0.4, 0.99, -2.53, group).rotation.x = Math.PI / 2;
    cylinder(0.045, 0.045, 0.035, mat.ironLight, 1.55 + i * 0.4, 1.015, -2.52, group, 24);
  }

  // Pantry facing the chef's clear left-hand access lane.
  box(1.2, 2.3, 0.035, mat.woodDark, -3.8, 1.15, -2.19, group, 0.025);
  box(1.1, 2.17, 0.035, mat.olive, -3.8, 1.15, -2.14, group, 0.018);
  box(0.1, 2.25, 0.61, mat.wood, -4.38, 1.15, -1.9, group, 0.025);
  box(0.1, 2.25, 0.61, mat.wood, -3.22, 1.15, -1.9, group, 0.025);
  for (const y of [0.32, 0.75, 1.18, 1.61, 2.04]) {
    box(1.14, 0.065, 0.51, mat.woodLight, -3.8, y, -1.9, group, 0.012);
    box(1.13, 0.018, 0.51, mat.woodDark, -3.8, y - 0.05, -1.9, group, 0.006);
  }
  const pantryDoor = new THREE.Group();
  pantryDoor.name = 'pantry-door-hinge';
  pantryDoor.position.set(-3.19, 0.04, -2.18);
  group.add(pantryDoor);
  box(0.075, 2.16, 0.54, mat.oliveLight, -0.01, 1.11, -0.01, pantryDoor, 0.03);
  box(0.018, 1.97, 0.36, mat.olive, 0.035, 1.11, -0.01, pantryDoor, 0.018);
  for (const y of [0.34, 0.76, 1.18, 1.6, 2.02]) {
    box(0.035, 0.018, 0.38, mat.woodLight, 0.052, y, -0.01, pantryDoor, 0.008);
  }
  cylinder(0.018, 0.018, 0.04, mat.brass, 0.055, 1.08, 0.19, pantryDoor, 16);
  // Larder stock: grouped jars, tins and folded sacks with readable silhouettes.
  for (const [x, y, z, scale, color] of [
    [-4.02, 0.48, -2.05, 0.13, mat.cream], [-3.69, 0.49, -2.02, 0.12, mat.citrus],
    [-3.43, 0.49, -1.82, 0.14, mat.sage], [-4.08, 0.91, -2.06, 0.12, mat.sage],
    [-3.72, 0.91, -1.78, 0.14, mat.cream], [-3.48, 0.91, -2.08, 0.12, mat.citrus],
    [-4.05, 1.34, -1.82, 0.14, mat.citrus], [-3.72, 1.34, -2.04, 0.12, mat.cream],
    [-3.43, 1.34, -1.84, 0.13, mat.sage], [-3.97, 1.78, -2.02, 0.13, mat.cream],
    [-3.6, 1.78, -1.82, 0.12, mat.sage],
  ]) {
    cylinder(scale * 0.56, scale * 0.64, scale * 1.65, color, x, y, z, group, 16);
    cylinder(scale * 0.59, scale * 0.59, 0.035, mat.brassDark, x, y + scale * 0.85, z, group, 16);
  }
  // Produce tray and a couple of pear-shaped silhouettes.
  box(0.56, 0.1, 0.38, mat.wood, -3.76, 2.18, -1.91, group, 0.018);
  for (const [x, z] of [[-3.98, -1.91], [-3.77, -1.96], [-3.56, -1.88]]) {
    sphere(0.105, 0.14, 0.095, mat.pear, x, 2.31, z, group);
    cylinder(0.012, 0.016, 0.05, mat.woodDark, x, 2.48, z, group, 8);
  }
  label('GARDE-MANGER', 0.72, 0.12, '#e9e0cf', '#3d4939', -3.79, 2.55, -1.58);

  // Main island: solid olive cabinetry under a veined pale marble worktop.
  box(3.48, 0.76, 1.28, mat.woodDark, 0, 0.48, 0, group, 0.045);
  box(3.4, 0.72, 1.2, mat.olive, 0, 0.48, 0, group, 0.035);
  for (const x of [-1.18, -0.38, 0.42, 1.22]) {
    box(0.73, 0.58, 0.055, mat.oliveLight, x, 0.47, 0.627, group, 0.018);
    box(0.12, 0.025, 0.035, mat.brass, x, 0.55, 0.666, group, 0.009);
    box(0.73, 0.025, 0.06, mat.woodDark, x, 0.16, 0.63, group, 0.008);
  }
  box(3.62, 0.075, 1.4, mat.stone, 0, 0.91, 0, group, 0.045);
  // Fine stone veins across the pale island, kept broad enough to read at film scale.
  for (const [x, z, length, angle] of [
    [-1.14, -0.32, 0.9, -0.16], [-0.65, 0.06, 0.68, 0.08],
    [0.15, -0.37, 1.02, -0.11], [0.85, 0.25, 0.85, 0.14],
    [1.25, -0.12, 0.54, -0.05], [-0.05, 0.34, 0.68, 0.12],
  ]) {
    const vein = box(length, 0.003, 0.012, mat.stoneVein, x, 0.95, z, group, 0.003);
    vein.rotation.y = angle;
  }
  box(3.5, 0.04, 1.3, mat.woodDark, 0, 0.07, 0, group, 0.018);
  label('MISE EN PLACE', 0.72, 0.12, '#e9e0cf', '#3d4939', 0.0, 0.45, 0.67);

  // Receiving cart and weighing scale, placed in the bright open receiving lane.
  const cartX = -2.8;
  const cartZ = 1.2;
  for (const x of [-0.51, 0.51]) {
    for (const z of [-0.34, 0.34]) {
      box(0.045, 0.82, 0.045, mat.iron, cartX + x, 0.42, cartZ + z, group, 0.012);
      cylinder(0.09, 0.09, 0.065, mat.black, cartX + x, 0.09, cartZ + z, group, 20);
      cylinder(0.025, 0.025, 0.07, mat.ironLight, cartX + x, 0.09, cartZ + z, group, 16);
    }
  }
  box(1.18, 0.065, 0.78, mat.ironLight, cartX, 0.81, cartZ, group, 0.025);
  box(1.15, 0.045, 0.75, mat.wood, cartX, 0.87, cartZ, group, 0.018);
  box(0.62, 0.07, 0.45, mat.woodLight, cartX - 0.08, 0.94, cartZ - 0.04, group, 0.035);
  box(0.31, 0.08, 0.23, mat.black, cartX + 0.35, 0.96, cartZ - 0.1, group, 0.018);
  box(0.24, 0.034, 0.16, mat.windowGlow, cartX + 0.35, 1.01, cartZ - 0.1, group, 0.012);
  label('10.0 kg', 0.2, 0.07, '#364036', '#d7dfcd', cartX + 0.35, 1.015, cartZ - 0.012);
  // One small clipboard gives incoming goods a tangible receiving record.
  box(0.22, 0.018, 0.32, mat.woodDark, cartX + 0.37, 1.0, cartZ + 0.23, group, 0.012);
  box(0.2, 0.012, 0.29, mat.cream, cartX + 0.37, 1.013, cartZ + 0.23, group, 0.009);
  for (let i = 0; i < 3; i += 1) {
    box(0.11, 0.003, 0.006, mat.woodLight, cartX + 0.36, 1.022, cartZ + 0.16 + i * 0.045, group, 0.001);
  }

  // Owner's low-key station at right: a tablet, ruled order sheet and stool.
  const deskX = 3.45;
  const deskZ = 1.35;
  box(1.25, 0.085, 0.88, mat.woodLight, deskX, 0.95, deskZ, group, 0.035);
  box(1.17, 0.05, 0.8, mat.woodDark, deskX, 0.89, deskZ, group, 0.02);
  for (const x of [-0.49, 0.49]) {
    for (const z of [-0.31, 0.31]) {
      box(0.06, 0.86, 0.06, mat.woodDark, deskX + x, 0.44, deskZ + z, group, 0.012);
    }
  }
  box(0.36, 0.018, 0.25, mat.cream, deskX + 0.34, 1.01, deskZ + 0.15, group, 0.01);
  for (let i = 0; i < 4; i += 1) {
    box(0.24, 0.003, 0.006, mat.woodLight, deskX + 0.34, 1.022, deskZ + 0.08 + i * 0.04, group, 0.001);
  }
  cylinder(0.28, 0.28, 0.09, mat.wood, 3.56, 0.49, 2.13, group, 28);
  cylinder(0.035, 0.045, 0.42, mat.iron, 3.56, 0.24, 2.13, group, 16);
  box(0.55, 0.045, 0.08, mat.iron, 3.56, 0.13, 2.13, group, 0.015);

  // Copper hanging rail over the cook line with three deliberately large pans.
  cylinder(0.025, 0.025, 3.78, mat.brass, 1.35, 2.33, -2.99, group, 20).rotation.z = Math.PI / 2;
  for (const x of [0.05, 0.68, 1.32, 1.96, 2.6]) {
    cylinder(0.014, 0.014, 0.23, mat.brass, x, 2.2, -2.99, group, 12);
  }
  for (const [x, y, radius] of [[0.32, 1.94, 0.23], [1.35, 2.0, 0.28], [2.47, 1.91, 0.22]]) {
    cylinder(radius, radius * 0.83, 0.12, mat.terracotta, x, y, -2.98, group, 32).rotation.x = Math.PI / 2;
    torus(radius * 0.83, 0.016, mat.brassDark, x, y + 0.055, -2.91, group);
    box(0.31, 0.035, 0.06, mat.woodDark, x + radius + 0.13, y, -2.98, group, 0.018);
    // Short loop handle, intentionally simple at this viewing scale.
    torus(0.065, 0.012, mat.brassDark, x - radius * 0.62, y + 0.01, -2.98, group);
  }
  // Open timber shelf with a handful of ceramic bowls and preserving jars.
  box(2.25, 0.07, 0.36, mat.woodLight, 1.65, 2.2, -3.03, group, 0.02);
  box(2.18, 0.04, 0.31, mat.woodDark, 1.65, 2.14, -3.03, group, 0.01);
  for (const x of [0.62, 2.62]) {
    box(0.055, 0.29, 0.06, mat.woodDark, x, 2.32, -3.03, group, 0.009);
  }
  for (const [x, rad, color] of [[0.91, 0.13, mat.porcelain], [1.28, 0.1, mat.sage], [1.65, 0.14, mat.porcelain], [2.08, 0.11, mat.citrus], [2.39, 0.13, mat.porcelain]]) {
    cylinder(rad, rad * 0.68, 0.14, color, x, 2.31, -2.93, group, 24);
    torus(rad * 0.72, 0.008, mat.tileShade, x, 2.385, -2.93, group).rotation.x = Math.PI / 2;
  }

  // Small herb pots on the sill and back counter make the set feel occupied.
  for (const [x, z, pot] of [[-4.1, -0.6, mat.terracotta], [-4.1, 0.95, mat.porcelain]]) {
    cylinder(0.12, 0.085, 0.19, pot, x, 1.1, z, group, 20);
    for (const [dx, dy, dz] of [[-0.09, 0.16, 0], [0, 0.22, 0.025], [0.08, 0.18, -0.02]]) {
      const leaf = sphere(0.055, 0.13, 0.04, mat.leaf, x + dx, 1.25 + dy, z + dz, group);
      leaf.rotation.z = dx * -2;
    }
  }
  for (const [x, z] of [[-0.82, -2.62], [3.53, -2.7]]) {
    cylinder(0.1, 0.075, 0.16, mat.terracotta, x, 0.99, z, group, 20);
    sphere(0.045, 0.16, 0.05, mat.leafLight, x - 0.04, 1.15, z, group).rotation.z = 0.2;
    sphere(0.045, 0.16, 0.05, mat.leaf, x + 0.04, 1.16, z, group).rotation.z = -0.2;
  }

  // Gentle window ledge and wall sconce on the back return; brass, not bright chrome.
  box(0.36, 0.045, 0.42, mat.woodLight, -4.27, 2.25, -2.56, group, 0.012);
  cylinder(0.09, 0.09, 0.06, mat.brass, -4.19, 2.31, -2.56, group, 20);
  sphere(0.055, 0.075, 0.055, mat.cream, -4.19, 2.39, -2.56, group);

  const anchors = {
    prep: new THREE.Vector3(0, 0.98, -0.45),
    pantry: new THREE.Vector3(-3.05, 1.2, -1.9),
    oven: new THREE.Vector3(1.45, 0.6, -2.05),
    receiving: new THREE.Vector3(-2.8, 1.08, 1.2),
    office: new THREE.Vector3(3.45, 1.0, 1.35),
  };

  return { group, ovenDoor, ovenTray, pantryDoor, anchors };
}
