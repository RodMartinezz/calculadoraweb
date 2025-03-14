const mongoose = require("mongoose");

// Esquema para las sugerencias
const Suggestion = mongoose.model("Suggestion", new mongoose.Schema({
    email: { type: String, required: true },
    opinion: { type: String, required: true },
    gusta: String
}));

module.exports = Suggestion;
