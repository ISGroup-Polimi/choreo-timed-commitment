const mongoose = require('mongoose');
const { terminateCommitment } = require('../controller/commitmentController');

const linkSchema = new mongoose.Schema({
    rel: { type: String, required: true },
    href: { type: String, required: true }
});

const commitmentSchema = new mongoose.Schema({
    connectionPoint: { type: String, required: true },
    status: { type: String, required: true, default: 'active' },
    outcome: { type: String, required: true },
    create_timestamp: { type: Date, required: true, default: Date.now },
    terminate_timestamp: { type: Date },
    cancel_timestamp: { type: Date }
});

const Commitment = mongoose.model('Commitment', commitmentSchema);

module.exports = Commitment;
