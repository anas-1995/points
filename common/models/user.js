'use strict';

module.exports = function (User) {


  User.validatesUniquenessOf('email', {
    message: 'email is not unique'
  });

  User.observe('access', function (ctx, next) {
    if (ctx.query.where == null)
        ctx.query.where = {}
    let temp = ctx.query.where
    ctx.query.where = {}
    ctx.query.where['and'] = [temp, { deleted: false }]
    next();
});

  User.afterRemote('create', function (context, result, next) {
    const user = context.res.locals.user;
    console.log(result.id)
    User.app.models.RoleMapping.create({
      "principalType": "user",
      "principalId": result.id,
      "roleId": 1
    }, function (err, rolemapping) {
      if (err) next(err)
      console.log("create rolemapping to admin")
      next();
    })
  });


  User.changePassword = async function (id, newPassword, callback) {
    try {
      let mainUser = await User.findById(id)
      mainUser = await mainUser.updateAttribute('password', User.hashPassword(newPassword))
      callback(null, mainUser)
    } catch (error) {
      callback(error)
    }
  }

  User.deleteUser = async function (id, callback) {
    try {
      let mainUser = await User.findById(id)
      let userPurchase = await User.app.models.purchase.find({ "where": { "userId": id }, "order": "createdAt DESC" })
      if (userPurchase.length == 0) {
        await User.destroyAll({ "id": id })
      }
      else {
        mainUser = await mainUser.updateAttribute('deleted', true)
      }
      callback(null)
    } catch (error) {
      callback(error)
    }
  }




  User.changeMyPassword = async function (oldPassword, newPassword, req, callback) {
    try {
      let userId = req.accessToken.userId;
      let mainUser = await User.findById(userId)
      if (mainUser == null) {
        throw User.app.err.global.notFound()
      }

      var hasPassword = await mainUser.hasPassword(oldPassword)
      if (hasPassword == false) {
        throw User.app.err.global.oldPasswordIsWrong()
      }
      mainUser = await mainUser.updateAttribute('password', User.hashPassword(newPassword))
      callback(null, mainUser)
    } catch (error) {
      callback(error)
    }
  }

  User.updateInfo = async function (data, req, callback) {
    try {
      let userId = req.accessToken.userId;
      let mainUser = await User.findById(userId)
      if (mainUser == null) {
        throw User.app.err.global.notFound()
      }

      mainUser = await mainUser.updateAttributes(data)
      callback(null, mainUser)
    } catch (error) {
      callback(error)
    }
  }

  User.me = async function (req, callback) {
    try {
      let userId = req.accessToken.userId;
      let mainUser = await User.findById(userId)
      callback(null, mainUser)
    } catch (error) {
      callback(error)
    }
  }

  User.myCart = async function (req, callback) {
    try {
      let userId = req.accessToken.userId;
      let userCartProduct = await User.app.models.cartProduct.find({ "where": { "userId": userId }, "order": "createdAt DESC" })
      callback(null, userCartProduct)
    } catch (error) {
      callback(error)
    }
  }

  User.myPurchase = async function (req, callback) {
    try {
      let userId = req.accessToken.userId;
      let userPurchase = await User.app.models.purchase.find({ "where": { "userId": userId }, "order": "createdAt DESC" })
      callback(null, userPurchase)
    } catch (error) {
      callback(error)
    }
  }



};
