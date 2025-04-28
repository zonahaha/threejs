import {
  Vector2,
  AmbientLight,
  PointLight,
  ReinhardToneMapping,
  Mesh,
  SphereGeometry,
  MeshPhongMaterial,
  TextureLoader,
  Raycaster,
  Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import tools from '../tools/scene';
import gsap from 'gsap';
import earthPic from '@/assets/earth.jpg';

let { render, camera, scene, controls } = tools.renderAndCamera();
const raycaster = new Raycaster();
const mouse = new Vector2();
let earthMesh;

export const initCursor = () => {
  const dom = document.getElementById('cursorContainer');
  Object.assign(dom.style, {
    height: '100%', 
    width: '100%',
    position: 'absolute'
  });

  // 设置相机位置
  camera.position.set(0, 0, 500);
  
  // 添加环境光和点光源
  const ambientLight = new AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);
  const pointLight = new PointLight(0xffffff, 2);
  pointLight.position.set(100, 100, 100);
  scene.add(pointLight);

  // 渲染器设置
  render.setPixelRatio(window.devicePixelRatio);
  render.setSize(window.innerWidth, window.innerHeight);
  render.toneMapping = ReinhardToneMapping;
  dom.appendChild(render.domElement);

  // 创建地球
  const geometry = new SphereGeometry(200, 64, 64);
  const textureLoader = new TextureLoader();
  const texture = textureLoader.load(earthPic);
  const material = new MeshPhongMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.5
  });
  earthMesh = new Mesh(geometry, material);

  scene.add(earthMesh);

  // 控制器设置
  controls = new OrbitControls(camera, render.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;

  // 添加点击事件
  dom.addEventListener('click', onMouseClick);
  
  animate();
};

const onMouseClick = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(earthMesh);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    const lat = 90 - (Math.acos(point.y / 200) * 180) / Math.PI;
    const lon = ((Math.atan2(point.x, point.z) * 180) / Math.PI + 180) % 360 - 180;

    // 计算新的相机位置
    const distance = camera.position.distanceTo(new Vector3(0, 0, 0));
    if (distance > 300) {
      // 放大视图
      gsap.to(camera.position, {
        duration: 1,
        x: point.x * 1.5,
        y: point.y * 1.5,
        z: point.z * 1.5
      });
    } else {
      // 显示位置信息
      alert(`位置信息:\n纬度: ${lat.toFixed(2)}°\n经度: ${lon.toFixed(2)}°`);
      // 恢复原始视图
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: 500
      });
    }
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  earthMesh.rotation.y += 0.001;
  controls.update();
  render.render(scene, camera);
};

