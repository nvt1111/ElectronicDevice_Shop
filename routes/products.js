const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const mongoose = require("mongoose");
const Product = require("../models/product");
const { uploadOptions } = require("../helpers/uploadImage");

// PUT image
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files; // files thể hiện chọn nhiều file 1 lúc ở images
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.fileName}`);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );
    if (!product) {
      res.status(500).send("Sản phẩm cập nhật không thành công !");
    }
    res.send(product);
  }
);

router.post(
  "/",
  uploadOptions.single("image"),
  productController.create_product
);
router.get("/:id", productController.get_product_id);
router.get("/", productController.get_product_category);
router.post("/search-key", productController.search_product_key);
router.get("/search-page", productController.search_page);
router.post("/review/:id", productController.review); // id: product_id

module.exports = router;
