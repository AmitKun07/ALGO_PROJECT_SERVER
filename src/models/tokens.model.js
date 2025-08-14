import mongoose,{ Schema } from "mongoose";

const tokenSchema = new Schema({
    accessToken:{
        type:String,
    },
    uuid:{
        type:String
    },
    latestipaddress:{
        type:String
    },
    ipaddresses:[
        {
            ipaddress:{
                type:String
            }
        }
    ]
},{
    timestamps:true
}) 


export const Token = mongoose.model("Token", tokenSchema)
