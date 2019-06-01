<template>
  <div id="app">
    <Home />
  </div>
</template>

<script>
import Home from './components/Home.vue'

export default {
  name: 'app',
  components: {
    Home
  }
}
</script>

<style>
@import './assets/css/spinner.css';

body {
  font-family: 'Tahoma';
  color: #001435;
}
</style>
