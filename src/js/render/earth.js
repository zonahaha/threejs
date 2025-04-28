/* eslint-disable no-unused-vars */
import { createElement } from '../tools/dom';
import tools from '../tools/scene';
import * as drawFn from '../tools/draw.js';
import { EarthConfig } from '@/constants'

export default class Earth {
  constructor(id) {
    this.id = id;
    this.attrs = {
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2,
      targetRotation: 0,
      targetRotationOnPointerDown: 0,
      pointerXOnPointerDown: 0,
    };
    this.dom = createElement(id,'',this.attrs);
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
    this.stars = '';

    this.progress = 0;
    this.direction = 0;
    this.earth = '';
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

    this.earth = drawFn.drawEarth(this.camera);
    this.scene.add(this.earth);

    // 渲染场景
    this.renderer.setAnimationLoop(this.renderFn);
  }

  renderFn = () => {
    // 每次屏幕刷新时对场景进行绘制。(正常是60次/秒)。和setInterval对比，标签页切换到其他地方的时候渲染会暂停，降低能耗
    this.stars.position.x += 0.1;

    const outline = this.earth.getObjectByName('outline');
    outline.children.forEach(province => {
      province.children.forEach(flyLine => {
        flyLine.material.uniforms.time.value += 0.007;
      });
    });

    // const glow = this.earth.getObjectByName('glow')
    // const earth = this.earth.getObjectByName('earth')
    // const value = EarthConfig.radius * 3.75 * Math.abs(this.camera.position.z) / 776
    // // console.log("earth.geometry.parameters.radius", value, Math.abs(this.camera.position.z / 776))

    // glow.scale.set(value, value, 1)
    // glow.size = glow.size * glow.scale
    // console.log(glow.scale)



    this.controls.update();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  };
}
