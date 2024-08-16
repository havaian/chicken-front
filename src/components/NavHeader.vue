<!-- src/components/NavHeader.vue -->
<template>
    <div class="nav">
      <nav>
        <router-link to="/tuxum">Tuxum narxi</router-link>
        <router-link to="/mijozlar">Mijozlar</router-link>
        <router-link to="/kuryerlar">Kuryerlar</router-link>
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
  export default {
    data() {
      return {
        username: 'Username Placeholder'
      };
    },
    methods: {
      logout() {
        // Handle logout logic here
        console.log('User logged out');
        localStorage.removeItem('username');
      
        // Remove isLoggedIn cookie
        document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        this.$router.push('/login'); // Redirect to login or home page
      }
    },
    mounted() {
      this.username = localStorage.getItem('username') || 'Username Placeholder';
    }
  }
</script>

<style scoped>
  .nav {
    width: 220px;
    height: 100%;
    background: #ffffff;
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    z-index: 1000;
  }
  
  header {
    background: #4a4a4a;
    color: #ffffff;
    padding: 12px 20px;
    height: 8vh;
    left: 0;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
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
    color: #ffffff;
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
    color: #555;
    border-radius: 6px;
    transition: background-color 0.3s, color 0.3s;
  }
  
  nav a:hover {
    background-color: #007bff;
    color: #ffffff;
  }
</style>
  