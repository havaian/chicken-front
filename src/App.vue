<template>
  <div id="content-wrapper">
    <NavHeader />
    <div id="app-container">
      <router-view></router-view>
    </div>
    </div>
</template>

<script>
import NavHeader from './components/NavHeader.vue'; // Import the NavHeader component
export default {
  name: 'App',
  components: {
    NavHeader
  },
};
</script>

<style>
#content-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: inline-grid;
}

#app-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
