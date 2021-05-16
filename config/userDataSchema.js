const mongoose=require('mongoose');
const schema=new mongoose.Schema({
    
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    
    Date:{
        type:Date,
        default:Date.now
    }
},{collection:'user'});
module.exports=mongoose.model('shop-cart',schema)