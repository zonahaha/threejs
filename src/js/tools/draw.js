import * as THREE from 'three'
import logo from '../../../src/assets/header.png'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


export function drawCube() {
    const texture = new THREE.TextureLoader().load(logo)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)

    // 创建立方体
    const geometry = new THREE.BoxGeometry(30, 30, 30)
    // 几何体的材质
    const material = new THREE.MeshBasicMaterial({ map: texture })
    // mesh网格
    return new THREE.Mesh(geometry, material)
}

export function drawLine() {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 20 })
    const points = [];
    const numPoints = 150; // 线段的点数
    const amplitude = 2; // 振幅

    for (let i = 0; i <= numPoints; i++) {
        const x = (i / numPoints) * 10 - 5; // 横向范围
        const y = Math.sin(x) * amplitude;   // 使用正弦函数生成波动
        const z = 0; // 保持在 Z=0 平面
        points.push(new THREE.Vector3(x, y, z));
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    return new THREE.Line(lineGeometry, lineMaterial)
}

export function drawText() {
    const text = 'Three.js'
    const fontLoader = new FontLoader()
    const depth = 20
    const hover = 30
    const size = 70

    return new Promise(resolve => {
        fontLoader.load(`fonts/${getRandomInt(1, 3)}.json`, (font) => {
            const textGeo = new TextGeometry(text, {
                font: font,
                size: size,
                depth: depth,
                curveSegments: 4,
                bevelEnabled: true,
                bevelThickness: 2,
                bevelSize: 1.5,
            });
            textGeo.computeBoundingBox()

            const textMaterial = [
                new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
                new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
            ];
            const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
            const textMesh = new THREE.Mesh(textGeo, textMaterial);
            textMesh.position.set(centerOffset, hover, 0)
            textMesh.rotation.x = 0;
            textMesh.rotation.y = Math.PI * 2;

            const textMesh2 = new THREE.Mesh(textGeo, textMaterial);
            textMesh2.position.set(centerOffset, -hover, depth)

            textMesh2.rotation.x = Math.PI;
            textMesh2.rotation.y = Math.PI * 2;

            textMesh.castShadow = true
            textMesh.receiveShadow = true

            resolve([textMesh, textMesh2])
        })
    })

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
