// commitmentRoutes.js

const express = require('express');
const router = express.Router();
const controller = require('../controller/commitmentController');

router.post('/create', async (req, res) => {
    try {
        const commitment = await controller.createCommitment(req);
        res.status(201).json({
            message: "Commitment created successfully",
            commitment: commitment
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Error creating the commitment",
            error: error.details || error.message
        });
    }
});

router.post('/:commitmentId/cancel', async (req, res) => {
    try {
        const commitment = await controller.cancelCommitment(req);
        res.status(200).json({
            message: "Commitment cancelled successfully",
            commitment: commitment
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Error cancelling the commitment",
            error: error.details || error.message
        });
    }
});

router.post('/:commitmentId/terminate', async (req, res) => {
    try {
        const commitment = await controller.terminateCommitment(req);
        res.status(200).json({
            message: "Commitment terminated successfully",
            commitment: commitment
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Error terminating the commitment",
            error: error.details || error.message
        });
    }
});

router.get('/getInstances', async (req, res) => {
    try {
        const commitments = await controller.getInstances();
        res.status(200).json({
            message: "Instances retrieved successfully",
            data: commitments
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Error processing your request",
            error: error.details || error.message
        });
    }
});

// Implement other routes similarly
router.post('/:commitmentId/suspend', async (req, res) => {
    // Implementation for suspending the commitment
});

router.post('/:commitmentId/reactivate', async (req, res) => {
    // Implementation for reactivating the commitment
});

router.post('/:commitmentId/release', async (req, res) => {
    // Implementation for releasing the commitment
});

module.exports = router;
