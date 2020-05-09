'use strict';

module.exports = function (Product) {
    Product.addProduct = async function (data, imagesId = [], callback) {
        try {
            await Product.app.dataSources.mainDB.transaction(async models => {
                const {
                    product
                } = models
                const {
                    imagesProduct
                } = models
                let mainProduct = await product.create(data)
                let images = []
                imagesId.forEach(element => {
                    images.push({ "productId": mainProduct.id, "mediaId": element })
                });
                await imagesProduct.create(images)
                callback(null, mainProduct)
            })
        } catch (error) {
            callback(error)
        }
    }

    Product.updateProduct = async function (id, data, imagesId = [], callback) {
        try {
            await Product.app.dataSources.mainDB.transaction(async models => {
                const {
                    product
                } = models
                const {
                    imagesProduct
                } = models
                let mainProduct = await product.findById(id)
                if (mainProduct == null) {
                    throw Product.app.err.global.notFound()
                }
                let images = []
                imagesId.forEach(element => {
                    images.push({ "productId": mainProduct.id, "mediaId": element })
                });
                await imagesProduct.destroyAll({
                    "productId": id,
                })
                await imagesProduct.create(images)
                mainProduct = await mainProduct.updateAttributes(data)
                callback(null, mainProduct)
            })
        } catch (error) {
            callback(error)
        }
    }

    Product.addProductToCart = async function (productId, quantity, req, callback) {
        try {
            let userId = req.accessToken.userId;
            await Product.app.dataSources.mainDB.transaction(async models => {
                const {
                    product
                } = models
                const {
                    user
                } = models
                const {
                    cartProduct
                } = models
                let mainUser = await user.findById(userId)
                let mainProduct = await product.findById(productId)
                if (mainProduct == null || mainProduct.deleted) {
                    throw Product.app.err.global.notFound()
                }

                if ((mainProduct.price * quantity) + mainUser.pointsInCart > mainUser.points) {
                    throw Product.app.err.global.donotHavePoints()
                }
                if (mainProduct.quantity < quantity) {
                    throw Product.app.err.global.largeQuantity()
                }
                let oldProduct = await cartProduct.findOne({ "where": { "productId": productId, "userId": userId } })
                if (oldProduct) {
                    throw Product.app.err.global.alreadyHasProduct()
                }
                let mainCartProduct = await cartProduct.create({ "userId": userId, "quantity": quantity, "productId": productId })
                let mainPointsInCart = mainUser.pointsInCart + (mainProduct.price*quantity);
                let mainCartProductsCount = mainUser.cartProductsCount + 1;
                await mainUser.updateAttributes({ "cartProductsCount": mainCartProductsCount, "pointsInCart": mainPointsInCart })
                callback(null, mainCartProduct)
            })
        } catch (error) {
            callback(error)
        }
    }


};
