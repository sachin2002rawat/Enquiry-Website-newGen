import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Valued Customer',
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    productName: {  
      type: String,
      default: 'General Product Enquiry'
    },
    message: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: 'Website'
    }, 
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Completed', 'Closed'],
      default: 'New'
    }
  },
  { timestamps: true }
)

const Enquiry = mongoose.model('Enquiry', enquirySchema)

export default Enquiry
