var schema2 = require("../config/productDataSchema");
var schema4 = require("../config/orderDataSchema");
var schema5 = require("../config/shippedDataSchema");
module.exports = {
  addProduct: (data, adminId) => {
    return new Promise((resolve, reject) => {
      //console.log(adminId);
      var datapass = new schema2({
        id: adminId,
        name: data.name,
        category: data.category,
        price: data.price,
      });
      datapass
        .save()
        .then((status) => {
          resolve(status._id);
          // console.log(status);
        })
        .catch((err) => {
          reject(err);
          console.log("err to upload ");
        });
    });
  },
  listProduct: () => {
    return new Promise(async (resolve, reject) => {
      var products = await schema2.find();
      //console.log(products);
      resolve(products);
    });
  },
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      schema2
        .findByIdAndDelete(id)
        .then(() => {
          resolve(" delete success");
          consol.log("delete success");
        })
        .catch((err) => {
          resolve(err);
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      schema2
        .findByIdAndUpdate(proId, {
          name: proDetails.name,
          category: proDetails.category,
          price: proDetails.price,
        })

        .then((response) => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getProductDetails: (id) => {
    return new Promise((resolve, reject) => {
      schema2
        .findById(id)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getOrders: () => {
    return new Promise(async (resolve, reject) => {
      var orders = await schema4.find();
      // console.log(orders);
      resolve(orders);
    });
  },

  getOrderForView: (orderId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await schema4.find({ _id: orderId });
      //  console.log(orders);
      resolve(orders[0].products);
    });
  },
  shippProduct: (orderId) => {
    return new Promise(async (resolve, reject) => {
      var order = await schema4.find({ _id: orderId });
      order[0].status = "shipped";

      // console.log(order[0].delivery.phone);
      var shippmentPass = new schema5({
        delivery: {
          address: order[0].delivery.address,
          phone: order[0].delivery.phone,
          pincode: order[0].delivery.pincode,
        },
        userId: order[0].userId,
        paymentMethod: order[0].paymentMethod,
        products: order[0].products,
        status: order[0].status,
        total: order[0].total,
      });
      shippmentPass
        .save()
        .then(() => {
          schema4.findByIdAndDelete(order[0]._id).then(() => {
            resolve();
          });
        })
        .catch((err) => {});
    });
  },
  getShippedProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
      var orders = await schema5.find();
      // console.log(orders);
      resolve(orders);
    });
  },
};
