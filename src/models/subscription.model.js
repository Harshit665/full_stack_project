import mongoose,{mongoose, Schema} from "mongoose";

const subscriptionSchema = new Schema({

    subscriber:{
        type: Schema.Types.ObjectId, // the one who is subscribing 
        ref:"User"
    },
    channels:{
        type: Schema.Types.ObjectId, // one to whom the subscriber is subscriber
        ref:"User"
    }

},{timestamps:true})

export const subscription = mongoose.model("subscriptionSchema" , subscriptionSchema)