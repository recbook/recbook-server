import 'babel-polyfill';

import express from 'express';
import graphqlHTTP from 'express-graphql';
import logger from 'winston';

import elasticsearch from './util/elasticsearch.util';
import jwtUtil from './util/jwt.util';
import schema from './graphQLschema/index';

const app = express();
const PORT = process.env.PORT;

elasticsearch.client.ping({
  requestTimeout: 3000
}, (error) => {
  if (error) {
    console.trace('Recbook ES is down. Please check status.');
  } else {
    logger.info('Recbook ES is ready!');
    elasticsearch.startIndexing();
  }
});

app.post('/graphql', jwtUtil.apiProtector, graphqlHTTP((request) => {
  const startTime = Date.now();
  return {
    schema: schema,
    graphiql: true,
    rootValue: { request },
    extensions(ext) {
      // TODO : Find why `logger.debug(ext.result)` doesn't work on this part.
      // logger.debug(ext.result);
      console.log(ext.result);
      return { runTime: `${Date.now() - startTime}ms` };
    }
  };
}));

app.listen(PORT, () => {
  logger.info(`Recbook api server listening on port ${PORT}!`);
});


