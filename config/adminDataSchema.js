const mongoose=require('mongoose');
const schema1=new mongoose.Schema({
    
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
   
},{collection:'admin'});
module.exports=mongoose.model('admin',schema1)