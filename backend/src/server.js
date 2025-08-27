const env = require('./config/env');
const app = require('./app');

app.listen(env.port, () => {
  console.log(`[API] http://localhost:${env.port}/api  (${env.nodeEnv})`);
});
