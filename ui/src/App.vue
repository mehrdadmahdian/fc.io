<template>
  <div id="app" class="d-flex flex-column min-vh-100"> <!-- Use Flexbox for the entire app -->
    <header class="bg-light">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <router-link to="/" class="navbar-brand">Home</router-link>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto"> <!-- Added ms-auto to push Login to the left -->
              <li class="nav-item">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    
    <main class="container my-4 flex-grow-1"> <!-- Allow main to grow and take space -->
      <router-view />
    </main>
    
    <footer class="text-center mt-4">
      <p>&copy; 2024 Vue.js App</p>
    </footer>
  </div>
</template>

<style>
footer {
  padding: 10px;
  background: #f3f3f3;
}
</style>