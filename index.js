import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import {app} from "./app.js";


connectDB()
.then(()=>{
 app.listen(process.env.PORT || 4000, ()=>{
          console.log(`server is connected to port ${process.env.PORT || 4000}`)
    })
 .catch((err)=>{
   console.log("error while connecting to server", err)
    })

})