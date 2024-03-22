import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  const product = await Product.findAll({
    attributes: ['id', 'name', 'description', 'pictureUrl', 'originalPrice'],
    include: [{
      model: User,
      as: 'seller',
      attributes: ['id', 'username']
    },
    {
      model: Bid,
      as: 'bids',
      attributes: ['id', 'price'],
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username']
      }]
    }]
  })

  if (product === null) {
    res.status(404).send('No products found')
  }
  res.status(200).send(product)
})

router.get('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, async (req, res, next) => {
  try {
    // Validate request body
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body

    if (!name || !description || !pictureUrl || !category || !originalPrice || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['name', 'description', 'pictureUrl', 'category', 'originalPrice', 'endDate'] })
    }

    // Create product
    const sellerId = req.user.id // Use authenticated user as seller
    const product = await Product.create({ name, description, category, originalPrice, pictureUrl, endDate, sellerId })

    // Return product
    return res.status(201).json(product)
  } catch (err) {
    return next(err)
  }
})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
