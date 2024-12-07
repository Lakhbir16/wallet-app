const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const userRouter = require('./routes/userRouter.js')
const transectionRouter =require('./routes/transection.js')
var bodyParser = require('body-parser')


// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(bodyParser.json());



app.use('/api/v1',userRouter);
app.use('/api/transection',transectionRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})


