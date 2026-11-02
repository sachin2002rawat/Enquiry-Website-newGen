import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import Blog from '../models/Blog.js'
import BlogSettings from '../models/BlogSettings.js'

// Helper to save base64 data URLs to local uploads directory
const saveBase64Image = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) return dataUrl
    const rawExt = matches[1].toLowerCase()
    const ext = rawExt.includes('png') ? 'png' : rawExt.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(matches[2], 'base64')
    const filename = `blog_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    fs.writeFileSync(path.join(uploadsDir, filename), buffer)
    const serverBase = process.env.BASE_URL || 'http://localhost:5000'
    return `${serverBase}/uploads/${filename}`
  } catch (err) {
    console.warn('Failed to save blog base64 image to disk:', err.message)
    return dataUrl
  }
}

const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// @desc    Get all blogs with optional filtering
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { homepage, category, search, publishedOnly } = req.query
    let query = {}

    if (publishedOnly === 'true') {
      query.isPublished = true
    }

    if (homepage && homepage !== 'all') {
      query.targetHomepage = { $in: [homepage, 'all'] }
    }

    if (category && category !== 'All' && category !== 'ALL') {
      query.category = new RegExp(`^${category}$`, 'i')
    }

    if (search && search.trim()) {
      const q = search.trim()
      query.$or = [
        { title: new RegExp(q, 'i') },
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') }
      ]
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: blogs.length, data: blogs })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single blog by ID or Slug
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params
    let blog = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id)
    }

    if (!blog) {
      blog = await Blog.findOne({ slug: id })
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found' })
    }

    res.status(200).json({ success: true, data: blog })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body }

    // Normalize name and title
    if (!blogData.title && blogData.name) {
      blogData.title = blogData.name
    }
    if (!blogData.name && blogData.title) {
      blogData.name = blogData.title
    }

    // Auto-generate slug if missing
    if (!blogData.slug && (blogData.title || blogData.name)) {
      blogData.slug = slugify(blogData.title || blogData.name)
    }

    // Save image if base64
    if (blogData.image) {
      blogData.image = saveBase64Image(blogData.image)
    }
    if (Array.isArray(blogData.images)) {
      blogData.images = blogData.images.map(img => saveBase64Image(img))
    }

    const newBlog = await Blog.create(blogData)
    res.status(201).json({ success: true, message: 'Blog article created successfully', data: newBlog })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update existing blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    if (!updateData.title && updateData.name) {
      updateData.title = updateData.name
    }
    if (!updateData.name && updateData.title) {
      updateData.name = updateData.title
    }

    if (updateData.image) {
      updateData.image = saveBase64Image(updateData.image)
    }
    if (Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(img => saveBase64Image(img))
    }

    let updatedBlog = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    } else {
      updatedBlog = await Blog.findOneAndUpdate({ slug: id }, updateData, { new: true, runValidators: true })
    }

    if (!updatedBlog) {
      return res.status(404).json({ success: false, message: 'Blog article not found for update' })
    }

    res.status(200).json({ success: true, message: 'Blog updated successfully', data: updatedBlog })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params
    let deleted = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Blog.findByIdAndDelete(id)
    } else {
      deleted = await Blog.findOneAndDelete({ slug: id })
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Blog article not found to delete' })
    }

    res.status(200).json({ success: true, message: 'Blog deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get Blog page general settings
// @route   GET /api/blogs/settings
// @access  Public
export const getBlogSettings = async (req, res) => {
  try {
    let settings = await BlogSettings.findOne()
    if (!settings) {
      settings = await BlogSettings.create({})
    }
    res.status(200).json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update Blog page general settings
// @route   PUT /api/blogs/settings
// @access  Private/Admin
export const updateBlogSettings = async (req, res) => {
  try {
    const settings = await BlogSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true, runValidators: true }
    )
    res.status(200).json({ success: true, message: 'Blog settings updated successfully', data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
