/* eslint-disable no-unused-vars */
import {
  Clock,
  Vector2,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  DirectionalLight,
  PerspectiveCamera,
  AxesHelper,
  Object3D,
  EdgesGeometry,
  MeshBasicMaterial,
  Mesh,
  LineSegments,
  LineBasicMaterial,
} from 'three';
import { createElement } from '../tools/dom';
import tools from '../tools/scene';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import gsap from 'gsap';
import { getRandomColor } from '../tools/helpers';

let { render, camera, scene, controls } = tools.renderAndCamera();
let mixer, clip, composer, modelData, bloomPass, model;
let edgesMeshList = [];
const clock = new Clock();
const params = {
  threshold: 0, // 调整阈值
  strength: 0.5, // 增加强度
  radius: 0, // 增加半径
  exposure: 1, // 调整曝光
};

export const initDepart = () => {
  const dom = document.getElementById('departContainer');
  Object.assign(dom.style, {
    height: '100%',
    width: '100%',
    position: 'absolute',
  });

  camera.position.set(0, 10, 15);
  initLight();

  render.toneMapping = ReinhardToneMapping;
  render.toneMappingExposure = Math.pow(params.exposure, 4.0);
  render.setClearColor(0x000000);
  render.setPixelRatio(window.devicePixelRatio);
  // 设置色调映射  这个属性用于在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果。

  dom.appendChild(render.domElement);

  const axesHelper = new AxesHelper(500);
  //   scene.add(axesHelper);

  initBloom();

  const loader = new GLTFLoader();

  initUI();

  loader.load('./models/cubes.glb', gltf => {
    if (!gltf) return;

    model = gltf.scene;
    model.position.set(1, 1, 1);
    gltf.scene.traverse(obj => {
      const mesh = obj;
      const edges = new EdgesGeometry(mesh.geometry);
      const edgesMaterial = new MeshBasicMaterial({
        color: getRandomColor(null, null, 'hex'),
        wireframe: true,
      });

      const edgesMesh = new Mesh(mesh.geometry, edgesMaterial);
      edgesMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);

      edgesMesh.fromPosition = mesh.position.clone();
      edgesMesh.toPosition = mesh.position.clone().multiplyScalar(3);
      edgesMesh.decomposition = false;
      edgesMeshList.push(edgesMesh);

      scene.add(edgesMesh);
    });

    model.decomposition = false;
    // scene.add(model);
    mixer = new AnimationMixer(model);
    clip = gltf?.animations[0];

    clip?.optimize && mixer.clipAction(clip.optimize()).play();

    window.addEventListener('dblclick', () => {
      startDepart();
    });

    animate();
  });
};

const initBloom = () => {
  bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  // 发光范围？？多个模型组成的时候，从0-1表示发光的模型比例,0表示全都发光，1表示全都不发光
  bloomPass.threshold = params.threshold;
  // 发光强度
  bloomPass.strength = params.strength;
  // 玻璃磨砂，模糊？？
  bloomPass.radius = params.radius;

  composer = new EffectComposer(render);

  // 这里的添加顺序很重要！！！
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
};

const startDepart = () => {
  if (!edgesMeshList[0]?.decomposition) {
    console.log(model);
    edgesMeshList.forEach(obj => {
      const mesh = obj;
      obj.decomposition = true;
      gsap.to(mesh.position, {
        x: mesh.toPosition.x,
        y: mesh.toPosition.y,
        z: mesh.toPosition.z,
        duration: 3,
        ease: 'elastic.Out',
      });
    });
  } else {
    edgesMeshList.forEach(obj => {
      const mesh = obj;
      obj.decomposition = false;
      gsap.to(mesh.position, {
        x: mesh.fromPosition.x,
        y: mesh.fromPosition.y,
        z: mesh.fromPosition.z,
        duration: 3,
        ease: 'bounce.Out',
      });
    });
  }
};

let flag = 1;
let count = 1;

const animate = () => {
  controls.update();

  const delta = clock.getDelta();
  mixer.update(delta);

  flag = count < 60 ? 1 : -1;

  bloomPass.threshold += flag * (1 / 60);
  count += 1;

  if (count > 120) {
    count = 0;
  }
  composer?.render();

  //   render.render(scene, camera);
  requestAnimationFrame(animate);
};

const initLight = () => {
  const pointLight = new PointLight('red', 10000, 0, 0);
  pointLight.position.set(0, 0, 0);
  const directionalLightLeft = new DirectionalLight(0xffffff, 100); // 左下角平行光
  directionalLightLeft.position.set(-100, -50, -100);
  const directionalLightRight = new DirectionalLight(0xffffff, 100); // 右上角平行光
  directionalLightRight.position.set(100, 50, 100);

  scene.add(pointLight);
  scene.add(directionalLightLeft);
  scene.add(directionalLightRight);
};

const initUI = () => {
  const gui = new GUI();

  const bloomFolder = gui.addFolder('bloom');

  bloomFolder
    .add(params, 'threshold', 0.0, 1.0)
    .onChange(val => (bloomPass.threshold = val));

  bloomFolder
    .add(params, 'strength', 0.0, 3.0)
    .onChange(val => (bloomPass.strength = val));

  bloomFolder
    .add(params, 'radius', 0.0, 1.0)
    .step(0.01)
    .onChange(val => {
      bloomPass.radius = val;
    });

  const toneMappingFolder = gui.addFolder('toneMapping');
  toneMappingFolder
    .add(params, 'exposure', 0.1, 2)
    .onChange(val => (render.toneMappingExposure = Math.pow(val, 4.0)));
};
