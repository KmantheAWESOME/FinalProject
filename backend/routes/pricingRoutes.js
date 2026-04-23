// Import Express — needed to access the Router factory function
const express = require('express')

// Create a Router instance
// keeping route definitions modular and out of the main server.js file
const router = express.Router()

// Import CRUD controller functions from priceController.js
// Each function handles exactly one operation and is mapped to a route + HTTP method below

const {
    getPrice,    // GET    — fetch all prices belonging to the authenticated user
    setPrice,     // POST   — create a new price
    updatePrice,  // PUT    — overwrite an existing price by ID
    deletePrice   // DELETE — remove a price by ID
} = require('../controllers/pricingController')

// Import the `protect` middleware from authMiddleware.js
// `protect` runs BEFORE the controller on any route it's applied to.
// It validates the incoming JWT from the Authorization header, decodes the user ID,
// fetches that user from the DB, and attaches them to req.user.
// If the token is missing, expired, or invalid — it rejects the request with a 401
// and the controller function never runs.
// Please look into this code (../middleware/authMiddleware)

const { protect } = require('../middleware/authMiddleware')

// ---- Routes for /api/prices/ --------------------------
// GET  /api/prices/  → protect runs first, then getPrices (returns all prices for req.user)
// POST /api/prices/  → protect runs first, then setPrice  (creates a price owned by req.user)

router.route('/').get(getPrice).post(protect, setPrice)

// ---- Routes for /api/prices/:id--------------------------
// PUT    /api/prices/:id → protect runs first, then updatePrice (edits price with matching :id)
// DELETE /api/prices/:id → protect runs first, then deletePrice (removes price with matching :id)
// :id is a URL parameter accessible in the controller via req.params.id

router.route('/:id').put(protect, updatePrice).delete(protect, deletePrice)

// Export this router so server.js can mount it:
// app.use('/api/prices', require('./routes/priceRoutes'))
// All routes defined above are relative to that /api/price base path
module.exports = router