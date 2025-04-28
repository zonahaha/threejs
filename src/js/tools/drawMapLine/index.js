import ChinaJson from '@/assets/mapJson/ChinaAndProvinces.json';
import ChinaFrameJson from '@/assets/mapJson/ChinaFrame.json';
import {
  Vector3,
  Object3D,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  Line,
  Spherical,
  Group,
  Points,
  CatmullRomCurve3,
  ShaderMaterial,
  BufferAttribute,
  AdditiveBlending,
  TextureLoader,
  SpriteMaterial,
  Sprite
} from 'three';
import { EarthConfig } from '@/constants';
import eearthGlow from '@/assets/edge.png'

export const createMapStroke = () => {
  const cityStroke = new Object3D();
  cityStroke.name = 'cityStroke';

  const lineMateria = new LineBasicMaterial({
    color: 0xf19553,
  });

  ChinaJson.features.forEach(el => {
    const province = new Group();
    province.name = el.properties.name;
    const coordinates = el.geometry.coordinates;
    coordinates.forEach(multiPolygon => {
      multiPolygon.forEach(polygon => {
        const line = createCityLine(polygon, lineMateria);
        province.add(line);
      });
    });
    cityStroke.add(province);
  });

  return cityStroke;
};

const createCityLine = (polygon, lineMateria) => {
  const positions = [];

  const lineGeometry = new BufferGeometry();
  polygon.forEach(latLng => {
    let pos = lglt2xyz(latLng[0], latLng[1]);
    positions.push(pos.x, pos.y, pos.z);
  });

  lineGeometry.setAttribute(
    'position',
    new Float32BufferAttribute(positions, 3)
  );

  return new Line(lineGeometry, lineMateria);
};

const lglt2xyz = (longitude, latitude) => {
  const theta = (90 + longitude) * (Math.PI / 180);
  const phi = (90 - latitude) * (Math.PI / 180);
  return new Vector3().setFromSpherical(
    new Spherical(EarthConfig.radius, phi, theta)
  );
};

export const createEarthOutline = () => {
  const map = new Object3D();

  ChinaFrameJson.features.forEach(el => {
    const province = new Object3D();
    const coordinates = el.geometry.coordinates;
    coordinates.forEach(multiPolygon => {
      multiPolygon.forEach(polygon => {
        if (polygon.length > 50) {
          let v3ps = [];
          polygon.forEach(latLng => {
            let pos = lglt2xyz(latLng[0], latLng[1]);
            v3ps.push(pos);
          });

          let curve = new CatmullRomCurve3(v3ps, false);
          let color = new Vector3(
            0.5999758518718452,
            0.7798940272761521,
            0.6181903838257632
          );
          let flyLine = initFlyLine(
            curve,
            {
              speed: 0.3,
              color: color,
              number: 3,
              length: 0.2,
              size: 3,
            },
            5000
          );
          province.add(flyLine);
        }
      });
    });
    map.add(province);
  });
  return map;
};

const initFlyLine = (curve, settings, pointsNumber) => {
  const points = curve.getPoints(pointsNumber);

  const geometry = new BufferGeometry().setFromPoints(points);
  const length = points.length;
  let percents = new Float32Array(length);
  points.forEach((el, i) => {
    percents[i] = i / length;
  });
  geometry.setAttribute('percent', new BufferAttribute(percents, 1));
  geometry.name = 'flyLineGeometry';

  const lineMaterial = initLineMaterial(settings);
  const flyLine = new Points(geometry, lineMaterial);
  return flyLine;
};



export const initLineMaterial = setting => {
  const number = setting ? Number(setting.number) || 1.0 : 1.0;
  const speed = setting ? Number(setting.speed) || 1.0 : 1.0;
  const length = setting ? Number(setting.length) || 0.5 : 0.5;
  const size = setting ? Number(setting.size) || 3.0 : 3.0;
  const color = setting ? setting.color || new Vector3(0, 1, 1)
    : new Vector3(0, 1, 1);

  const lineMaterial = new ShaderMaterial({
    uniforms: {
      time: { type: 'f', value: 0.0 },
      number: { type: 'f', value: number },
      speed: { type: 'f', value: speed },
      length: { type: 'f', value: length },
      size: { type: 'f', value: size },
      color: { type: "v3", value: color },
    },
    vertexShader: `
      varying vec2 vUv;
      attribute float percent;
      uniform float time;
      uniform float number;
      uniform float speed;
      uniform float length;
      varying float opacity;
      varying float vPercent; // 用于传递给片元着色器
      uniform float size;

      void main() {
          vUv = uv;
          vPercent = percent; // 将 percent 传递给片元着色器
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float l = clamp(1.0 - length, 0.0, 1.0);
          gl_PointSize = clamp(fract(percent * number + l - time * number * speed) - l, 0.0, 1.0) * size * (1.0 / length);
          opacity = gl_PointSize / size;
          gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying float opacity;
      uniform vec3 color;
      varying float vPercent; // 从顶点着色器接收的百分比

      void main() {
          if (opacity <= 0.2) {
              discard;
          }

          gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
    blending: AdditiveBlending,
  });

  return lineMaterial;
};

export const createEarthGlow = () => {

  const texture = new TextureLoader().load(eearthGlow);
  const material = new SpriteMaterial({
    map: texture, // 设置精灵纹理贴图
    color: 0x4390d1,
    transparent: true, //开启透明
    opacity: 1, // 可以通过透明度整体调节光圈
    depthWrite: false, //禁止写入深度缓冲区数据
    // depthTest: false
  })

  const mesh = new Sprite(material)
  // mesh.scale.set(EarthConfig.radius*3.75,EarthConfig.radius*3.75,1)
  return mesh
}