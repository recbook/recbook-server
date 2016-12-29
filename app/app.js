import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || config.PORT;
app.listen(port, () =>{
  console.log(`Recbook listening on port ${port}!`);
});
