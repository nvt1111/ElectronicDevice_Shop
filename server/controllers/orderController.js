const Order = require('../models/order');
const mongoose = require('mongoose');
const OrderItem = require('../models/order-item');

const  create_order = async (req,res,next)=>{
    try{
       // truoc tien tao orderITem luu truoc
       // dung Promise all de xu li 2 bdb
        const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;// chi can mag ID neu muon biet orderitem chi tiet thi truy cap theo ID
        }))
        // giai quyet 2 promise nhu sau
        const orderItemsIdsResolved = await orderItemsIds;
        console.log(orderItemsIdsResolved)
// cal price Order
        // muon colsole.log Promise thi phai await promise
        const totalPrices =await Promise.all(orderItemsIdsResolved.map(async orderItemId =>{
            const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;

        }
            ))
        const totalPrice = totalPrices.reduce((a,b)=> a+b, 0)
        console.log(totalPrices)
        const order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        })
        const savedOrder = await order.save();
        if(!savedOrder) return res.status(500).send('The order cannot be created')
        res.send(savedOrder);
    }catch(error){
        next(error)
    }
    
}

//get order detail and populate products in OrderItem and USerData
const get_order_detail = async(req,res,next)=>{
    const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1}); // hien thi chi tiet user
    if(!orderList){
        res.status(500).json({
            success: false
        })
    }
    res.send(orderList);
}

const get_order_id = async(req,res,next)=>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate('orderItems');
    if(!order){
        res.status(500).json({
            success: false
        })
    }
    res.send(order);
}

const update_order = async (req,res,next)=>{
    try{
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
                
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        res.status(200).send(order);
    }catch(error){
        next(error)
    }
}

const delete_order = async(req,res,next)=>{
    try{
        Order.findByIdAndRemove(req.params.id)
        //ham tra ve promise
        .then((async result =>{
            if( result){
                await result.orderItems.map(async orderItem=>{
                    await OrderItem.findByIdAndRemove(orderItem); // mang nay chua id
                }) // async await đầy đủ
                res.status(200).json({
                    success: true,
                    message: 'the order is deleted'
                })
            }else{
                return res.status(404).json({
                    success: false,
                    message: "NOT FOUND"
                })
            }
        }))
    }catch(error){
        next(error)
    }
}

const get_totalSale = async (req,res,next)=>{
    const totalSales = await Order.aggregate([
        { $group : {_id: null, totalsales : { $sum: '$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).json({
            message: 'The order sales cannot be aggregate'
        })
    }
    res.send({totalsales: totalSales.pop().totalsales})
}

const get_count = async(req, res, next)=>{
    try{
        const orderCount = await Order.countDocuments({});
        if(!orderCount){
            res.status(500).json({
                success: false
            })
        }
        res.send({
            count: orderCount
        });
    }catch(error){
        next(error)
    }
}

const get_user_order = async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});
// populate mo rong dde hien thi hoac tinh toan
    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
}

module.exports = {
    create_order,
    get_order_detail,
    get_order_id,
    update_order,
    delete_order,
    get_totalSale,
    get_count,
    get_user_order
}