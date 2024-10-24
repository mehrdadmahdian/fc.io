<template>
  <div id="app">
    <h1>Hello Vue.js with Bootstrap!</h1>
    <HelloWorld msg="Welcome to Vue.js with Bootstrap" />
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld
  }
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 50px;
}
</style>