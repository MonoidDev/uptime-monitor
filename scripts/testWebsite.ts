import polka from 'polka';

const start = Date.now();

polka()
  .use((req, res, next) => {
    console.info(`[test-website] req ${req.url}`);
    next();
    console.info(`[test-website] res.statusCode = ${res.statusCode}`);
  })
  .get('/', (req, res) => {
    if (Date.now() - start > 10000) {
      res.statusCode = 500;
    }
    res.end(
      JSON.stringify({
        fuck: 'fuck',
      }),
    );
  })
  .listen(4545, () => {
    console.info(`[test-website] on http://localhost:4545/`);
  });
