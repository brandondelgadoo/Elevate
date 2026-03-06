document.addEventListener("DOMContentLoaded", () => {
  const navbarMount = document.getElementById("site-navbar");
  if (!navbarMount) return;

  navbarMount.innerHTML = `
    <div class="navbar">
      <h1 class="logo"><a href="index.html">Elevate 🌎</a></h1>
      <nav>
        <ul class="nav-links">
          <li><a href="about.html">About</a></li>
          <li><a href="explore.html">Explore</a></li>
          <li><a href="teach.html">Teach</a></li>
          <li><a href="login.html" class="btn-primary">Login</a></li>
        </ul>
      </nav>
    </div>
  `;
});
