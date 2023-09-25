const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.all_category);
router.put('/:id', categoryController.update_category);
router.get('/:id', categoryController.get_category);
router.post('/', categoryController.create_category);
router.delete('/:id', categoryController.delete_category);

module.exports = router;