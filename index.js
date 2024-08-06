const connectDB = require('./src/db/connect');
const express = require('express');
const postosRouter = require('./src/routes/postos');

connectDB();

const app = express();
app.use(express.json()); 
app.use('/postos', postosRouter);

const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});