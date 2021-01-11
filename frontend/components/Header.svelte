<style>
  header {
    width: 100%;
    display: flex;
    flex-direction: row;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
    position: sticky;
    top: 0;
    background: white;
    align-items: baseline;
    padding: 0 20px;
    box-sizing: border-box;
  }
  header > * {
    flex: 0;
    padding: 20px 0;
  }

  header > span {
    flex-basis: 120px;
    text-align: center;
    font-family: monospace;
    font-size: 2rem;
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

<header>
  <span><a href="index.svelte">My site</a></span>
  <nav>
    <ul>
      <li><a href="index.svelte">home</a></li>
    </ul>
  </nav>
</header>
