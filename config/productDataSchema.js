const mongoose=require('mongoose');
const schema2=new mongoose.Schema({
    adminId:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    price:{
        type:String,
        require:true
    },
   
},{collection:'product'});
module.exports=mongoose.model('product',schema2)