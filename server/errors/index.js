const cError = require('./cError');

module.exports.global = {

  notFound: function () {
    return new cError(450, 'object not found', 450);
  },
  donotHavePoints: function () {
    return new cError(451, 'you do not have point', 451);
  },
  largeQuantity: function (data) {
    return new cError(453, 'large quantity', 453, data);
  },
  alreadyHasProduct: function () {
    return new cError(454, 'already has product', 454);
  },
  authorization: function () {
    return new cError(401, 'Authorization Required', 401);
  },
  oldPasswordIsWrong: function () {
    return new cError(452, 'old password is wrong', 452);
  }
};
