/* eslint-disable no-unused-vars */
import {
  TextureLoader,
  Group,
  Box3,
  Clock,
  DirectionalLight,
  AmbientLight,
  LoopOnce,
  AnimationUtils,
} from 'three';
import Vue from 'vue';
import { createElement } from '../tools/dom';
import tools from '../tools/scene';
import bgImage from '@/assets/bg.jpeg';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Vector3 } from 'three';
import { AnimationMixer } from 'three';

const { render, camera, scene, controls } = tools.renderAndCamera();
const trackNum = 5;
const moveSpeed = 0.03;
const hurdleInterval = 100;
const hurdleMinDistance = 15;

const JUMP = 'jumping';
const RUNNING = 'running';

const global = {
  characterGroup: new Group(), // 人物组
  hurdleGroup: new Group(), // 跨栏组
  trackGroup: new Group(), // 跑道组
  animationMixer: null, //动画混合器
  actions: {}, //人物动作集合
  currentAction: null, // 当前人物动作
  previousAction: null, //上一个动作
  tractWidth: 0, //跑道宽度
  trackArr: [], //跑道集合
  hurdleArr: [], // 跨栏集合
  hurdleCountFrame: 0, //跨栏计算帧数
  isDeath: false, //是否死亡
  characterBoundingBox: new Box3(), // 人物包围盒
  hurdleBoundingBox: [], //跨栏包围盒数组
  clock: new Clock(), // 计算动画事件
  frame: null, // 帧动画id
};

export const initGame = () => {
  // 使用已存在的容器或创建新容器
  const dom = document.getElementById('gameContainer');

  Object.assign(dom.style, {
    height: '100%',
    width: '100%',
    position: 'absolute',
  });


  camera.position.set(0, 1, 5);
  // controls.enabled = false;
  initLight();
  controls.update();

  dom.appendChild(render.domElement);

  const textureLoader = new TextureLoader();
  textureLoader.load(bgImage, texture => {
    scene.background = texture;
  });

  const loader = new GLTFLoader();
  loader.load('./models/group.glb', gltf => {
    if (!gltf) return;
    const children = [...gltf.scene.children];

    // 初始化人物模型
    global.characterGroup.add(children[0]);
    global.characterGroup.rotation.set(0, Math.PI / 2, 0);
    scene.add(global.characterGroup);

    // 初始化跨栏模型
    global.hurdleGroup.add(children[1]);
    global.hurdleGroup.scale.set(0.7, 0.7, 0.7);
    global.hurdleGroup.rotation.set(0, Math.PI / 2, 0);
    global.hurdleGroup.position.set(5, 0, 0);
    // global.hurdleArr.push(global.hurdleGroup);
    // scene.add(global.hurdleGroup);

    // 初始化跑道
    global.trackGroup.add(children[2]);
    global.trackGroup.rotation.set(0, Math.PI / 2, 0);
    scene.add(global.trackGroup);

    // 获取跑道宽度
    const boundingBox = new Box3().setFromObject(global.trackGroup); // 创建包围盒
    const size = new Vector3();
    boundingBox.getSize(size);
    global.tractWidth = size.x - 2;

    for (let i = 0; i < trackNum; i++) {
      const newTractModel = global.trackGroup.clone();
      newTractModel.position.x = i * global.tractWidth;
      scene.add(newTractModel);
      global.trackArr.push(newTractModel);
    }

    global.animationMixer = new AnimationMixer(global.characterGroup);

    gltf.animations.forEach(clip => {
      global.actions[clip.name] = global.animationMixer.clipAction(clip);
    });

    global.currentAction = global.actions['idle'];
    global.currentAction.play();

    window.addEventListener('keyup', ev => {
      switch (ev.code) {
        case 'keyD':
        case 'ArrowRight':
          !global.isDeath && switchAction('running');
          break;
        case 'keyA':
        case 'ArrowLeft':
          !global.isDeath && switchAction('idle');
          break;
        case 'Space':
        case 'ArrowUp':
          !global.isDeath && switchAction(JUMP);
          break;
        case 'Enter':
          reset(animate, global, camera);
          break;
      }
    });

    const jumpAction = global.actions[JUMP];

    const duration = jumpAction.getClip().duration;
    const frameRate = jumpAction.getClip().tracks[0].times.length / duration;
    const startTime = 0.7 * frameRate;
    const endTime = 2.8 * frameRate;

    const trimmedClip = AnimationUtils.subclip(
      jumpAction.getClip(),
      JUMP,
      startTime,
      endTime
    );

    global.animationMixer.uncacheAction(jumpAction);

    global.actions[JUMP] = global.animationMixer.clipAction(trimmedClip);

    animate();
  });
};

const animate = () => {
  global.frame = requestAnimationFrame(animate);
  global.animationMixer?.update(global.clock.getDelta()); //更新动画混合器

  if (
    global.currentAction === global.actions?.[JUMP] &&
    global.currentAction?.time >= global.currentAction?.getClip()?.duration
  ) {
    switchAction('running', 0.3);
  }

  if (
    global.characterGroup &&
    (global.currentAction === global.actions?.['running'] ||
      global.currentAction === global.actions?.[JUMP])
  ) {
    global.characterGroup.position.x += moveSpeed;
    camera.position.x = global.characterGroup.position.x;

    if (
      global.hurdleCountFrame++ >
      hurdleInterval + Math.random() * hurdleInterval
    ) {
      // generateHurdles(global.hurdleGroup, global.hurdleArr, scene); // 生成跨栏
      global.hurdleCountFrame = 0;
    }
  }

  updateTrack(camera, global.trackArr, global.tractWidth);

  updateCharacterPosition(
    global.clock,
    global.currentAction,
    global.actions,
    global.characterGroup
  );

  if (
    !global.isDeath &&
    checkCollision(
      global.characterGroup,
      global.characterBoundingBox,
      global.hurdleBoundingBox,
      global.hurdleArr
    )
  ) {
    switchAction('death');
    global.isDeath = true;
  }

  if (
    global.currentAction === global.actions['death'] &&
    !global.currentAction.isRunning()
  ) {
    cancelAnimationFrame(global.frame);
  }

  render.render(scene, camera);
};

const switchAction = (action, duration = 0.5) => {
  const newAction = global.actions[action];

  if (newAction && global.currentAction !== newAction) {
    global.previousAction = global.currentAction;
  }

  if (global.previousAction) {
    global.previousAction.fadeOut(duration);
  }

  // 如果切换到 jump 动作，设置播放一次并在结束后停止
  if (action === JUMP) {
    newAction.loop = LoopOnce;
    newAction.clampWhenFinished = true; // 停止在最后一帧
  }

  // 如果切换到 death 动作，设置播放一次并在结束后停止
  if (action === 'death') {
    newAction.loop = LoopOnce;
    newAction.clampWhenFinished = true; // 停止在最后一帧
    Vue.prototype?.$message?.error('Game Over');
  }
  global.currentAction = newAction; // 设置新的活动动作

  global.currentAction.reset();
  // 动画速度
  global.currentAction.setEffectiveTimeScale(1);
  // global.currentAction.setEffectiveTimeScale(1);
  // 动画影响
  global.currentAction.setEffectiveWeight(1);
  global.currentAction.fadeIn(duration).play();
};

const initLight = () => {
  const ambientLight = new AmbientLight(0x404040, 20); // 环境光
  scene.add(ambientLight);
  const directionalLight = new DirectionalLight(0xffffff, 5); // 平行光
  directionalLight.position.set(0, 10, 5);
  scene.add(directionalLight);
  const directionalLight2 = new DirectionalLight(0xffffff, 5); // 平行光
  directionalLight2.position.set(0, -10, -5);
  scene.add(directionalLight2);
};

const checkCollision = (
  characterGroup,
  characterBoundingBox,
  hurdleBoundingBox,
  hurdleArr
) => {
  // 更新人物边界
  if (characterGroup) {
    characterBoundingBox.setFromObject(characterGroup);
  }

  hurdleBoundingBox = hurdleArr.map(hurdle => {
    const box = new Box3();
    box.setFromObject(hurdle);
    return box;
  });

  for (let i = 0; i < hurdleBoundingBox.length; i++) {
    if (characterBoundingBox.intersectsBox(hurdleBoundingBox[i])) {
      // console.log(
      //   'hurdleBoundingBox',
      //   hurdleBoundingBox[i].min.x.toFixed(2),
      //   '-',
      //   hurdleBoundingBox[i].max.x.toFixed(2),
      //   hurdleBoundingBox[i].min.y.toFixed(2),
      //   '-',
      //   hurdleBoundingBox[i].max.y.toFixed(2)
      // );
      // console.log(
      //   'characterBoundingBox',
      //   characterBoundingBox.min.x.toFixed(2),
      //   '-',
      //   characterBoundingBox.max.x.toFixed(2),
      //   characterBoundingBox.min.y.toFixed(2),
      //   '-',
      //   characterBoundingBox.max.x.toFixed(2)
      // );
      return true;
    }
  }
  return false;
};

const jumpConfig = {
  height: 4, // 最大跳跃高度
  prepareTime: 0.1, // 起跳缓冲时间
  gravity: -15, // 重力加速度
  airResistance: 0.002, // 空气阻力系数
  prepareCrouchHeight: 0.15, // 起跳前下蹲高度
};

let jumpStartTime = 0;
let isJumping = false;
let isPreparingJump = false;
let isFalling = false;
let currentVelocity = 0; // 当前垂直速度

const updateCharacterPosition = (
  clock,
  currentAction,
  actions,
  characterGroup
) => {
  const deltaTime = clock.getDelta(); // 获取帧间隔时间

  if (currentAction === actions[JUMP]) {
    // 计算初始速度，考虑空气阻力
    const initialVelocity = Math.sqrt(
      -2 * jumpConfig.gravity * jumpConfig.height
    );

    if (!isJumping && !isPreparingJump && !isFalling ) {
      isPreparingJump = true;
      jumpStartTime = clock.getElapsedTime();
      currentVelocity = 0;
    }

    const elapsedTime = clock.getElapsedTime() - jumpStartTime;

    if (isPreparingJump) {
      // 起跳准备阶段：下蹲动作
      const crouchProgress = Math.min(elapsedTime / jumpConfig.prepareTime, 1);
      const prepareHeight =
        -jumpConfig.prepareCrouchHeight * Math.sin(crouchProgress * Math.PI);

      characterGroup.position.y = Math.max(
        prepareHeight,
        -jumpConfig.prepareCrouchHeight
      );

      if (elapsedTime >= jumpConfig.prepareTime) {
        isPreparingJump = false;
        isJumping = true;
        jumpStartTime = clock.getElapsedTime();
        currentVelocity = initialVelocity; // 设置初始上升速度
      }
    } else if (isJumping || isFalling) {
      // 应用空气阻力，但确保不会过强
      const airResistanceForce =
        -Math.sign(currentVelocity) *
        Math.pow(Math.abs(currentVelocity), 2) *
        jumpConfig.airResistance;

      // 更新速度
      currentVelocity += (jumpConfig.gravity + airResistanceForce) * deltaTime;

      // 更新位置
      const newHeight = characterGroup.position.y + currentVelocity * deltaTime;

      // 限制高度范围并更新状态
      if (newHeight <= 0) {
        // 开始落地过渡动画，而不是直接设置为0
        isJumping = false;
        isFalling = false;
      } else {
        // 确保高度不超过最大值，但不要过早限制上升
        characterGroup.position.y = newHeight;

        // 更新跳跃/下落状态 - 只在速度变为负数时才转为下落状态
        if (currentVelocity < 0 && !isFalling && isJumping) {
          isJumping = false;
          isFalling = true;
        }
      }
    } else {
        characterGroup.position.y = 0;
        currentVelocity = 0;
        switchAction(RUNNING);
      }
  } else {
    // 重置状态
    characterGroup.position.y = 0;
    isJumping = false;
    isPreparingJump = false;
    isFalling = false;
    currentVelocity = 0;
  }
};

const updateTrack = (camera, trackArr, tractWidth) => {
  const cameraPositionX = camera.position.x;

  for (let idle = 0; idle < trackArr.length; idle++) {
    const trackSegment = trackArr[idle];

    const threshold = cameraPositionX - tractWidth * 1.5;
    if (trackSegment.position.x < threshold) {
      let maxX = -Infinity;
      for (let j = 0; j < trackArr.length; j++) {
        if (trackArr[j].position.x > maxX) {
          maxX = trackArr[j].position.x;
        }
      }

      trackSegment.position.x = maxX + tractWidth;
    }
  }
};

const generateHurdles = (oldModel, hurdleArr, scene) => {
  const newModel = oldModel.clone();

  const nextPosition =
    hurdleArr[hurdleArr.length - 1].position.x +
    hurdleMinDistance +
    Math.random() * hurdleMinDistance;

  newModel.position.set(nextPosition, 0, 0);
  hurdleArr.push(newModel);
  scene.add(newModel);
};

const reset = animate => {
  let { characterGroup, hurdleArr, hurdleGroup } = global;
  hurdleArr = [];
  hurdleArr.push(hurdleGroup);
  characterGroup.position.x = 0;
  camera.position.x = 0;
  switchAction('idle');
  global.isDeath = false;

  cancelAnimationFrame(global.frame);

  animate();
};
