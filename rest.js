/**
 * This schema describes the article available at the enterprise. Article ids will be attached
 * to orders. An article is unique. A user should use the availableQuantity attribute instead
 * of trying to create several entries of the same article.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availableQuantity: {
        type: Number,
        required: true
    }
},{
        timestamps: true
    });

module.exports = mongoose.model('Article', articleSchema);