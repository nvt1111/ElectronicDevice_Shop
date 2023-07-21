const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const mongoose = require('mongoose');
const {verifyAccessToken} = require('../helpers/jwt')
const multer = require('multer');
const Product = require('../models/product')

// VALLIDATE UPLOAD FILE
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
// upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type')
        if(isValid){
            uploadError = null
        }
      cb(uploadError, 'public/uploads') // khong co / truoc public
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

// PUT image
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res, next)=>{
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
     }
     const files = req.files;// files thể hiện chọn nhiều file 1 lúc ở images
     let imagesPaths = [];
     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
     if(files){
        files.map(file =>{
            imagesPaths.push(`${basePath}${file.fileName}`);
        })
     }
     
     const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        }, {new: true} // tra lai du lieu moi cap nhat
        );
    if(!product) {
        res.status(500).send('the product cannot updated')
    } 
    res.send(product);
})

router.get('/', productController.get_product_category);
router.post('/',uploadOptions.single('image') ,productController.create_product);
router.get('/', productController.get_all);
router.get('/:id',productController.get_product_id);
router.put('/:id', productController.update_product);
router.delete('/:id', productController.delete_product);
router.get('/get/count', productController.get_count);
router.get('/get/featured', productController.get_product_feature);
router.get('/get/featured/:count', productController.get_product_feature_count);


module.exports = router;


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