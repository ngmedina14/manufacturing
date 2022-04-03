const express = require('express');
const router = express.Router();
const controller = require('../controllers/authProduct');

router.post('/save-product',controller.saveProduct);
router.post('/update-product',controller.updateProduct);
router.get('/delete-product/:product_id',controller.deleteProduct);
router.get('/list',controller.list);
router.get('/product-add-form',controller.productAddForm);
router.get('/product-update-form/:product_id',controller.productUpdateForm);

module.exports = router