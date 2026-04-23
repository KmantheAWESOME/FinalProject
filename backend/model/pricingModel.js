const mongoose = require('mongoose') // Mongoose is the ODM (Object Data Modeling) library that lets us define schemas and interact with MongoDB using JavaScript objects

// Define the shape and rules for documents in the 'prices' collection
const priceSchema = mongoose.Schema(
  {
    id:Number,
    tier_name:String,
    debug:Number,
    price:Number,
    oneonone:Boolean,
  },

  // ---- Schema Options ----------------------------------------------
  {
    timestamps: true, // Automatically adds and manages `createdAt` and `updatedAt` fields on every document
    //  — no need to set them manually
  }
)

// Compile the schema into a Model and export it.
// Mongoose will map this to a MongoDB collection named 'prices' (lowercased + pluralized automatically).
// Other files import this to query, create, update, or delete prices: e.g. await Price.create({...})
module.exports = mongoose.model('Price', priceSchema, 'codehunting_collection')