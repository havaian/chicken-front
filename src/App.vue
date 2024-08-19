<template>
  <div id="content-wrapper">
    <NavHeader v-if="!isLoginRoute" />
    <div id="app-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavHeader from './components/NavHeader.vue';

export default {
  name: 'App',
  components: {
    NavHeader
  },
  setup() {
    const route = useRoute();
    
    const isLoginRoute = computed(() => {
      return route.name === 'login' || route.path === '/login';
    });

    return {
      isLoginRoute
    };
  }
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
  background-color: #fff;
}
</style>