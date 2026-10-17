import mongoose , {Schema} from "mongoose";

const clickSchema = new Schema({
    
    linkId: {
        type: Schema.Types.ObjectId,
        ref: "Link",
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

})

// analytics queries are "clicks for this link in a date range"
clickSchema.index({ linkId: 1, timestamp: 1 })

export const Click = mongoose.model("Click", clickSchema)