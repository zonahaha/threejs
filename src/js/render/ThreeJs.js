/* eslint-disable no-unused-vars */
import { createElement } from '../tools/dom';
import tools from '../tools/scene';
import * as drawFn from '../tools/draw.js';

export default class ThreeJs {
  constructor(id) {
    this.id = id;
    this.attrs = {
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2,
      targetRotation: 0,
      targetRotationOnPointerDown: 0,
      pointerXOnPointerDown: 0,
    };
    this.dom = createElement(id, this.attrs);
    this.cube = '';
    this.renderer = '';
    this.line = '';
    this.text = '';
    this.textGroup = '';
    this.edge = '';
    this.cylinderGroup = '';
    this.controls = '';
    this.ySteps = 5;
    this.lastStep = 5;
    this.linesGroup = [];
    this.rollingCar = '';
    this.curve = '';

    this.progress = 0;
    this.direction = 0;
    this.rollingCar = '';
    this.textGroup = '';
    this.linesGroup = [];
    this.stars = '';
  }

  initTree() {
    const { render, camera, scene, controls } = tools.renderAndCamera();

    this.scene = scene;
    this.renderer = render;
    this.camera = camera;
    this.controls = controls;

    this.dom.appendChild(this.renderer.domElement);

    this.stars = drawFn.drawStars();
    scene.add(this.stars);

    this.cube = drawFn.drawCube(true);
    this.cube.position.set(250, 0, 0);
    this.scene.add(this.cube);

    this.line = drawFn.drawLine();
    this.scene.add(this.line);

    drawFn.drawText().then(res => {
      this.textGroup = res;
      this.textGroup.position.set(-200, -100, 0);

      this.scene.add(this.textGroup);
    });

    this.cylinderGroup = drawFn.drawCylinderGroup();

    this.scene.addFn(this.cylinderGroup);

    const extraCube = drawFn.drawExtrude();
    extraCube.position.x = 200;
    this.scene.add(extraCube);

    const { curve, track } = drawFn.drawCurve([
      [-100, 0, 200],
      [-50, 0, 200],
      [50, 0, 200],
      [100, 0, 200],
      [100, 0, 220],
      [100, 0, 300],
      [100, 0, 400],
      [50, 0, 400],
      [-50, 0, 400],
      [-100, 0, 400],
      [-100, 0, 300],
      [-100, 0, 220],
      [-100, 0, 200],
    ]);
    this.curve = curve;

    this.rollingCar = drawFn.drawCube(false, 10);
    this.rollingCar.position.set(100, 0, 200);

    this.scene.add(this.rollingCar);
    this.scene.add(track);

    // const earth = drawFn.drawEarth(this.camera);
    // this.scene.add(earth);

    // 渲染场景
    this.renderer.setAnimationLoop(this.renderFn);
  }

  renderFn = () => {
    // 每次屏幕刷新时对场景进行绘制。(正常是60次/秒)。和setInterval对比，标签页切换到其他地方的时候渲染会暂停，降低能耗
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.line.rotation.x += 0.01;
    this.line.rotation.y += 0.01;

    this.attrs.targetRotation -= 0.01;

    if (this.textGroup.rotation) {
      this.textGroup.rotation.y +=
        (this.attrs.targetRotation - this.textGroup.rotation.y) * 0.05;
    }

    this.cylinderGroup.rotation.y += 0.005;

    this.linesGroup = [
      this.cylinderGroup.getObjectByName('linesGroupTop'),
      this.cylinderGroup.getObjectByName('linesGroupBottom'),
    ];

    if (
      this.linesGroup[0].position.y > 50 &&
      this.linesGroup[0].position.y + this.ySteps >
        this.linesGroup[0].position.y
    ) {
      this.ySteps = -0.5;
    } else if (
      this.linesGroup[0].position.y < -50 &&
      this.linesGroup[0].position.y + this.ySteps <
        this.linesGroup[0].position.y
    ) {
      this.ySteps = 0.5;
    }

    this.linesGroup[0].position.y += this.ySteps;
    this.linesGroup[1].position.y -= this.ySteps;

    if (this.progress < 1) {
      const point = this.curve.getPoint(this.progress);
      this.rollingCar.position.set(point.x, point.y, point.z);
      this.progress += 0.002;
    } else {
      this.progress = 0;
    }

    this.stars.position.x += 0.1;

    this.controls.update();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  };
}
