const mongoose=require('mongoose');
const schema3=new mongoose.Schema({
    userId:{
        type:String,
        require:true
    },
    products:[{
      item:{type:String},
      qty:{type:Number}
  }]
   
},{collection:'cart'});
module.exports=mongoose.model('cart',schema3)