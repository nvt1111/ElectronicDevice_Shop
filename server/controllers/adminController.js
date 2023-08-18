const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {signAccessToken} = require('../helpers/jwt');
const session = require('express-session');
const {uploadOptions} = require('../helpers/uploadImage')

const get_dashboard =async (req,res,next)=>{// login admin   
    //Panigation
    const order = res.locals.orders ;
    const currentPage = parseInt(req.query.page) || 1;// nếu ko có thì cho là 1
    const slOrder1Page = 5;
    // (n-1)*x
    const start = (currentPage-1)*slOrder1Page;
    const end = start + slOrder1Page;
    const totalPage = Math.ceil(order.length / slOrder1Page);//lam tron leen

    res.render('admin/index', {orders: order.slice(start,end), totalPage, currentPage});   
}

const get_page_user = (req,res,next)=>{
    //Panigation
    const user = res.locals.users ;
    const currentPage = parseInt(req.query.page) || 1;// nếu ko có thì cho là 1
    const slOrder1Page = 5;
    // (n-1)*x
    const start = (currentPage-1)*slOrder1Page;
    const end = start + slOrder1Page;
    const totalPage = Math.ceil(user.length / slOrder1Page);//lam tron leen

    res.render('admin/user', {users: user.slice(start,end), totalPage, currentPage});
}

const get_page_category = (req,res,next)=>{
    res.render('admin/category')
}

const get_page_product = (req,res,next)=>{
    //Panigation
    const product = res.locals.products ;
    const currentPage = parseInt(req.query.page) || 1;// nếu ko có thì cho là 1
    const slOrder1Page = 5;
    // (n-1)*x
    const start = (currentPage-1)*slOrder1Page;
    const end = start + slOrder1Page;
    const totalPage = Math.ceil(product.length / slOrder1Page);//lam tron leen

    res.render('admin/product', {products: product.slice(start,end), totalPage, currentPage});
}

const addUser = async (req,res,next)=>{
    try{   
        if(User.findOne({email: req.body.email})){
            res.status(500).json({
                message: "Email đã đăng kí"
            })
        }else{
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                passwordHash: bcrypt.hashSync(req.body.password, 10),
                isAmin: req.body.isAmin
            });
            const savedUser = await user.save();
            res.redirect('/admins/user')
        }        
    }catch(error){
        next(error)
    }
}

const addProduct = async (req,res,next)=>{
    try{
        const file = req.file;
        console.log(file)
        if(!file){ return res.status(400).send('Không có ảnh trong yêu cầu');}
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            image: `${basePath}${fileName}`,// "http://localhost:3000/public/upload/image-2323232",
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            countInStock: req.body.countInStock,
        });
        console.log('llllllllllllllllllllllllllllllllllllll', product.image)
        const savedPro= await product.save();
        if(!savedPro) res.send('không thêm được sản phẩm')
        res.redirect('/admins/product')
    }catch(error){
        next(error)
    } 
}

const addCategory = async(req,res,next) =>{
    try{
        const cate = new Category(req.body)
        const Savedcate = cate.save();
        res.redirect('/admins/category')
    }catch(error){
        next(error)
    }
}


const delProduct = async (req,res,next )=>{
    const id = req.params.id;
    Product.findByIdAndDelete(id)
        .then((result)=>{
            res.json({redirect: '/admins/product'}) 
        })
        .catch((err)=>{
            console.log(err)
        })
}

const delOrder = (req,res,next )=>{
    const id = req.params.id;
    Order.findByIdAndDelete(id)
        .then(data =>{
            res.json({ redirect : '/admins/dashboard'})
        })
        .catch( err =>{
            console.log(err)
        })
}

const delUser = (req,res,next) =>{
    const id = req.params.id;
    User.findByIdAndDelete(id)
    .then((result)=>{
        res.json({redirect: '/admins/user'})
    }).catch(err =>{
        console.log(err)
    })

}

const delCate= (req,res,next) =>{
    const id = req.params.id;
    Category.findByIdAndDelete(id)
    .then((result)=>{
        res.json({redirect: '/admins/category'})
    }).catch(err =>{
        console.log(err)
    })

}

const update_product = async (req,res,next)=>{
    try{
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).send('Invalid Category');
        const product = await Product.findByIdAndUpdate(
            req.params.id, // truyền ddoogn thời id và các thuộc tính
            {
                name: req.body.name,
                description: req.body.description,
                // image: req.body.image,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        if(!product) res.send('Khogn toont taiiiiiiiiiiiiiiiiiiiiiiii')
        res.redirect('/admins/product')
    }catch(error){
        next(error)
    }
}

const update_user = async (req,res,next)=>{
    try{
        const user = await User.findByIdAndUpdate(
            req.params.id, // truyền ddoogn thời id và các thuộc tính
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                isAdmin: req.body.isAdmin
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        if(!user) res.send('Khogn toont taiiiiiiiiiiiiiiiiiiiiiiii')
        res.redirect('/admins/user')
    }catch(error){
        next(error)
    }
}


const update_order = async (req,res,next)=>{
    try{
        const order = await Order.findByIdAndUpdate(
            req.params.id, // truyền ddoogn thời id và các thuộc tính
            {
                totalPrice: req.body.totalPrice,
                shippingAddress1: req.body.shippingAddress1,
                status: req.body.status,
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        if(!order) res.send('Khoogn tồn tại')
        res.redirect('/admins/dashboard')
    }catch(error){
        next(error)
    }
}
const detailProduct = async (req,res,next) =>{
    const id = req.params.id;
    const pro = await Product.findById(id);
    res.render('admin/edit_product',{pro})
}

const detailUser = async (req,res,next) =>{
    const id = req.params.id;
    const user = await User.findById(id);
    res.render('admin/edit_user',{user})
}

const detailOrder = async (req,res,next) =>{
    const id = req.params.id;
    const order = await Order.findById(id);
    res.render('admin/edit_order',{order})
}


module.exports = {
    get_dashboard,
    get_page_user,
    get_page_category,
    get_page_product,
    addUser,
    addProduct,
    addCategory,
    delProduct,
    delOrder,
    delUser,
    delCate,
    update_product,
    detailProduct,detailUser,
    update_user, detailOrder, update_order
}