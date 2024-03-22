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
  const productId = req.params.productId

  const product = await Product.findOne({
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
    }],
    where: { id: productId }
  })

  if (product === null) {
    res.status(404).send('Product not found found')
  }
  res.status(200).send(product)
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', (req, res) => {

})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router
