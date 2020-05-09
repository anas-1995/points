'use strict';

module.exports = function (Cartproduct) {
    Cartproduct.deleteProduct = async function (id, req, callback) {
        try {
            let userId = req.accessToken.userId;
            let mainCartProduct = await Cartproduct.findById(id)
            if (mainCartProduct == null) {
                throw Cartproduct.app.err.global.notFound()
            }
            let mainProduct = await Cartproduct.app.models.product.findById(mainCartProduct.productId)
            if (mainCartProduct.userId != userId) {
                throw Cartproduct.app.err.global.authorization()
            }
            let mainUser = await Cartproduct.app.models.user.findById(userId)
            let mainPointsInCart = mainUser.pointsInCart - (mainProduct.price * mainCartProduct.quantity);
            let mainCartProductsCount = mainUser.cartProductsCount - 1;
            await mainUser.updateAttributes({ "cartProductsCount": mainCartProductsCount, "pointsInCart": mainPointsInCart })
            await Cartproduct.destroyAll({
                "id": id,
            })

            callback(null, mainUser)
        } catch (error) {
            callback(error)
        }
    }
};
