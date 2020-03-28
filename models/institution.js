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
    image: {
        type: Buffer,
        
    },
    graph: {
        type: Schema.Types.Mixed,
        default: {}
    },
    cache: {
        type: Schema.Types.Mixed,
        default: {}
    },
    buildings: {
        type: Schema.Types.Mixed,
        default: {}
    }
}
// institutionSchema.index({location: '2dsphere'})

mongoose.model('Institution', institutionSchema)