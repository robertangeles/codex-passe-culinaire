/* Original prop models for the CulinAIre Kitchen film. All dimensions are metres. */

export function createProps(THREE, h) {
  const group = new THREE.Group();
  group.name = 'culinary-props';

  const colour = {
    board: '#B98D61', boardEdge: '#805C3B', grain: '#D5AD7D',
    wood: '#754B32', steel: '#AEB7B2', steelLight: '#E0DED2',
    copper: '#A85F3B', copperLight: '#D08A59', copperDark: '#633C2E',
    pear: '#A7A94D', pearLight: '#C7BD67', pearDark: '#71813F',
    pearFlesh: '#F1D99A', seed: '#755443', pastry: '#B67B48',
    pastryLight: '#E2B77B', almond: '#F2DFB5', cream: '#F3EBDD',
    ink: '#52624A', inkLight: '#87927A', paperLine: '#C8BDAA',
    ceramic: '#E7E2D4', waste: '#B3A675', charcoal: '#34342E',
    moss: '#566B4E', brass: '#B08A52', orange: '#C5754D',
  };
  const mat = (key, roughness = 0.75, metalness = 0) => h.material(colour[key] || key, roughness, metalness);
  const make = (name) => {
    const result = new THREE.Group();
    result.name = name;
    group.add(result);
    return result;
  };

  // Pear silhouette, with its bottom at local y=0. Used both as an individual
  // piece of fruit and inside the delivery crate.
  const pearGeo = new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.018, 0.003),
    new THREE.Vector2(0.032, 0.013), new THREE.Vector2(0.043, 0.03),
    new THREE.Vector2(0.046, 0.047), new THREE.Vector2(0.041, 0.062),
    new THREE.Vector2(0.031, 0.076), new THREE.Vector2(0.02, 0.088),
    new THREE.Vector2(0.012, 0.099), new THREE.Vector2(0.009, 0.108),
    new THREE.Vector2(0, 0.11),
  ], 28);
  const pearSkin = mat('pear', 0.88);
  const stemMat = mat('wood', 0.9);
  const makePear = (parent, name, x = 0, y = 0, z = 0, scale = 1, rotation = 0) => {
    const fruit = new THREE.Group();
    fruit.name = name;
    fruit.position.set(x, y, z);
    fruit.rotation.y = rotation;
    fruit.scale.setScalar(scale);
    parent.add(fruit);
    const body = new THREE.Mesh(pearGeo, pearSkin);
    body.castShadow = true;
    body.receiveShadow = true;
    fruit.add(body);
    const stem = h.cylinder(0.0038, 0.003, 0.018, stemMat, 0, 0.117, 0, fruit, 8);
    stem.rotation.z = -0.24;
    stem.castShadow = true;
    const leaf = h.sphere(0.010, 0.0025, 0.0045, mat('pearDark', 0.88), 0.009, 0.115, 0, fruit);
    leaf.rotation.z = 0.35;
    return fruit;
  };

  const board = make('butcher-board');
  // Board's origin is centred on its upper face: y=0 is the working surface.
  h.box(0.6, 0.028, 0.4, mat('boardEdge'), 0, -0.014, 0, board, 0.012);
  h.box(0.58, 0.006, 0.38, mat('board', 0.91), 0, -0.004, 0, board, 0.012);
  for (let i = 0; i < 5; i += 1) {
    const line = h.box(0.003, 0.001, 0.33, mat(i % 2 ? 'grain' : 'boardEdge', 0.96), -0.2 + i * 0.09, 0.0002, 0, board, 0.001);
    line.rotation.y = -0.16;
  }
  for (const x of [-0.24, 0.24]) for (const z of [-0.14, 0.14]) {
    h.cylinder(0.007, 0.007, 0.002, mat('wood'), x, -0.029, z, board, 12);
  }

  const knife = make('chef-knife');
  const handle = h.cylinder(0.018, 0.014, 0.1, mat('wood', 0.58), 0, 0.012, 0, knife, 16);
  handle.rotation.x = Math.PI / 2;
  handle.castShadow = true;
  for (const z of [-0.025, 0.023]) {
    const rivet = h.cylinder(0.0032, 0.0032, 0.0015, mat('brass', 0.3, 0.48), 0, 0.012, z, knife, 12);
    rivet.rotation.x = Math.PI / 2;
  }
  // Blade in the vertical cutting plane, handle origin at the palm.
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(.05,.012); bladeShape.lineTo(.23,.006);
  bladeShape.quadraticCurveTo(.245,-.035,.20,-.045);
  bladeShape.lineTo(.05,-.045); bladeShape.closePath();
  const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape,{depth:.003,bevelEnabled:false});
  // Shape x -> world z, shape y -> world y, extrusion -> world x.
  bladeGeometry.rotateY(-Math.PI/2);
  const blade = new THREE.Mesh(bladeGeometry,mat('steel',.22,.72));
  blade.castShadow=true; knife.add(blade);

  const bowl = make('copper-prep-bowl');
  const bowlMaterial = mat('copper', 0.31, 0.54);
  bowlMaterial.side = THREE.DoubleSide;
  const bowlProfile = [
    [0, 0.003], [0.052, 0.003], [0.084, 0.012], [0.113, 0.034],
    [0.134, 0.068], [0.14, 0.105], [0.132, 0.132], [0.122, 0.14],
    [0.115, 0.136], [0.119, 0.125], [0.124, 0.103], [0.12, 0.075],
    [0.103, 0.047], [0.078, 0.026], [0.046, 0.017], [0, 0.017],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const copperBowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProfile, 36), bowlMaterial);
  copperBowl.castShadow = true;
  copperBowl.receiveShadow = true;
  bowl.add(copperBowl);
  const bowlLip = h.torus(0.122, 0.0032, mat('copperLight', 0.27, 0.55), 0, 0.14, 0, bowl);
  bowlLip.rotation.x = Math.PI / 2;
  const bowlInterior = new THREE.Mesh(new THREE.CircleGeometry(0.096, 32), mat('copperDark', 0.75, 0.22));
  bowlInterior.rotation.x = -Math.PI / 2;
  bowlInterior.position.y = 0.024;
  bowl.add(bowlInterior);

  // Almond filling sits inside the bowl, below the rim and above its base.
  const filling = new THREE.Group(); filling.name='almond-filling'; bowl.add(filling);
  h.cylinder(.109,.10,.018,mat('almond',.80),0,.105,0,filling,36);
  for(let i=0;i<3;i++){
    const swirl=new THREE.Mesh(new THREE.TorusGeometry(.027+i*.022,.0015,6,28,2.2),mat('pastryLight',.88));
    swirl.rotation.x=Math.PI/2;swirl.rotation.z=i*1.9;swirl.position.y=.118;filling.add(swirl);
  }

  const whisk = make('balloon-whisk');
  const whiskHandle = h.cylinder(0.009, 0.007, 0.16, mat('wood', 0.52), 0, -0.08, 0, whisk, 14);
  whiskHandle.castShadow = true;
  const ferrule = h.cylinder(0.0085, 0.007, 0.026, mat('brass', 0.28, 0.52), 0, -0.153, 0, whisk, 12);
  ferrule.castShadow = true;
  const wireMat = mat('steelLight', 0.24, 0.78);
  const tube = (points, radius = 0.0015) => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, radius, 5, false), wireMat);
    mesh.castShadow = true;
    whisk.add(mesh);
  };
  const wireCount = 7;
  for (let i = 0; i < wireCount; i += 1) {
    const angle = (Math.PI * 2 * i) / wireCount;
    const sx = Math.cos(angle) * 0.004;
    const sz = Math.sin(angle) * 0.004;
    const ex = Math.cos(angle) * 0.012;
    const ez = Math.sin(angle) * 0.012;
    tube([[sx, -0.16, sz], [ex * 0.68, -0.193, ez * 0.68], [ex, -0.226, ez], [ex * 0.5, -0.239, ez * 0.5], [0, -0.232, 0]]);
  }
  const whiskLoop = h.torus(0.018, 0.0015, wireMat, 0, -0.23, 0, whisk);
  whiskLoop.rotation.x = Math.PI / 2;
  const whiskInnerLoop = h.torus(0.011, 0.0011, wireMat, 0, -0.21, 0, whisk);
  whiskInnerLoop.rotation.x = Math.PI / 2;

  const pearWhole = make('whole-pear');
  makePear(pearWhole, 'pear-fruit');

  const pearSlices = make('pear-slices');
  const crescent = (offset) => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.022, -0.018);
    shape.bezierCurveTo(-0.016, -0.03, 0.014, -0.031, 0.022, -0.014);
    shape.bezierCurveTo(0.03, 0.002, 0.018, 0.025, 0, 0.027);
    shape.bezierCurveTo(-0.018, 0.025, -0.029, 0.002, -0.022, -0.018);
    const skin = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false }), mat('pearDark', 0.92));
    skin.rotation.x = Math.PI / 2;
    skin.position.set(offset, 0.006, 0);
    skin.castShadow = true;
    pearSlices.add(skin);
    const center = new THREE.Shape();
    center.moveTo(-0.018, -0.017);
    center.bezierCurveTo(-0.012, -0.025, 0.012, -0.026, 0.018, -0.013);
    center.bezierCurveTo(0.025, 0.002, 0.015, 0.021, 0, 0.023);
    center.bezierCurveTo(-0.015, 0.021, -0.024, 0.002, -0.018, -0.017);
    const flesh = new THREE.Mesh(new THREE.ExtrudeGeometry(center, { depth: 0.0065, bevelEnabled: false }), mat('pearFlesh', 0.85));
    flesh.rotation.x = Math.PI / 2;
    flesh.position.set(offset, 0.0065, 0);
    flesh.castShadow = true;
    pearSlices.add(flesh);
    const seed = h.sphere(0.002, 0.0012, 0.003, mat('seed', 0.9), offset, 0.014, 0.002, pearSlices);
    seed.rotation.z = 0.22;
  };
  for (let i = 0; i < 5; i += 1) crescent((i - 2) * 0.026);

  const tray = make('baking-tray');
  const traySteel = mat('charcoal', 0.42, 0.28);
  h.box(0.5, 0.012, 0.35, traySteel, 0, 0.009, 0, tray, 0.008);
  for (const x of [-0.246, 0.246]) h.box(0.008, 0.028, 0.35, mat('steel', 0.42, 0.35), x, 0.022, 0, tray, 0.003);
  for (const z of [-0.171, 0.171]) h.box(0.5, 0.028, 0.008, mat('steel', 0.42, 0.35), 0, 0.022, z, tray, 0.003);

  const tarts = make('six-pear-tarts');
  const tartCrust = mat('pastry', 0.86);
  const tartFilling = mat('pearFlesh', 0.8);
  const tartRingMat = mat('pastryLight', 0.77);
  const almondMat = mat('almond', 0.72);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = (col - 1) * 0.15;
      const z = (row - 0.5) * 0.145;
      h.cylinder(0.047, 0.043, 0.018, tartCrust, x, 0.026, z, tarts, 28);
      h.cylinder(0.037, 0.037, 0.007, tartFilling, x, 0.038, z, tarts, 28);
      const crimp = h.torus(0.04, 0.0032, tartRingMat, x, 0.038, z, tarts, 24);
      crimp.rotation.x = Math.PI / 2;
      h.cylinder(0.003, 0.003, 0.003, mat('pearDark'), x, 0.043, z, tarts, 12);
      for (let almond = 0; almond < 3; almond += 1) {
        const angle = (almond / 3) * Math.PI * 2 + 0.25;
        const shard = h.sphere(0.009, 0.0025, 0.0032, almondMat, x + Math.cos(angle) * 0.018, 0.043, z + Math.sin(angle) * 0.018, tarts);
        shard.rotation.y = -angle;
        shard.rotation.z = -0.16;
      }
    }
  }

  const crate = make('market-crate');
  const crateWood = mat('wood', 0.93);
  const crateLight = mat('board', 0.91);
  const crateWidth = 0.65;
  const crateDepth = 0.4;
  const crateHeight = 0.30;
  h.box(crateWidth - 0.045, 0.022, crateDepth - 0.045, crateWood, 0, 0.011, 0, crate, 0.005);
  for (const x of [-crateWidth / 2 + 0.018, crateWidth / 2 - 0.018]) {
    for (const z of [-crateDepth / 2 + 0.018, crateDepth / 2 - 0.018]) {
      h.box(0.036, crateHeight, 0.036, crateWood, x, crateHeight / 2, z, crate, 0.004);
    }
  }
  for (let row = 0; row < 3; row += 1) {
    const y = 0.048 + row * 0.073;
    for (const z of [-crateDepth / 2 + 0.012, crateDepth / 2 - 0.012]) {
      h.box(crateWidth - 0.032, 0.045, 0.018, row === 1 ? crateLight : crateWood, 0, y, z, crate, 0.004);
    }
    for (const x of [-crateWidth / 2 + 0.012, crateWidth / 2 - 0.012]) {
      h.box(0.018, 0.045, crateDepth - 0.032, row === 1 ? crateLight : crateWood, x, y, 0, crate, 0.004);
    }
  }
  // A small maker's mark is painted on the front slat.
  h.box(0.075, 0.032, 0.0015, mat('cream'), 0, 0.125, crateDepth / 2 + 0.001, crate, 0.002);
  h.box(0.044, 0.002, 0.001, mat('moss'), 0, 0.125, crateDepth / 2 + 0.002, crate, 0.0005);
  const crateFruit = [
    [-0.19, -0.08, 0.15, 0.92], [-0.07, -0.09, 0.17, 1], [0.07, -0.08, 0.15, 0.9], [0.19, -0.07, 0.17, 0.95],
    [-0.13, 0.055, 0.18, 0.98], [0.015, 0.045, 0.19, 1.04], [0.15, 0.055, 0.18, 0.94],
  ];
  crateFruit.forEach(([x, z, y, scale], index) => makePear(crate, `crate-pear-${index + 1}`, x, y, z, scale, index * 0.7));

  const ledger = make('open-prep-ledger');
  h.box(0.37, 0.012, 0.27, mat('wood', 0.92), 0, 0.006, 0, ledger, 0.004);
  h.box(0.177, 0.006, 0.252, mat('cream', 0.94), -0.091, 0.014, 0, ledger, 0.003);
  h.box(0.177, 0.006, 0.252, mat('cream', 0.94), 0.091, 0.014, 0, ledger, 0.003);
  h.box(0.009, 0.012, 0.258, mat('boardEdge'), 0, 0.016, 0, ledger, 0.002);
  for (let row = 0; row < 6; row += 1) {
    const z = -0.092 + row * 0.032;
    for (const side of [-1, 1]) {
      const width = row === 0 ? 0.108 : (row % 3 === 0 ? 0.12 : 0.136);
      h.box(width, 0.0014, 0.0018, mat('paperLine', 0.9), side * 0.092, 0.018, z, ledger, 0.0006);
    }
  }
  h.box(0.028, 0.002, 0.018, mat('orange'), -0.148, 0.019, -0.09, ledger, 0.001);
  h.box(0.034, 0.002, 0.02, mat('moss'), 0.145, 0.019, -0.09, ledger, 0.001);
  h.box(0.012, 0.002, 0.07, mat('inkLight'), 0.126, 0.019, -0.015, ledger, 0.001);

  const wasteBowl = make('waste-bowl');
  const wasteMat = mat('ceramic', 0.34, 0.05);
  wasteMat.side = THREE.DoubleSide;
  const wasteProfile = [
    [0, 0.002], [0.035, 0.002], [0.064, 0.009], [0.083, 0.026],
    [0.098, 0.05], [0.1, 0.073], [0.094, 0.086], [0.087, 0.087],
    [0.082, 0.08], [0.085, 0.062], [0.076, 0.04], [0.058, 0.023], [0, 0.014],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const wasteShape = new THREE.Mesh(new THREE.LatheGeometry(wasteProfile, 28), wasteMat);
  wasteShape.castShadow = true;
  wasteShape.receiveShadow = true;
  wasteBowl.add(wasteShape);
  const wasteLip = h.torus(0.09, 0.0026, mat('inkLight', 0.36, 0.08), 0, 0.085, 0, wasteBowl);
  wasteLip.rotation.x = Math.PI / 2;
  const peelMats = [mat('pearLight'), mat('pearDark'), mat('orange')];
  const peelPositions = [[-0.023, 0.043, -0.008], [0.016, 0.047, 0.01], [0.002, 0.05, -0.018], [-0.039, 0.038, 0.022]];
  peelPositions.forEach(([x, y, z], index) => {
    const peel = h.sphere(0.031, 0.0035, 0.009, peelMats[index % peelMats.length], x, y, z, wasteBowl);
    peel.rotation.y = index * 0.77;
    peel.rotation.z = (index - 1) * 0.12;
  });

  const tablet = make('kitchen-tablet');
  h.box(0.2, 0.28, 0.014, mat('charcoal', 0.48, 0.24), 0, 0.14, 0, tablet, 0.012);
  h.box(0.178, 0.248, 0.0015, mat('cream', 0.85), 0, 0.145, 0.008, tablet, 0.004);
  h.box(0.13, 0.004, 0.002, mat('moss'), 0, 0.239, 0.009, tablet, 0.001);
  h.box(0.062, 0.006, 0.002, mat('orange'), -0.037, 0.218, 0.009, tablet, 0.001);
  h.box(0.016, 0.006, 0.002, mat('inkLight'), 0.014, 0.218, 0.009, tablet, 0.001);
  for (let row = 0; row < 4; row += 1) {
    h.box(0.102 - (row % 2) * 0.019, 0.0022, 0.002, mat('paperLine'), 0, 0.193 - row * 0.016, 0.009, tablet, 0.0007);
  }
  for (let bar = 0; bar < 4; bar += 1) {
    h.box(0.013, 0.02 + (bar % 2) * 0.013, 0.002, mat(bar === 3 ? 'orange' : 'moss'), -0.045 + bar * 0.024, 0.085 + (bar % 2) * 0.006, 0.009, tablet, 0.001);
  }
  h.cylinder(0.004, 0.004, 0.0014, mat('steel'), 0, 0.012, 0.009, tablet, 12);

  const salesSheets = make('sales-receipts');
  const receiptMat = mat('cream', 0.94);
  for (let index = 0; index < 3; index += 1) {
    const sheet = new THREE.Group();
    sheet.name = `sales-sheet-${index + 1}`;
    sheet.position.set((index - 1) * 0.035, index * 0.001, (index - 1) * 0.024);
    sheet.rotation.y = (index - 1) * 0.11;
    salesSheets.add(sheet);
    h.box(0.13, 0.002, 0.2, receiptMat, 0, 0.001, 0, sheet, 0.0015);
    h.box(0.072, 0.003, 0.008, mat('moss'), 0, 0.003, -0.078, sheet, 0.0007);
    for (let row = 0; row < 5; row += 1) {
      h.box(row === 4 ? 0.035 : 0.09, 0.002, 0.002, mat('paperLine'), 0, 0.003, -0.053 + row * 0.022, sheet, 0.0005);
    }
    h.box(0.04, 0.003, 0.008, mat('orange'), 0.026, 0.003, 0.064, sheet, 0.0006);
  }

  return { group, board, knife, bowl, filling, whisk, pearWhole, pearSlices, tray, tarts, crate, ledger, wasteBowl, tablet, salesSheets };
}
