const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const mongoose = require('mongoose');
const { verifyAccessToken } = require('../helpers/jwt')
const multer = require('multer');
const Product = require('../models/product')
const { uploadOptions } = require('../helpers/uploadImage')

// PUT image
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const files = req.files;// files thể hiện chọn nhiều file 1 lúc ở images
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    if (files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.fileName}`);
        })
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        }, { new: true } // tra lai du lieu moi cap nhat
    );
    if (!product) {
        res.status(500).send('the product cannot updated')
    }
    res.send(product);
})

router.post('/', uploadOptions.single('image'), productController.create_product);
router.get('/:id', productController.get_product_id); // có thể chèn thêm query page = i đê PANIGATION
router.get('/', productController.get_product_category);// filter theo category
router.post('/search-key', productController.search_product_key);
router.get('/search-page', productController.search_page);
router.post('/review/:id', productController.review);// id này id san rphaarm

///////
router.get('/', productController.get_all);
router.put('/:id', productController.update_product);
router.delete('/:id', productController.delete_product);
router.get('/get/count', productController.get_count);
router.get('/get/featured', productController.get_product_feature);
router.get('/get/featured/:count', productController.get_product_feature_count);

module.exports = router;
