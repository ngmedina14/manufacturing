const express = require('express');
const app = express();// Instantiate Express JS to a variable
const port = 3001



//app.use is a middleware
app.set('view engine','hbs');// render hbs views
app.use(express.urlencoded({extended:true}))
app.use(express.json());// Prerequisite for express JS

// To Routes
// app.use('/',require('./routes/PageRoutes'));// Pages
app.use('/auth',require('./routes/Auth'));// All database related api


app.listen(port,()=>{
    console.log("Server Started http://localhost:"+port)
})