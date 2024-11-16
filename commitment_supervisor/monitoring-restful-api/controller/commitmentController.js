// commitmentController.js

const Commitment = require('../model/commitmentModel');

// Function to create a new Commitment
exports.createCommitment = async (req) => {
    try {
        const newCommitment = new Commitment({
            connectionPoint: req.body.connectionPoint,
            outcome: req.body.outcome
        });

        await newCommitment.save();
        return newCommitment;
    } catch (error) {
        const err = new Error("Error creating the commitment");
        err.statusCode = 500;
        err.details = error.message;
        throw err;
    }
};

exports.changeStatus = async (req) => {
    try {
        const commitment = await Commitment.findById(req.params.commitmentId);
        if (!commitment) {
            const err = new Error("Commitment not found");
            err.statusCode = 404;
            throw err;
        }

        commitment.status = req.body.status;
        await commitment.save();
        return commitment;
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = "Error updating the commitment status";
        }
        throw error;
    }
};

exports.getInstances = async () => {
    try {
        const commitments = await Commitment.find();
        return commitments;
    } catch (error) {
        console.error('Error retrieving instances:', error);
        const err = new Error('Error processing your request');
        err.statusCode = 500;
        err.details = error.message;
        throw err;
    }
};

exports.terminateCommitment = async (req) => {
    try {
        const commitment = await Commitment.findById(req.params.commitmentId);
        if (!commitment) {
            const err = new Error("Commitment not found");
            err.statusCode = 404;
            throw err;
        }

        commitment.status = 'terminated';
        commitment.terminate_timestamp = new Date();
        await commitment.save();
        return commitment;
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = "Error terminating the commitment";
        }
        throw error;
    }
};

exports.cancelCommitment = async (req) => {
    try {
        const commitment = await Commitment.findById(req.params.commitmentId);
        if (!commitment) {
            const err = new Error("Commitment not found");
            err.statusCode = 404;
            throw err;
        }

        commitment.status = 'cancelled';
        commitment.cancel_timestamp = new Date();
        await commitment.save();
        return commitment;
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = "Error cancelling the commitment";
        }
        throw error;
    }
};
