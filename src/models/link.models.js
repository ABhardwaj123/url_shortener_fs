import mongoose, { Schema } from "mongoose";

const linkSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    url: {
        type: String,
        required: true
    },

    shortCode: {
        type: String,
        required: true,
        unique: true
    },

    accessCount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

// dashboard list: my links, newest first
//index in ascending order of userId and index in descending order of createdAt
linkSchema.index({ userId: 1, createdAt: -1 })

export const Link = mongoose.model("Link", linkSchema)