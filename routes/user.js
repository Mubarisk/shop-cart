var express = require("express");
var userHelpers = require("../helpers/userHelpers");
var userLoginHelper = require("../helpers/user/userLoginHelper");
var router = express.Router();
var adminHelpers = require("../helpers/adminHelpers");
// const session = require("express-session");
// var schema2 = require("../config/productDataSchema");
var total;
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", (req, res, next) => {
  var user = req.session.user;
  adminHelpers
    .listProduct()
    .then((products) => {
      res.render("user/view-product", { products, user });
    })
    .catch(() => {
      console.log("list product error");
    });
});
//rendering login page
router.get("/login", (req, res, next) => {
  res.render("user/login");
});
//login data from user
router.post("/signIn", (req, res) => {
  userLoginHelper
    .doLogin(req.body)
    .then((status) => {
      req.session.loggedIn = true;
      req.session.user = status;

      res.redirect("/");
    })
    .catch((err) => {
      res.render("user/login", { loginErr: true });

      req.session.loginErr = true;
    });
});
//sign up page render
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
//signup data from user
router.post("/register", (req, res) => {
  // console.log(req.body)
  userLoginHelper
    .doSignup(req.body)
    .then((status) => {
      req.session.loggedIn = true;
      req.session.user = status;
      let user = req.session.user;
      console.log(user);

      res.redirect("/");
    })
    .catch((err) => {
      res.redirect("/signup");
      req.session.loginErr = true;
    });
});
//cart item picker
router.get("/cart", verifyLogin, async (req, res) => {
  let user = req.session.user;
  var itemId = [];
  userHelpers
    .getCart(user._id)
    .then((product) => {
      for (var i = 0; i < product.length; i++) {
        itemId.push(product[i].item);
      }
      // console.log(itemId)
      userHelpers
        .cartProductView(itemId)
        .then((data) => {
          // console.log(product);
          //  console.log(data);
          userHelpers
            .jsonMerger(product, data)
            .then((DATA) => {
              //console.log(DATA);
              total = DATA.total;
              res.render("user/cart", { user, DATA, total });
            })
            .catch((err) => {
              res.send(err);
            });
        })
        .catch((err) => {
          res.send(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  let userId = req.session.user._id;
  userHelpers
    .addToCart(proId, userId)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.post("/qtyChanger", verifyLogin, async (req, res, next) => {
  userHelpers.changeQty(req.body).then((qtyData) => {
    res.json(qtyData);
  });
});
router.get("/remove-product/:cartID/item/:proId", (req, res) => {
  userHelpers.removeProductFromCart(req.params).then(() => {
    res.redirect("/cart");
  });
});
router.get("/address-panel", verifyLogin, (req, res) => {
  let user = req.session.user;
  res.render("user/address", { user, total });
});
router.post("/place-order", verifyLogin, async (req, res) => {
  //  console.log(req.body)
  var products = await userHelpers.getProductList(req.body.userId);
  userHelpers.placeOrder(req.body, products).then((orderId) => {
    if (req.body.payment == "cod") {
      res.json({ codSuccess: true });
    } else {
      userHelpers.razorPayMethod(orderId, req.body.total).then((response) => {
        res.json(response);
      });
    }
  });
});
router.get("/order-success", (req, res) => {
  res.render("user/success", { user: req.session.user });
});
router.get("/view-order", verifyLogin, (req, res) => {
  var user = req.session.user;
  userHelpers.getOrders(user._id).then(async (order) => {
    await res.render("user/orders", { user, order });
  });
});
router.get("/view-order-products/:id", verifyLogin, (req, res) => {
  // var itemId=[];
  userHelpers.getOrderForView(req.params.id).then((data) => {
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
    var user = req.session.user;
    res.render("user/order-card", { data, user });
  });
});
router.get("/shipped-product", verifyLogin, (req, res) => {
  var user = req.session.user;
  userHelpers.getShippedProduct(user._id).then((data) => {
    // console.log(data);

    res.render("user/shippment", { data, user });
  });
});
router.post("/verify-payment", verifyLogin, (req, res) => {
  console.log(req.body);
  userHelpers
    .veryfyPayment(req.body)
    .then((response) => {
      userHelpers.changePaymentstatus(req.body["order[receipt]"]).then(() => {
        console.log("perfect");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});
module.exports = router;
