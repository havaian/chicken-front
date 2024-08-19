<template>
  <div class="login-container">
    <div v-if="!isLoggedIn" id="login">
      <h2>Login</h2>
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button @click="login">Login</button>
      <p v-if="error" style="color: red;">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        username: '',
        password: '',
        error: false,
        errorMessage: '',
        isLoggedIn: false,
      };
    },
    created() {
      this.checkLogin();
    },
    methods: {
      setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value}; ${expires}; path=/`;
      },
      getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          let cookie = cookies[i];
          while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
          if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
        }
        return null;
      },
      async login() {
        try {
          const response = await fetch(`http://141.98.153.217:16005/data/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.username, password: this.password }),
          });
          
          if (response.ok) {
            this.setCookie('isLoggedIn', 'true', 1);
            localStorage.setItem('username', this.username);
            this.$router.push('/tuxum'); // Redirect to another page
          } else {
            this.error = true;
            this.errorMessage = 'Invalid username or password';
          }
        } catch (error) {
          console.error('Error logging in:', error);
          this.error = true;
          this.errorMessage = 'Error logging in. Please try again later.';
        }
      },
      checkLogin() {
        const isLoggedIn = this.getCookie('isLoggedIn');
        const storedUsername = localStorage.getItem('username');
        this.isLoggedIn = (isLoggedIn === 'true' || storedUsername);
        if (!isLoggedIn) {
          localStorage.removeItem('username');
        }
      },
    },
  };
</script>

<style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    z-index: 100000 !important;
    oveflow: hidden !important;
  }

  #login {
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    border: thin solid black;
    width: 300px;
  }
  
  #login h2 {
    color: #000;
    margin-bottom: 20px;
  }
  
  #login input {
    display: block;
    margin: 10px auto;
    padding: 10px;
    width: calc(100% - 22px);
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  #login button {
    background-color: #007bff;
    color: #fff;
    border: none;
    margin-top: 5%;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  #login button:hover {
    background-color: #0056b3;
  }
  
  #login p {
    margin-top: 10px;
  }
</style>
  