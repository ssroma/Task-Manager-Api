const express = require('express');
const chalk = require('chalk');
require('./db/mongoose');


// Routers 
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(chalk.inverse.bold.green(`Server is running on PORT :: ${port}`));
});



