<header>
  <span><a href="/">5SG</a></span>
  <nav>
    <!-- we could reference the slugs like this-->
    <!-- 
      <ul>
        <li><a href="index.svelte">home</a></li>
        <li><a href="blog-page-1.dynamic">blog</a></li>
        <li><a href="tag-page.dynamic">tags</a></li>
        <li><a href="categories-page.dynamic">categories</a></li>
      </ul> -->
    <!-- or the final paths like this-->
    <ul>
      <li><a href="/blog/">blog</a></li>
    </ul>
  </nav>
</header>

<style>
  header {
    width: 100%;
    display: flex;
    flex-direction: row;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
    position: sticky;
    top: 0;
    background: var(--bg);
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 1;
  }
  header > * {
    flex: 0;
    padding: 16px 0;
  }

  header > span {
    flex-basis: 120px;
    font-family: monospace;
    font-size: 2rem;
    line-height: 1;
  }

  header > span > a {
    color: var(--primary);
  }

  header > nav {
    flex-grow: 1;
  }
  nav ul {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  nav ul li {
    list-style: none;
    padding: 0 10px;
  }
</style>
