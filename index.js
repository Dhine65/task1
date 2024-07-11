const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const LoanuserRoute = require('./Routes/LoanUser');
const  helmet  = require('helmet');

const app = express();
app.use(helmet())
app.use(cors());
app.use(express.json());
app.use('/loan',LoanuserRoute)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('mongoose connection success');
  })
  .catch(e => {
    console.log('mongoose connection error', e);
  });
const PORT =process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
