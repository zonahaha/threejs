<template>
  <div id="app">
  </div>
</template>

<script>
import ThreeJs from "./js/ThreeJs"
export default {
  name: "App",
  created(){
    const three  = new ThreeJs('threejs')
    three.initTree()
  }
};
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  left:0;
  top:0;
  right: 0;
  bottom: 0; */
}
</style>
