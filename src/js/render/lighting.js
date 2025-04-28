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

let { render, camera, scene, controls } = tools.renderAndCamera();
let mixer, clip, composer, modelData;
const clock = new Clock();
const params = {
  threshold: 0, // 调整阈值
  strength: 1, // 增加强度
  radius: 0, // 增加半径
  exposure: 0.5, // 调整曝光
};

export const initLightning = () => {
  const dom = document.getElementById('lightningContainer');

  Object.assign(dom.style, {
    height: '100%',
    width: '100%',
    position: 'absolute',
  });

  camera.position.set(0, 1, 3);
  initLight();

  render.toneMapping = ReinhardToneMapping;
  render.toneMappingExposure = Math.pow(params.exposure, 4.0);
  render.setClearColor(0x000000);
  render.setPixelRatio(window.devicePixelRatio);
  // 设置色调映射  这个属性用于在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果。

  dom.appendChild(render.domElement);

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  // 发光效果
  bloomPass.threshold = params.threshold;
  // 发光强度
  bloomPass.strength = params.strength;
  // 玻璃磨砂，模糊？？
  bloomPass.radius = params.radius;

  const outputPass = new OutputPass();

  composer = new EffectComposer(render);

  // 这里的添加顺序很重要！！！
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  const loader = new GLTFLoader();

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

  loader.load('./models/PrimaryIonDrive.glb', gltf => {
    if (!gltf) return;

    const model = gltf.scene;
    // gltf.scene.traverse(obj => {
    //   const mesh = obj;
    //   mesh.fromPosition = mesh.position.clone();
    //   mesh.toPosition = mesh.position.clone().multiplyScalar(3);
    // });
    // modelData = model;
    // modelData.decomposition = false;
    scene.add(model);
    mixer = new AnimationMixer(model);
    clip = gltf.animations[0];

    mixer.clipAction(clip.optimize()).play();

    animate();
  });
};

const animate = () => {
  controls.update();

  const delta = clock.getDelta();
  mixer.update(delta);
  composer.render();

  // render.render(scene, camera);
  requestAnimationFrame(animate);
};

const initLight = () => {
  const ambientLight = new AmbientLight(0xcccccc, 30); // 环境光
  scene.add(ambientLight);
  // const pointLight = new PointLight(0xffffff, 100);
  // scene.add(pointLight);
};
