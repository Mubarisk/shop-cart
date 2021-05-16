var express = require("express");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
const userHelpers = require("../helpers/userHelpers");
var adminLoginHelper=require("../helpers/admin/adminLoginHelper")
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin/");
  }
};
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/admin-login", { admin: true });
});
router.get("/view", verifyLogin, (req, res) => {
  adminHelpers
    .listProduct()
    .then((products) => {
      //console.log(products);
      var adminDetails = req.session.admin;
      res.render("admin/admin-view-product", {
        products,
        admin: true,
        adminDetails,
      });
    })
    .catch(() => {
      console.log("list product error");
    });
});
router.post("/admin-signIn", (req, res) => {
  adminLoginHelper
    .doLogin(req.body)
    .then((status) => {
      req.session.loggedIn = true;
      req.session.admin = status;
      res.redirect("/admin/view");
    })
    .catch((err) => {
      res.render("user/login", { loginErr: true });
     
      req.session.loginErr = true;
    });
});
router.get("/admin-signup", (req, res) => {
  res.render("admin/admin-signup", { admin: true });
});
// router.post("/admin-register", (req, res) => {
//   // console.log(req.body)
//   adminHelpers
//     .doSignup(req.body)
//     .then((status) => {
//       req.session.loggedIn = true;
//       req.session.admin = status;
//       // let admin = req.session.admin;
//       console.log(user);

//       res.redirect("/admin/view");
//     })
//     .catch((err) => {
//       res.redirect("admin-signup");
//       req.session.loginErr = true;
//     });
// });
router.get("/add-product", (req, res) => {
  res.render("admin/add-product", { admin: true });
});
router.post("/add-product", verifyLogin, (req, res) => {
  //console.log(req.session.admin._id);
  var adminId = req.session.admin._id;
  // console.log(req.files.image);
  adminHelpers
    .addProduct(req.body, adminId)
    .then((id) => {
      let image = req.files.image;
      // console.log(id);
      image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
        if (!err) {
          res.redirect("/admin/view");
        } else {
          console.log(err);
        }
      });
    })
    .catch((err) => {
      console.log("err to upload");
    });
});
//   router.get("/logout", (req, res) => {
//     req.session.destroy();
//     res.redirect("/");
//   });
router.get("/delete-product/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  console.log("call for delete");

  adminHelpers
    .deleteProduct(proId)
    .then((response) => {
      res.redirect("/admin/view");
    })
    .catch(() => {
      res.send("delete fail");
    });
});
router.get("/edit-product/:id", verifyLogin, async (req, res) => {
  let product = await adminHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit", { admin: true, product });
});
router.post("/edit-product/:id", verifyLogin, (req, res) => {
  console.log(req.params.id);
  adminHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin/view");
    if (req.files.image) {
      let image = req.files.image;
      image.mv("./public/product-images/" + req.params.id + ".jpg");
    }
  });
});
router.get("/admin-logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/");
});
router.get("/orders", verifyLogin, (req, res) => {
  var adminDetails = req.session.admin;
  adminHelpers.getOrders().then((order) => {
    res.render("admin/order-view", { admin: true, order, adminDetails });
  });
});
router.get("/view-order-products/:id", verifyLogin, (req, res) => {
  // var itemId=[];
  adminHelpers.getOrderForView(req.params.id).then((data) => {
    //  var products=data[0].products
    //  for (var i = 0; i < products.length; i++) {
    //   itemId.push(products[i].item);
    // }
    // //  console.log(itemId);
    // userHelpers.getProducts(itemId).then((proData)=>{
    //   // console.log(proData);
    //   userHelpers.jsonMerger2(products,proData).then((cartData)=>{
    //     console.log(cartData);
    //   })
    // })
    var admin = req.session.admin;
    res.render("user/order-card", { data, admin });
  });
});
router.get("/shipped-order-products/:id", verifyLogin, (req, res) => {
  adminHelpers.shippProduct(req.params.id).then(() => {
    res.redirect('/admin/shipped-product')
  });
});
router.get('/shipped-product',verifyLogin,(req,res)=>{
  var admin=req.session.admin
  var adminDetails = req.session.admin;
  adminHelpers.getShippedProduct(admin._id).then((data)=>{
    // console.log(data);
    
    res.render('admin/shippment',{data,admin:true,adminDetails })
  })
  
})
module.exports = router;
