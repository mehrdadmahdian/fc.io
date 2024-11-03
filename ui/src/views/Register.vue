<template>
    <div class="register d-flex justify-content-center align-items-center vh-100">
      <form @submit.prevent="register" class="border p-4 rounded bg-light">
        <h2 class="mb-4">Register</h2>
        <div class="mb-3">
          <input type="text" v-model="name" class="form-control" placeholder="Name" required />
        </div>
        <div class="mb-3">
          <input type="email" v-model="email" class="form-control" placeholder="Email" required />
        </div>
        <div class="mb-3">
          <input type="password" v-model="password" class="form-control" placeholder="Password" required />
        </div>
        <button type="submit" class="btn btn-success">Register</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const name = ref('');
  const email = ref('');
  const password = ref('');
  
  const register = () => {
    alert(`Registering ${name.value}`);
  };
  </script>
  
  <style>
  .register {
    max-width: 400px;
    margin: auto;
  }
  </style>