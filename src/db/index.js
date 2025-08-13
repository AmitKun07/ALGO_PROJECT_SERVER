import mongoose from "mongoose"
import { DBName } from "../constants.js";
    
    
    const connectDB = async () =>{
        try {
            const connectInstance = await mongoose.connect(`${process.env.MONGO_URI}${DBName}`)
            console.log(`MongoDB Connected !! DB host : ${connectInstance.connection.host}`); 
        }
        catch(error){
            console.log("Error: "+ error)
            process.exit(1)
        }
    }
    
    
    export default connectDB
