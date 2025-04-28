/**
 * 清理Three.js资源
 * @param {Object} scene - Three.js场景对象
 * @param {Object} renderer - Three.js渲染器对象
 */
export const cleanupThreeJS = (scene, renderer) => {
  if (scene) {
    // 递归清理场景中的所有对象
    scene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => disposeMaterial(material));
        } else {
          disposeMaterial(object.material);
        }
      }
    });
    
    // 清空场景
    while(scene.children.length > 0) { 
      scene.remove(scene.children[0]); 
    }
  }
  
  // 清理渲染器
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
  }
};

/**
 * 清理材质资源
 * @param {Object} material - Three.js材质对象
 */
const disposeMaterial = (material) => {
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.envMap) material.envMap.dispose();
  
  material.dispose();
};

/**
 * 取消所有动画帧
 */
export const cancelAllAnimationFrames = () => {
  const id = window.requestAnimationFrame(function(){});
  for(let i = 0; i < id; i++) {
    window.cancelAnimationFrame(i);
  }
};