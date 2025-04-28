/* eslint-disable no-unused-vars */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  renderAndCamera: () => {
    // 渲染器
    // alpha表示透明
    const render = new THREE.WebGLRenderer({ antialias: true });

    render.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(render.domElement);

    // 透视摄像机PerspectiveCamera，视野角度，长宽比，近截面，远截面
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1500
    );
    camera.position.set(
      -253.88549947496423,
      627.9562111675557,
      -776.9898004558664
    );
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);

    const controls = new OrbitControls(camera, render.domElement);
    controls.enableDamping = true; // 启用阻尼（惯性）
    controls.dampingFactor = 0.25; // 阻尼因子
    controls.screenSpacePanning = true; // 禁用平移
    controls.maxPolarAngle = Math.PI; // 限制上下旋转角度

    const scene = new THREE.Scene();
    scene.background = null;
    // scene.background = new THREE.Color('white')

    // scene.fog = new THREE.Fog(0x000000, 250, 1400)

    // LIGHTS
    // 平行光，类似太阳光，不会衰减
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 0, 1000);
    // scene.add(dirLight);
    const dirLightBack = new THREE.DirectionalLight(0xffffff, 1);
    dirLightBack.position.set(0, 0, -1000);
    // scene.add(dirLightBack);

    const pointLight = new THREE.PointLight(0xffffff, 15, 1000, 0);
    // pointLight.color.setHSL(Math.random(), 1, 0.5);
    pointLight.position.set(0, 1000, 1000);
    // scene.add(pointLight);

    const targetObject = new THREE.Object3D(); // 创建一个空对象作为目标
    targetObject.position.set(0, 0, 0); // 将目标设置在场景中心
    scene.add(targetObject);
    dirLight.target = targetObject; // 设置光的目标
    pointLight.target = targetObject;
    dirLightBack.target = targetObject;

    const light = new THREE.AmbientLight(0x404040); // 环境光
    // scene.add(light);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshBasicMaterial({
        color: 'green',
        opacity: 0.8,
        transparent: true,
      })
    );
    plane.position.y = -100;
    plane.rotation.x = -Math.PI / 2;
    // scene.add(plane);

    const axesHelper = new THREE.AxesHelper(5000); // 参数为坐标轴的长度
    // scene.add(axesHelper);

    scene.addFn = params => {
      if (!Array.isArray(params)) {
        scene.add(params);
      } else {
        params.forEach(el => {
          scene.add(el);
        });
      }
    };

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      render.setSize(window.innerWidth, window.innerHeight);
    });

    return {
      render,
      camera,
      scene,
      controls,
    };
  },
};
