const user = require('./users')
const product = require('./products')
const category = require('./categories')
const order = require('./orders')
const orderItem = require('./order-items')


const initRoutes = (app) =>{// truyền vào server

    app.use('/api/v1/users', user);
    app.use('/api/v1/products', product);
    app.use('/api/v1/categories', category);
    app.use('/api/v1/orders', order);
    app.use('/api/v1/orderItems', orderItem);
}


module.exports = initRoutes