<template>
  <div id="app">
    <div class="container">
      <div class="sidebar">
        <h2>3D组件导航</h2>
        <ul class="menu">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            :class="{ active: currentComponent === item.component }"
            @click="switchComponent(item.component)"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <div class="content" ref="contentContainer">
        <!-- 3D内容将在这里渲染 -->
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import ThreeJs from './js/render/ThreeJs';
import Earth from './js/render/earth';
import { initMap } from './js/render/flatMap';
import { initMap3D } from './js/render/china3D';
import { initGame } from './js/render/game';
import { initLightning } from './js/render/lighting';
import { initDepart } from './js/render/depart';
import { initCursor } from './js/render/cursor';

export default {
  name: 'App',
  data() {
    return {
      currentComponent: null,
      menuItems: [
        { name: '平面地图', component: 'flatMap' },
        { name: '3D中国地图', component: 'china3D' },
        { name: '跑酷游戏', component: 'game' },
        { name: '发光效果', component: 'lightning' },
        { name: '多元素渐变', component: 'depart' },
        { name: '光标效果', component: 'cursor' },
        { name: '基本图形', component: 'ThreeJs' },
        { name: '地球', component: 'earth' },
      ],
    };
  },
  methods: {
    switchComponent(componentName) {
      // 如果当前已有组件，需要先清理
      this.cleanupCurrentComponent();

      // 设置当前组件
      this.currentComponent = componentName;

      // 创建新的容器
      const container = document.createElement('div');
      container.id = componentName + 'Container';
      container.style.width = '100%';
      container.style.height = '100%';

      // 清空内容区域并添加新容器
      this.$refs.contentContainer.innerHTML = '';
      this.$refs.contentContainer.appendChild(container);

      // 初始化对应的3D组件
      this.initComponent(componentName);
    },

    initComponent(componentName) {
      // 根据组件名称初始化对应的3D组件
      switch (componentName) {
        case 'flatMap':
          initMap();
          break;
        case 'china3D':
          initMap3D();
          break;
        case 'game':
          initGame();
          break;
        case 'lightning':
          initLightning();
          break;
        case 'depart':
          initDepart();
          break;
        case 'cursor':
          initCursor();
          break;
        case 'ThreeJs': {
          const three = new ThreeJs('ThreeJsContainer');
          three.initTree();
          break;
        }
        case 'earth': {
          const earth = new Earth('earthContainer');
          earth.initTree();
          break;
        }
      }
    },

    cleanupCurrentComponent() {
      // 清理当前组件的资源
      if (this.currentComponent) {
        // 移除所有three.js相关的canvas和DOM元素
        console.log('cleanupCurrentComponent', this.currentComponent);
        const elements = document.querySelectorAll(
          `canvas, #${this.currentComponent}Container`
        );
        elements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });

        // 取消动画帧
        if (window.cancelAnimationFrame) {
          let id = window.requestAnimationFrame(function () {});
          while (id--) {
            window.cancelAnimationFrame(id);
          }
        }
      }
    },
  },
  mounted() {
    // 默认显示第一个组件
    if (this.menuItems.length > 0) {
      this.switchComponent(this.menuItems[0].component);
    }
  },
  beforeDestroy() {
    // 组件销毁前清理资源
    this.cleanupCurrentComponent();
  },
};
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei',
    Arial, sans-serif;
  height: 100vh;
  margin: 0;
  padding: 0;
  color: #333;
  background-color: #f5f7fa;
}

.container {
  display: flex;
  height: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.sidebar {
  width: 220px;
  background-color: #fff;
  color: #606266;
  padding: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.sidebar h2 {
  text-align: center;
  margin: 0;
  padding: 20px 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  background-color: #f8f9fb;
  border-bottom: 1px solid #ebeef5;
  letter-spacing: 1px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.menu li {
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
}

.menu li:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.menu li.active {
  background-color: #ecf5ff;
  color: #409eff;
  border-left: 3px solid #409eff;
  font-weight: 500;
}

.content {
  flex: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  border-radius: 0 0 0 8px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* 为3D内容容器添加样式 */
.content > div {
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条 */
.menu::-webkit-scrollbar {
  width: 6px;
}

.menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.menu::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }
}
</style>
