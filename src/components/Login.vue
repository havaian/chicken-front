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
import loginAxiosInstance from '../services/bot.axiosConfig';

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
    // this.checkLogin();
  },
  methods: {
    setCookie() {
      localStorage.setItem("isLoggedIn", "true")
    },

    getCookie(name) {
      return name == "true"
    },

    async login() {
      try {
        const response = await loginAxiosInstance.post('/data/login', 
          { username: this.username, password: this.password }
        );
        
        if (response.status === 200) {
          this.setCookie();
          // localStorage.setItem('username', this.username);
          // localStorage.setItem('authHash', authHash);
          this.$router.push('/inventory'); // Redirect to another page
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
      // const isLoggedIn = this.getCookie('isLoggedIn');
      // const storedUsername = localStorage.getItem('username');
      // this.isLoggedIn = (isLoggedIn === 'true' && storedUsername);
      // if (!this.isLoggedIn) {
      //   localStorage.removeItem('username');
      //   localStorage.removeItem('authHash');
      // }
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
    /* oveflow: hidden !important; */
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
  