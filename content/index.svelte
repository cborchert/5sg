<script>
  import Page from '../src/client/components/Page.svelte';
  export const name = 'world';
  export let siteMetadata = {};

  const meta = { title: 'Home', description: 'Home page', siteMetadata };
</script>

<Page {meta}>
  <div slot="beforeContent">
    <section>
      <div>
        <div class="intro">
          <h1>Hello, {name}!</h1>
          <h5>Welcome to the demo site for <a href="https://github.com/cborchert/5sg">5SG</a></h5>
        </div>
        <p>
          5sg stands for <strong>s</strong>tupid <strong>s</strong>imple <strong>s</strong>velte <strong>s</strong>tatic
          <strong>s</strong>ite <strong>g</strong>enerator, an ssg in the making which focuses on ease of development,
          simplicity of structure, and speed of delivery. The name will probably change.
        </p>
        <p>This site took 30 seconds to build on netlify, including:</p>
        <ul>
          <li>
            <strong>1000</strong> interlinked blog pages with dynamically inserted sibling and category/tag navigation
          </li>
          <li>
            <strong>~ 220</strong> dynamically generated <a href="/blog">blogfeed</a>,
            <a href="/blog/categories">category</a>, and <a href="/blog/tags">tags</a> pages
          </li>
          <li>and the conversion of <strong>100</strong> high quality (but too large) images to sanely sized files.</li>
        </ul>
        <p>We also have an example of an <a href="hydrated.svelte">interactive page</a> for you to check out</p>
        <p>Take some time to explore, we'll see you again soon. 👋</p>
      </div>
    </section>
  </div>
</Page>

<style>
  section {
    height: 80vh;
    display: grid;
    justify-content: center;
    align-items: center;
  }
  .intro {
    font-size: 2.5rem;
    margin-bottom: 64px;
  }
  h1 {
    line-height: 1;
    margin-bottom: 16px;
  }
</style>
