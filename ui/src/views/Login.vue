<template>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white text-center">
              <h4>Login to Your Account</h4>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input type="email" class="form-control" id="email" v-model="email" required>
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input type="password" class="form-control" id="password" v-model="password" required>
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                  <label class="form-check-label" for="rememberMe">Remember me</label>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
              </form>
            </div>
            <div class="card-footer text-center">
              <p class="mb-0">Don't have an account? <router-link to="/register" class="text-primary">Register here</router-link></p>
              <p class="mb-0"><router-link to="/forgot-password" class="text-primary">Forgot Password?</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
        rememberMe: false,
      };
    },
    methods: {
      handleSubmit() {
        // Handle the login logic here
        alert(`Email: ${this.email}\nPassword: ${this.password}\nRemember Me: ${this.rememberMe}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .card {
    border-radius: 10px;
  }
  
  .card-header {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  
  .card-footer {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  
  .form-check-label {
    margin-left: 5px;
  }
  </style>
  