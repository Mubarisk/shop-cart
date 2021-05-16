// var schema = require("../config/userDataSchema");
var schema3 = require("../config/cartDataSchema");
var schema2 = require("../config/productDataSchema");
// var bcrypt = require("bcrypt");
var schema4 = require("../config/orderDataSchema");
var schema5 = require("../config/shippedDataSchema");
var Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_NW4084buI9Va5s",
  key_secret: "j7Xi1qgopUIUiTVX3ZYnTKuI",
});
module.exports = {
  addToCart: (proId, userId) => {
    let proObj = {
      item: proId,
      qty: Number(1),
    };
    return new Promise(async (resolve, reject) => {
      let cartUser = await schema3.findOne({ userId: userId });
      if (cartUser) {
        var proExist = cartUser.products.findIndex(
          (product) => product.item == proId
        );
        // console.log(proExist);
        if (proExist != -1) {
          schema3
            .findOneAndUpdate(
              { userId: userId, "products.item": proId },
              {
                $inc: { "products.$.qty": 1 },
              }
            )
            .then((ok) => {
              console.log(ok);
              resolve(ok);
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        } else {
          schema3
            .findOneAndUpdate(
              { userId: userId },
              {
                $push: { products: proObj },
              }
            )
            .then((ok) => {
              console.log(ok);
              resolve(ok);
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        }
      } else {
        var cartPass = new schema3({
          userId: userId,
          products: [proObj],
        });
        cartPass
          .save()
          .then((success) => {
            resolve(success);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  },
  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      var cartProduct = await schema3.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            qty: "$products.qty",
          },
        },
        // {
        //   $lookup: {
        //    from :'product',
        //     localField: "item",
        //     foreignField: "_id",
        //     as: "products",
        //   },
        // },
      ]);
      resolve(cartProduct);
      // console.log(cartProduct);
    });
  },
  cartProductView: (itemId) => {
    return new Promise(async (resolve, reject) => {
      const records = await schema2.find({ _id: { $in: itemId } });
      if (records) {
        resolve(records);
      } else {
        reject();
      }
    });
  },
  jsonMerger: (cartDetails, products) => {
    return new Promise((resolve, reject) => {
      var total = 0;
      for (var i = 0; i < cartDetails.length; i++) {
        for (var j = 0; j < products.length; j++) {
          if (cartDetails[i].item == products[j]._id) {
            var pro = products[j];
            total = total + cartDetails[i].qty * pro.price;
            cartDetails[i].pro = pro;
          }
        }
      }
      cartDetails.total = total;

      resolve(cartDetails);
    });
  },
  changeQty: (req) => {
    return new Promise(async (resolve, reject) => {
      if (req.presentQty == 1 && req.qty == -1) {
        schema3
          .findOneAndUpdate(
            { _id: req.cartId },
            {
              $pull: { products: { item: req.itemId } },
            }
          )
          .then((ok) => {
             console.log("it happen");
            resolve(ok);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      } else {
        schema3
          .findOneAndUpdate(
            { _id: req.cartId, "products.item": req.itemId },
            {
              $inc: { "products.$.qty": req.qty },
            }
          )
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      }
    });
  },
  removeProductFromCart: (req) => {
    return new Promise(async (resolve, reject) => {
      // console.log(req)
      schema3
        .findOneAndUpdate(
          { _id: req.cartID },
          {
            $pull: { products: { item: req.proId } },
          }
        )
        .then((ok) => {
          // console.log(ok);
          resolve(ok);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  },
  placeOrder: (order, products) => {
    return new Promise(async (resolve, reject) => {
      // console.log(order,products);
      let orderStatus = order.payment == "cod" ? "placed" : "pending";

      var datapass = new schema4({
        delivery: {
          address: order.address,
          phone: order.mobile,
          pincode: order.pincode,
        },
        userId: order.userId,
        paymentMethod: order.payment,
        products: products,
        status: orderStatus,
        total: order.total,
      });
      datapass
        .save()
        .then(async (response) => {
          //removing the cart after placing the order
          // console.log(response);
          await schema3.findOneAndDelete({ userId: order.userId }).then(() => {
            resolve(response._id);
          });
        })
        .catch((err) => {});
    });
  },
  getProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let product = await schema3.findOne({ userId: userId });
      // console.log(product.products);
      resolve(product.products);
    });
  },
  getOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await schema4.find({ userId: userId });
      // console.log(orders);
      resolve(orders);
    });
  },
  getOrderForView: (orderId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await schema4.find({ _id: orderId });
      // console.log(orders);
      resolve(orders[0].products);
    });
  },
 
  getShippedProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      var data = await schema5.find({ userId: id });
      // console.log(data)
      resolve(data);
    });
  },
  razorPayMethod: (orderid, cash) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: cash * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderid,
      };
      instance.orders.create(options, function (err, order) {
        console.log(order);
        resolve(order);
      });
    });
  },
  veryfyPayment: (data) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "j7Xi1qgopUIUiTVX3ZYnTKuI");
      // console.log( data["response[razorpay_order_id]"],data["response[razorpay_payment_id]"],data["response[razorpay_signature]"])
      hmac.update(
        data["response[razorpay_order_id]"] +
          "|" +
          data["response[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == data["response[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  changePaymentstatus: (orderId) => {
    return new Promise((resolve, reject) => {
      // console.log(orderId);
      schema4
        .findByIdAndUpdate(orderId, { status: "placed" })
        .then((success) => {
          resolve(success);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  
};
