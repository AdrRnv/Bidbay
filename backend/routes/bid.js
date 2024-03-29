import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId', async (req, res) => {
  try {
    const bid = await Bid.findByPk(req.params.bidId)

    if (!bid) {
      return res.status(404).send("L'offre d'enchère n'existe pas")
    } else if ((bid.bidderId !== req.user.id && !req.user.admin)) {
      return res.status(403).send("Vous n'êtes pas autorisés à supprimer cette offre d'enchère")
    }

    await bid.destroy()
    res.status(204).send()
  } catch (err) {
    res.status(401).send("Une erreur s'est produite lors de la suppression de l'offre d'enchère")
  }
})

router.post('/api/products/:productId/bids', async (req, res) => {
  try {
    const { price } = req.body

    if (!req.user.id && !req.user.admin) {
      return res.status(401).send("Vous n'êtes pas connecté")
    }

    let bid

    try {
      bid = await Bid.create({
        productId: req.params.productId,
        price,
        date: Date.now(),
        bidderId: req.user.id
      })
    } catch (err) {
      res.status(400).json({ error: 'Invalid or missing fields', details: 'price' })
    }

    res.status(201).json(bid)
  } catch (err) {
    res.status(401).send("Une erreur s'est produite lors de la création de l'offre d'enchère")
  }
})

export default router
