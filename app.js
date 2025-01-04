const connectDB = require('./config/db')
const userRouter = require("./routes/UserRoute")

const express = require("express")



const app = express();
connectDB();

app.use(express.json());

app.use("/api/user", userRouter);


const port = 3000;
app.listen(port, () => {
    console.log('app running at http://localhost: ${port}');
});