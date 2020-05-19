'use strict';

module.exports = function (Category) {
    Category.observe('access', function (ctx, next) {
        if (ctx.query.where == null)
            ctx.query.where = {}
        let temp = ctx.query.where
        ctx.query.where = {}
        ctx.query.where['and'] = [temp, { deleted: false }]
        console.log(ctx)
        next();
    });
    Category.deleteCategory = async function (id, callback) {
        try {

            await Category.app.dataSources.mainDB.transaction(async models => {
                const {
                    product
                } = models
                const {
                    category
                } = models
                let mainCategory = await category.findById(id)
                if (mainCategory == null)
                    throw Category.app.err.global.notFound()
                await mainCategory.updateAttribute('deleted', true)
                await product.updateAll({ "categoryId": mainCategory.id }, {
                    'deleted': true
                })
                callback(null)
            })
        } catch (error) {
            callback(error)
        }
    }
};
