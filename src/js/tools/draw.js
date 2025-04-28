/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import logo from '../../../src/assets/header.png';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/addons/geometries/TextGeometry';
import { getRandomColor, getRandomInt, createGradientTexture } from './helpers';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import gradient from '@/assets/gradient.png';
import earthPic from '@/assets/earth.jpg';
import earthLight from '@/assets/earth_1.jpg';
import { createMapStroke, createEarthOutline, createEarthGlow } from './drawMapLine';
import { EarthConfig } from '@/constants';

export function drawCube(useMaterial = false, size = 30) {
  const texture = new THREE.TextureLoader().load(logo);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  // 创建立方体
  const geometry = new THREE.BoxGeometry(size, size, size);
  // 几何体的材质
  const material = new THREE.MeshBasicMaterial(
    useMaterial ? { map: texture } : { color: getRandomColor() }
  );

  // mesh网格
  return new THREE.Mesh(geometry, material);
}

export function drawLine() {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    linewidth: 20,
  });
  const points = [];
  const numPoints = 150; // 线段的点数
  const amplitude = 2; // 振幅

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * 10 - 5; // 横向范围
    const y = Math.sin(x) * amplitude; // 使用正弦函数生成波动
    const z = 0; // 保持在 Z=0 平面
    points.push(new THREE.Vector3(x, y, z));
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(lineGeometry, lineMaterial);
}

export function drawText() {
  const text = 'Three.js';
  const fontLoader = new FontLoader();
  const depth = 20;
  const hover = 150;
  const size = 20;

  return new Promise(resolve => {
    fontLoader.load(`fonts/${getRandomInt(1, 3)}.json`, font => {
      const textGeo = new TextGeometry(text, {
        font: font,
        size: size,
        depth: depth,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
      });
      textGeo.computeBoundingBox();

      const textMaterial = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
      ];
      const centerOffset =
        -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
      const textMesh = new THREE.Mesh(textGeo, textMaterial);
      textMesh.position.set(centerOffset, hover, 0);
      textMesh.rotation.x = 0;
      textMesh.rotation.y = Math.PI * 2;

      const textMesh2 = new THREE.Mesh(textGeo, textMaterial);
      textMesh2.position.set(centerOffset, hover - size, depth);

      textMesh2.rotation.x = Math.PI;
      textMesh2.rotation.y = Math.PI * 2;

      textMesh.castShadow = true;
      textMesh.receiveShadow = true;

      const group = new THREE.Group();
      group.add(textMesh, textMesh2);

      resolve(group);
    });
  });
}

export function drawEdge() {
  const geometry = new THREE.CylinderGeometry(100, 100, 100, 30);
  const cylinderEdges = new THREE.EdgesGeometry(geometry);
  const lines = new THREE.LineSegments(
    cylinderEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  lines.position.y = 50;

  return lines;
}

export function drawCircleLines() {
  const radius = 100;
  const lineNumber = 30;
  const lines = [];

  const circle = new THREE.CircleGeometry(100, 30);
  const edges = new THREE.EdgesGeometry(circle);
  const circleLines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial()
  );
  const y = 50;
  circleLines.position.y = y;
  circleLines.rotation.x = Math.PI / 2;

  for (let i = 0; i < lineNumber; i++) {
    const angle = (i / lineNumber) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    const points = new Float32Array([
      0,
      y,
      0, // 圆心
      x,
      y,
      z, // 边缘点
    ]);

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions(points);

    const lineMateria = new LineMaterial({
      color: getRandomColor(),
      linewidth: 5,
    });

    const line = new Line2(lineGeometry, lineMateria);
    line.computeLineDistances();
    lines.push(line);
  }

  const linesGroup = new THREE.Group();
  linesGroup.add(...lines, circleLines);

  return linesGroup;
}

export function drawCylinderGroup() {
  const group = new THREE.Group();
  const linesGroupTop = drawCircleLines();
  linesGroupTop.name = 'linesGroupTop';
  linesGroupTop.position.y = 50;
  const linesGroupBottom = drawCircleLines();
  linesGroupBottom.name = 'linesGroupBottom';
  linesGroupBottom.position.y = -50;

  group.add(linesGroupTop, drawEdge(), linesGroupBottom);
  return group;
}

export function drawCylinder() {
  const cylinder = new THREE.CylinderGeometry(100, 100, 100, 30);
  const material = new THREE.EdgesGeometry(cylinder);
  const mesh = new THREE.LineSegments(material);
  mesh.position.y = 50;
  return mesh;
}

export function drawExtrude() {
  const length = 12,
    width = 8;
  const { x, y } = {
    x: 120,
    y: 0,
  };

  const shape = new THREE.Shape();
  shape.moveTo(x, y);
  shape.lineTo(x, width);
  shape.lineTo(length + x, width);
  shape.lineTo(length + x, 0);
  shape.lineTo(x, y);

  const extrudeSettings = {
    steps: 2,
    depth: 30,
    bevelEnabled: true,
    bevelThickness: 4,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 1,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const mesh = new THREE.Mesh(geometry, [material, material2]);
  return mesh;
}

export function drawCurve(pointArr) {
  const curve = new THREE.CatmullRomCurve3(
    pointArr.map(el => new THREE.Vector3(...el)),
    true
  );

  // const points = curve.getPoints(200)
  // const geometry = new THREE.BufferGeometry().setFromPoints(points)
  // const trackMaterial = new THREE.LineBasicMaterial({ color: getRandomColor() });
  // const track = new THREE.Line(geometry, trackMaterial);

  const trackGeometry = new THREE.TubeGeometry(curve, 500, 10, 58, false);
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const track = new THREE.Mesh(trackGeometry, trackMaterial);

  return {
    track,
    curve,
  };
}

export function drawStars() {
  const texture = new THREE.TextureLoader().load(gradient);
  const positions = [];
  const colors = [];
  const sizes = [];

  const geometry = new THREE.BufferGeometry();

  for (let i = 0; i < 10000; i++) {
    // positions.push(new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1,))
    let vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    positions.push(vertex.x, vertex.y, vertex.z);

    sizes.push(Math.random() * 10);
    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const shaderMaterial = new THREE.PointsMaterial({
    map: texture,
    size: 8,
    transparent: true,
    opacity: 1,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geometry, shaderMaterial);
  stars.scale.set(2400, 2400, 2400);

  return stars;
}

export function drawEarth(camera) {
  const texture = new THREE.TextureLoader().load(earthPic);
  const earthLightPic = new THREE.TextureLoader().load(earthLight);

  const earthObj = new THREE.Object3D();
  const geometry = new THREE.SphereGeometry(EarthConfig.radius, 100, 100);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    flatShading: true,
    lightMap: earthLightPic,
    fog: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'earth';
  const group = new THREE.Object3D();
  const outline = createEarthOutline();
  outline.name = 'outline';
  const glow = createEarthGlow()


  glow.name = 'glow'
  group.add(mesh, createMapStroke(), outline, glow);
  group.position.set(0, 0, 0);

  function animate() {
    requestAnimationFrame(animate);
    const val = EarthConfig.radius * 5 * camera.position.z / (-776)
    glow.scale.set(val, val, 1)
  }

  animate()

  return group;
}
