const user = require('./users')
const product = require('./products')
const category = require('./categories')
const order = require('./orders')


const initRoutes = (app) =>{// truyền vào server

    app.use('/api/v1/users', user);
    app.use('/api/v1/products', product);
    app.use('/api/v1/categories', category);
    app.use('/api/v1/orders', order);
    
}


module.exports = initRoutes