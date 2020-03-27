const mongoose = require('mongoose')
const Schema = mongoose.Schema

const institutionSchema = {
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'Unknown'
    },
    description: {
        type: String,
        default: 'This institution does not have a description.'
    },
    location: {
        type: {type: String},
        coordinates: [Number]
    },
    image: Buffer,
    graph: Schema.Types.Mixed,
    cache: Schema.Types.Mixed,
    buildings: Schema.Types.Mixed
}
// institutionSchema.index({location: '2dsphere'})

mongoose.model('Institution', institutionSchema)