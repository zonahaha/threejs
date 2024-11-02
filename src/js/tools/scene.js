import * as THREE from 'three'

export default {
    renderAndCamera: () => {
        // 渲染器
        // const render = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        const render = new THREE.WebGLRenderer({ antialias: true })

        render.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(render.domElement)

        // 透视摄像机PerspectiveCamera，视野角度，长宽比，近截面，远截面
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500)
        camera.position.set(0, 400, 700)
        const cameraTarget = new THREE.Vector3(0, 150, 0)
        camera.lookAt(cameraTarget)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x000000)
        scene.fog = new THREE.Fog(0x000000, 250, 1400)


        // LIGHTS

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(0, 0, 1).normalize();
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xaafcdf, 4.5, 0, 0);
        pointLight.color.setHSL(Math.random(), 1, 0.5);
        pointLight.position.set(0, 100, 90);
        scene.add(pointLight);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.MeshBasicMaterial({ color: 0xaaffcf, opacity: 0.5, transparent: true })
        );
        plane.position.y = 100;
        plane.rotation.x = - Math.PI / 2;
        scene.add(plane);

        const group = new THREE.Group();
        group.position.y = 100;
        scene.add(group);

        return {
            render,
            camera,
            scene,
            group
        }
    }
}