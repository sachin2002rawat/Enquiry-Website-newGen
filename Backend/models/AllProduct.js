import mongoose from 'mongoose'
import { productSchema } from './Product.js'

const AllProduct = mongoose.model('AllProduct', productSchema, 'allproducts')

export default AllProduct
