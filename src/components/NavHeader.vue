<!-- src/components/NavHeader.vue -->
<template>
    <div class="nav">
      <nav>
        <router-link to="/tuxum" :class="{ active: isActive('/tuxum') }">Tuxum narxi</router-link>
        <router-link to="/mijozlar" :class="{ active: isActive('/mijozlar') }">Mijozlar</router-link>
        <router-link to="/kuryerlar" :class="{ active: isActive('/kuryerlar') }">Kuryerlar</router-link>
        <router-link to="/solishtirish" :class="{ active: isActive('/solishtirish') }">Solishtirish</router-link>
        <router-link to="/excel-olish" :class="{ active: isActive('/excel-olish') }">Excel Olish</router-link>
        <router-link to="/excel-yuklash" :class="{ active: isActive('/excel-yuklash') }">Excel Yuklash</router-link>
      </nav>
  
      <header>
        <div id="user-info">
          <span id="username-placeholder">{{ username }}</span>
          <button id="logout" @click="logout">Chiqish</button>
        </div>
      </header>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const username = ref('Username Placeholder');
    const route = useRoute();
    const router = useRouter();

    const isActive = (path) => {
      return route.path === path;
    };

    const logout = () => {
      console.log('User logged out');
      localStorage.removeItem('username');
      document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    };

    onMounted(() => {
      username.value = localStorage.getItem('username') || 'username';
    });

    return {
      username,
      logout,
      isActive
    };
  }
};
</script>

<style scoped>
  .nav {
    width: 220px;
    height: 100%;
    background: #fff;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    border-right: thin solid #aaa;
    padding-top: 20px;
    z-index: 1000;
  }
  
  header {
    background: #4a4a4a;
    color: #fff;
    padding: 12px 20px;
    height: 8vh;
    left: 0;
    position: relative;
  }
  
  #user-info {
    display: flex;
    justify-content: space-between;
  }
  
  #username-placeholder {
    margin-right: 20px;
    font-size: 16px;
  }
  
  #logout {
    background-color: #ff6f6f;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }
  
  #logout:hover {
    background-color: #e74c3c;
  }
  
  nav {
    position: relative;
    padding: 0 20px;
    flex-grow: 1;
  }
  
  nav a {
    display: block;
    padding: 12px;
    margin-bottom: 12px;
    text-decoration: none;
    color: #000;
    border-radius: 6px;
    border: 3px solid transparent;
    transition: border 0.3s, color 0.3s;
  }
  
  nav a:hover {
    border: 3px solid #007bff;
    transition: border 0.3s, color 0.3s;
  }
  
  nav a.active {
    border: 3px solid #007bff;
    background: #007bff;
    color: #fff;
  }
</style>
  