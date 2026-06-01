import { Router } from 'express';
import { getProducts, getProductById, searchProducts } from '../Controller/ProductController.js';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/search', searchProducts);  
productRouter.get('/:id', getProductById);


export default productRouter;