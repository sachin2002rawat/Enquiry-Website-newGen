import HeroSlide from '../models/HeroSlide.js'

// @desc    Get hero slides
// @route   GET /api/hero-slides
// @access  Public
export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({})
    res.status(200).json({ success: true, count: slides.length, data: slides })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


// @desc    Bulk update/replace hero slides
// @route   PUT /api/hero-slides
// @access  Public / Admin
export const updateHeroSlides = async (req, res) => {
  try {
    const { slides } = req.body
    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Slides array required' })
    }

    await HeroSlide.deleteMany({})
    const created = await HeroSlide.insertMany(slides) 

    res.status(200).json({ success: true, message: 'Hero slides updated successfully', data: created })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}