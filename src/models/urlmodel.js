const mongoose=require('mongoose')
const urlSchema=new mongoose.Schema(
{
    urlCode:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true
    },
    longUrl:{
        type:String,
        required:true,
        trim:true
    },
    shortUrl:{
        type:String,
        required:true


    },
}

)
module.exports=mongoose.model("urlSchema27",urlSchema)