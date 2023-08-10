const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');
const mongoose = require('mongoose');

const search_page = (req,res,next)=>{
    res.render('search')
}
const get_product_id = async(req,res,next)=>{
    const product = await Product.findById(req.params.id).populate('category');
    const user_id= req.query.user_id;
    const user = await User.findById(user_id);
    if(!product){
        res.status(500).json({
            success: false
        })
    }
    res.render('product_detail', {product:product ,user: user });
}

// lọc sản phẩm theo category
const get_product_category = async(req,res,next)=>{  
        try{
            let filter = {};// lấy query trên request
        if(req.query.categories)
        {
             filter = {category: req.query.categories.split(',')}
        }
        console.log('Dạng của Fillterrrrrr: ', filter)
        const products = await Product.find({category: filter.category});
        const category = await Category.findById({_id: filter.category});
        if(!products) {
            res.status(500).json({success: false})
        } 
        // các giá trị này nó tồn tại trên sesion lên có thể lấy ở bất kì đâu
        const isLoggedIn = req.session.isLoggedIn;
        const user = req.session.user;
        // send dữ liệu cho trnag đó hiển thị thoi
        // send nhiều cái cho trong Object {}
        res.render('category',{products, category,isLoggedIn: isLoggedIn, user: user});// phương thức get chỉ cần gửi DL ko cần redirect trnag khác
        }catch(error){
            next(error)
        }    
    }

const  create_product =  async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')

    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,// "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
}

const get_all = async(req,res,next)=>{
    const productList = await Product.find();
    if(!productList){
        res.status(500).json({
            success: false
        })
    }
    res.send(productList);
}

const update_product = async (req,res,next)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).send('Invalid Category');
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        res.status(200).send(product);
    }catch(error){
        next(error)
    }
}

const delete_product = async(req,res,next)=>{
    try{
        Product.findByIdAndRemove(req.params.id)
        //ham tra ve promise
        .then((result)=>{
            if(result){
                res.status(200).json({
                    success: true,
                    message: 'the product is deleted'
                })
            }else{
                return res.status(404).json({
                    success: false,
                    message: "NOT FOUND"
                })
            }
        })

    }catch(error){
        next(error)
    }
}

const get_count = async(req, res, next)=>{
    try{
        const productCount = await Product.countDocuments({});
        if(!productCount){
            res.status(500).json({
                success: false
            })
        }
        res.send({
            count: productCount
        });
    }catch(error){
        next(error)
    }
}

const get_product_feature = async(req, res, next)=>{
    try{
        const products = await Product.find({isFeatured: true})
        if(!products){
            res.status(500).json({
                success: false
            })
        }
        res.send({
            products
        });
    }catch(error){
        next(error)
    }
}

const get_product_feature_count = async(req, res, next)=>{
    try{
        const count = req.params.count ? req.params.count :0;
        // lay ra count sp noi bat nhat, co dau + de chuyen dang int
        const products = await Product.find({isFeatured: true}).limit(+count)
        if(!products){
            res.status(500).json({
                success: false
            })
        }
        res.send({
            products
        });
    }catch(error){
        next(error)
    }
}
const search_product_key = async(req,res,next)=>{
    try{
        const key = req.body.keyword;
        const filteredProducts = await Product.find({
            name: { $regex: key, $options: 'i' }
        });
        const isLoggedIn = req.session.isLoggedIn;
        const user = req.session.user
        // res.render('s');
        res.render('search', {products: filteredProducts, isLoggedIn, user, key});// bên phần data chỉ cần {}
    }catch(error){
        next(error)
    }

}


module.exports = {
    get_product_category,
    search_page,
    create_product,
    get_all,
    get_product_id,
    update_product,
    delete_product,
    get_count,
    get_product_feature,
    get_product_feature_count,
    search_product_key
}

// router.get('/', async (req, res, next) => {
//     try {
//       const categoryId = req.query.categoryId;
      
//       // Kiểm tra nếu categoryId không được cung cấp
//       if (!categoryId) {
//         return res.status(400).json({ success: false, message: 'Missing categoryId parameter' });
//       }
  
//       // Tìm category trong database
//       const category = await Category.findById(categoryId);
      
//       // Kiểm tra nếu category không tồn tại
//       if (!category) {
//         return res.status(404).json({ success: false, message: 'Category not found' });
//       }
  
//       // Tìm các sản phẩm thuộc category
//       const productList = await Product.find({ category: categoryId }).populate('category');
      
//       res.json({ success: true, category, productList });
//     } catch (error) {
//       next(error);
//     }
//   });