import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './graphQLschema/index';
import jwtUtil from './util/jwt.util';
import 'babel-polyfill';

const app = express();

const PORT = process.env.PORT;

app.post('/graphql', jwtUtil.apiProtector, graphqlHTTP((request) => {
  const startTime = Date.now();
  return {
    schema: schema,
    graphiql: true,
    rootValue: { request },
    extensions(ext) {
      //console.log(ext.result);
      return { runTime: `${Date.now() - startTime}ms` };
    },
  };
}));

app.listen(PORT, () => {
  console.log(`Recbook api server listening on port ${PORT}!`);
});
