const asyncHandler = require('express-async-handler')
 
const Price = require('../model/pricingModel')
const User = require('../model/userModel') // for update and delete

// http://localhost:5555/api/data/
const getPrice = asyncHandler(async (req, res) =>{
  
  
    const prices = await Price.find()
    //const prices = await Price.find({user:req.user.id})

    res.status(200).json(prices)
})

// ===== CREATE A PRICE =====
const setPrice = asyncHandler(async(req, res) => {

    // Validate that the request body contains a 'text' field 
    //  without this check, we'd save empty/useless prices to the database
    if(!req.body.tier_name || !req.body.price){
        // Set status to 400 (Bad Request) 
        //  tells the client they sent invalid data
        res.status(400)
        // Throw an error with a helpful message 
        //  asyncHandler catches this and passes it to our errorMiddleware
        throw new Error("Please include tier_name and price")
    }


    // Insert a new price document into MongoDB 
    //  .create() both builds and saves the document in one step
    const price = await Price.create(
        {
            id: req.body.id,
            tier_name: req.body.tier_name,
            debug: req.body.debug,
            price: req.body.price,
            oneonone: req.body.oneonone,
            user: req.user.id
        }
    )

    // Send back the newly created price as JSON 
    //  the client gets confirmation of what was saved, 
    // including the auto-generated _id
    res.status(200).json(price_created)
})

// ===== UPDATE A PRICE =====
const updatePrice =  asyncHandler(async(req, res) => {

    // if we need to update any price - we need an id
    // Look up the price by the id from the URL parameter (e.g., /api/prices/abc123) 
    //  we first check if it exists before trying to update
    const price = await Price.findOne({ id: req.params.id }) // this will find our price

    // If no price was found with that id, send a 400 error 
    //  prevents updating a non-existent document
    if(!price){
        res.status(400)
        throw new Error("Price not found")
    }

    //not used in this context
    //-------Only authorized user can update their price---------------
    // const user = await User.findById(req.user.id)
    // // we want to check if user exist or not, if yes then they can only update and delete their prices
    // if(!user){
    //     res.status(401)
    //     throw new Error(' user not found')
    // }

    // // Only the prices that belong to the user should be modified by that user.
    // if (price.user.toString() !== req.user.id) {
    //     res.status(401)
    //     throw new Error('User not authorized')
    //  }

    //--------------------------------------------


    // now lets update the price 
    // Find the price by id and update its text field in one operation
    const updatedPrice = await Price.findOneAndUpdate(
        { id: Number(req.params.id) },
        {
            tier_name: req.body.tier_name,
            debug: req.body.debug,
            price: req.body.price,
            oneonone: req.body.oneonone
        },
        { new: true }
    )

    // Send back the updated price so the client can see the changes took effect
    res.status(200).json(updatedPrice)
})

// ===== DELETE A PRICE =====
const deletePrice = asyncHandler(async (req, res) => {

    // Find the price first 
    //  we need the document object to call .deleteOne() on it
    const price = await Price.findOne({id:req.params.id}) // this will find our price

    // If the price doesn't exist, tell the client 
    //  prevents trying to delete something that's already gone
    if(!price){
        res.status(400)
        throw new Error("Price not found")
    }

    //not used in this context
    //-------Only authorized user can update their price ---------------
    // const user = await User.findById(req.user.id)
    // // we want to check if user exist or not, if yes then they can only update and delete their prices
    // if(!price){
    //     res.status(401)
    //     throw new Error('price not found')
    // }

    // // check if the price has the user field, because we are adding the user key in the database
    // if (price.user.toString() !== req.user.id) {
    //     res.status(401)
    //     throw new Error('User not authorized')
    //  }

    //--------------------------------

    // Remove the price from the database 
    //  .deleteOne() is called on the document instance we found above
    await Price.findOneAndDelete({ id: req.params.id })


    // Send back a confirmation message with the deleted price's id 
    //  lets the client know which price was removed
    res.status(200).json({ message: `Delete price ${req.params.id}` })
}
)

// Export all four functions so priceRoutes.js can attach them to the corresponding HTTP endpoints
module.exports = {
    getPrice,
    setPrice,
    updatePrice,
    deletePrice
}