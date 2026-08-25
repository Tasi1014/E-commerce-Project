import { Router } from 'express';
import { getProducts, getProductById, searchProducts } from '../Controller/ProductController.js';
import upload from '../middleware/uploadMiddleware.js';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/search', searchProducts);  
productRouter.get('/:id', getProductById);

router.post(
  '/upload-images',
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 5 }, // adjust max gallery images as you like
  ]),
  (req, res) => {
    if (!req.files || !req.files.mainImage) {
      return res.status(400).json({ success: false, message: 'Main image is required' });
    }

    const mainImageUrl = req.files.mainImage[0].path;
    const imagesUrls = req.files.images ? req.files.images.map((file) => file.path) : [];

    res.json({
      success: true,
      mainImage: mainImageUrl,
      images: imagesUrls,
    });
  }
);


export default productRouter;