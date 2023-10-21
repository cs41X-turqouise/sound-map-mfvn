const { build, close } = require('./test/helper');

beforeAll(async () => {
  await build();
});

afterAll(() => {
  close();
});
