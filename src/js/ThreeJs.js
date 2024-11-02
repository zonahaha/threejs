import * as THREE from 'three'
import { createElement } from './tools/dom'
import tools from './tools/scene'
import { drawCube, drawLine, drawText } from './tools/draw.js';

export default class ThreeJs {
    constructor(id) {
        this.id = id;
        this.attrs = {
            windowHalfX: window.innerWidth / 2,
            windowHalfY: window.innerHeight / 2,
            targetRotation: 0,
            targetRotationOnPointerDown: 0,
            pointerXOnPointerDown: 0,
        }
        this.dom = createElement(id, this.attrs);
        this.cube = ''
        this.renderer = ''
        this.line = ''
        this.text = ''
        this.group = ''

    }


    initTree() {
        const { render, camera, scene, group } = tools.renderAndCamera()

        this.scene = scene
        this.renderer = render
        this.camera = camera
        this.group = group

        this.dom.appendChild(this.renderer.domElement)

        this.cube = drawCube();
        this.scene.add(this.cube)

        this.line = drawLine()
        this.scene.add(this.line)

        drawText().then((textList) => {
            this.text = textList
            this.text.forEach((el) => this.group.add(el))
        })


        // 渲染场景
        this.renderer.setAnimationLoop(this.renderFn);

    }


    renderFn = () => {
        // 每次屏幕刷新时对场景进行绘制。(正常是60次/秒)。和setInterval对比，标签页切换到其他地方的时候渲染会暂停，降低能耗
        this.cube.rotation.x += 0.01
        this.cube.rotation.y += 0.01

        this.line.rotation.x += 0.01
        this.line.rotation.y += 0.01

        this.attrs.targetRotation -= 0.01

        this.group.rotation.y += (this.attrs.targetRotation - this.group.rotation.y) * 0.05

        this.camera.lookAt(new THREE.Vector3(0, 150, 0))

        this.renderer.clear()
        this.renderer.render(this.scene, this.camera)

    }
}

