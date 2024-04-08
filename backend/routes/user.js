import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await User.findOne({
      where: { id: userId },
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate']
      },
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'date'],
        include: {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      }]
    })
    if (user === null) {
      res.status(404).send()
    } else {
      res.status(200).send(user)
    }
  } catch (error) {
    next(error)
    res.status(404).send()
  }
})

export default router
