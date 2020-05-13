'use strict';

module.exports = function (Purchase) {
    Purchase.makePurchase = async function (req, callback) {
        try {
            await Purchase.app.dataSources.mainDB.transaction(async models => {
                const {
                    cartProduct
                } = models
                const {
                    product
                } = models
                const {
                    user
                } = models
                const {
                    purchase
                } = models
                let userId = req.accessToken.userId;
                let mainUser = await user.findById(userId)
                let allCartProduct = await cartProduct.find({ "where": { "userId": userId } })
                let errorElement = []
                let purchaseArray = []
                let totalPoint = 0;
                console.log("SS")
                allCartProduct.forEach(element => {
                    console.log("start")

                    let product = element.product();
                    totalPoint += (product.price * element.quantity)
                    if (element.quantity > product.quantity) {
                        errorElement.push(product)
                    }
                    purchaseArray.push({ "productId": product.id, "userId": userId, "price": product.price, "quanitiy": element.quantity })
                    console.log("end")

                });
                console.log("QQ")
                if (errorElement.length > 0) {
                    throw Purchase.app.err.global.largeQuantity(errorElement)
                }

                if (mainUser.points < totalPoint) {
                    throw Purchase.app.err.global.donotHavePoints()
                }
                let mainPurchases = await purchase.create(purchaseArray)


                let userPoint = mainUser.points - totalPoint
                await mainUser.updateAttributes({ "points": userPoint, "pointsInCart": 0, "cartProductsCount": 0 })


                allCartProduct.forEach(element => {
                    console.log("start")

                    let product = element.product();
                    let mainPurchaseCount = product.purchaseCount + 1;
                    let mainQuantity = product.quantity - element.quantity;

                    product.updateAttribute({ "purchaseCount": mainPurchaseCount, "quantity": mainQuantity })

                });
                await cartProduct.destroyAll({ "userId": userId })
                callback(null, mainPurchases)
            })
        } catch (error) {
            callback(error)
        }
    }

};
