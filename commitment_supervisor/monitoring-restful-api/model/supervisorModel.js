const mongoose = require('mongoose');



const supervisorSchema = new mongoose.Schema({
    status: { type: String, required: true, default: 'monitoring' },
    connectionPoint: { type: String, required: true }
});

const Supervisor = mongoose.model('Supervisor', supervisorSchema);

module.exports = Supervisor;