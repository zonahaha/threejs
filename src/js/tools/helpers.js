import * as THREE from 'three';

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomColor(fixKey, value, type = 'THREE') {
  const r = fixKey === 'r' ? value : Math.floor(Math.random() * 256);
  const g = fixKey === 'g' ? value : Math.floor(Math.random() * 256);
  const b = fixKey === 'b' ? value : Math.floor(Math.random() * 256);
  if (type === 'THREE') {
    return new THREE.Color(r / 255, g / 255, b / 255);
  } else if (type === 'hex') {
    return (r << 16) | (g << 8) | b; // 返回数字格式的十六进制值
  } else {
    return `rgb(${r},${g},${b})`;
  }
}

export function createGradientTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; // 设置纹理宽度
  canvas.height = 64; // 设置纹理高度
  const context = canvas.getContext('2d');

  // 创建圆形
  const radius = 30; // 半径
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255, 255, 255, 1)'; // 星星颜色
  context.fill();
  context.closePath();

  // 创建透明背景
  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
  context.fill();
  context.closePath();

  // 将 Canvas 转换为纹理
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true; // 标记纹理需要更新
  return texture;
}
