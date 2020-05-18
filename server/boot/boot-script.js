'use strict';

module.exports = function (app) {
  var Admin = app.models.Admin;
  var Role = app.models.Role
  var RoleMapping = app.models.RoleMapping;
  var AccessToken = app.models.AccessToken;
  var MultiAccessToken = app.models.MultiAccessToken;
  var ACL = app.models.ACL;
  var User = app.models.user;
  var Media = app.models.Media;
  var Category = app.models.Category;
  var Product = app.models.Product;
  var ImagesProduct = app.models.ImagesProduct;
  var Purchase = app.models.Purchase;
  var CartProduct = app.models.CartProduct;
  
  
  var adminData = [{
    "email": "admin@points.com",
    "password": "password",
    username: "admin",
    emailVerified: true
  }]

  var roleData = [{
    name: "super-admin",
    description: "admin of system"
  }, {
    name: "student",
    description: "student"
  }]






  function customdAutoUpload(database, databaseName, data) {
    return new Promise(resolve => {
      var mysqlDs = app.dataSources.mainDB;
      mysqlDs.autoupdate(databaseName, function (err) {
        if (err) resolve(err);
        console.log('\nAutoupdated table `' + databaseName + '`.');
        database.find({}, function (err, db) {
          if (err) resolve(err);
          if (db.length != 0) {
            console.log('\n`' + databaseName + '` has ' + db.length + ' rows.');
            resolve();
          } else {
            database.create(data, function (err, data) {
              if (err) resolve(err);
              console.log('\nCreate Dat To `' + databaseName + ' , ' + data.length + ' rows `.');
              resolve();
            })
          }
        })
      })
    })
  }

  function addRoleToadmin() {
    return new Promise(resolve => {
      Admin.find({
        "where": {
          "email": "admin@points.com"
        }
      }, function (err, admin) {
        if (err) resolve(err)
        Role.find({
          "where": {
            "name": 'super-admin'
          }
        }, function (err, role) {
          if (err) resolve(err)
          RoleMapping.find({
            "where": {
              "principalId": admin[0].id
            }
          }, function (err, rolemappings) {
            if (err) resolve(err)
            if (rolemappings.length == 0) {
              RoleMapping.create({
                "principalType": "admin",
                "principalId": admin[0].id,
                "roleId": role[0].id
              }, function (err, rolemapping) {
                if (err) resolve(err)
                console.log("create rolemapping to admin")
                resolve()
              })
            } else {
              resolve()
            }
          })
        })

      })
    })
  }


  async function init() {
    await customdAutoUpload(Admin, 'admin', adminData);
    await customdAutoUpload(Role, 'Role', roleData);
    await customdAutoUpload(RoleMapping, 'RoleMapping', []);
    await addRoleToadmin();
    await customdAutoUpload(AccessToken, 'AccessToken', []);
    await customdAutoUpload(MultiAccessToken, 'MultiAccessToken', []);
    await customdAutoUpload(ACL, 'ACL', []);
    await customdAutoUpload(User, 'user', []);
    await customdAutoUpload(Media, 'media', []);  
    await customdAutoUpload(Category, 'category', []);  
    await customdAutoUpload(Product, 'product', []);  
    await customdAutoUpload(ImagesProduct, 'imagesProduct', []);  
    await customdAutoUpload(Purchase, 'purchase', []);  
    await customdAutoUpload(CartProduct, 'cartProduct', []);  
    
    
    
  }

  init()

};
