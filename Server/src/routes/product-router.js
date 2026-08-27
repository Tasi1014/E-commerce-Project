import { Router } from 'express';
import { getProducts, getProductById, searchProducts } from '../Controller/ProductController.js';
import upload from '../middleware/uploadMiddleware.js';
import { authenticateToken, authorizeRoles } from '../middleware/AuthMiddleware.js';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/search', searchProducts);
productRouter.get('/:id', getProductById);

// ── Image upload route ──────────────────────────────────────────────────────
// Protected: requires a valid admin token.
// Using authenticateToken + authorizeRoles('admin') — same guards as admin-routes.js —
// so arbitrary callers cannot dump files into our Cloudinary account.
// Kept here (not in admin-routes.js) to preserve the /api/products/upload-images URL
// and avoid entangling multer with the admin router's middleware chain.
productRouter.post(
  '/upload-images',
  authenticateToken,
  authorizeRoles('admin'),
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images',    maxCount: 5 },
  ]),
  (req, res) => {
    if (!req.files || !req.files.mainImage) {
      return res.status(400).json({ success: false, message: 'Main image is required' });
    }

    const mainImageUrl = req.files.mainImage[0].path;
    const imagesUrls   = req.files.images ? req.files.images.map((f) => f.path) : [];

    res.json({
      success:   true,
      mainImage: mainImageUrl,
      images:    imagesUrls,
    });
  }
);

export default productRouter;