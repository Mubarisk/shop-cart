var schema1 = require("../../config/adminDataSchema");
var bcrypt = require("bcrypt");
module.exports={
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
          var user = await schema1.findOne({ email: userData.email });
          if (user) {
            reject("user mail exist");
            console.log("mail already exist");
          } else {
            userData.password = await bcrypt.hash(userData.password, 10);
            var datapass = new schema1({
              username: userData.name,
     
              email: userData.email,
              password: userData.password,
            });
            datapass
              .save()
              .then((data) => {
                console.log("success 111" + data);
                resolve(data);
              })
              .catch((err) => {
                console.log("err 111" + err);
                reject(err);
              });
          }
        });
      },
      doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
          var user = await schema1.findOne({ email: userData.email });
          if (user) {
            console.log("user found");
            bcrypt.compare(userData.password, user.password).then((status) => {
              if (status) {
                resolve(user);
                console.log("correct pass");
              } else {
                reject(status);
                console.log("incorrect pass");
              }
            });
          } else {
            console.log("no user found");
            reject("no user found");
          }
        });
      },
}