const express = require('express');
const router = express.Router();
const controller = require('../controller/supervisorController');
const axios = require('axios');

let debtorCloseRequist = false;
let creditorCloseRequest = false;

router.post('/deploy', async (req, res) => {
    try {
        const newSupervisor = await controller.createSupervisor(req);
        const supervisorId = newSupervisor.id;
        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' },
            { rel: 'scopeBegin', method: 'POST', href: '/scopeBegin' }
        ];
        res.status(201).json({ message: 'Supervisor deployed successfully', supervisorId, supervisor: newSupervisor, success: true, links });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const supervisorId = await controller.getSupervisorId();
        res.status(statusCode).json({ message: error.message || 'Error deploying supervisor', supervisorId, success: false });
    }
});

router.post('/scopeBegin', async (req, res) => {
    try {
        const connectionPoint = await controller.getConnectionPoint();
        const supervisorId = await controller.getSupervisorId();

        const instancesResponse = await axios.get('http://localhost:3000/api/commitment/getInstances', { timeout: 5000 });
        const activeCommitments = instancesResponse.data.data.filter(commitment => commitment.status === 'active');

        if (connectionPoint === 'ignore') {
            if (activeCommitments.length > 0) {
                const links = [
                    { rel: 'getStatus', method: 'GET', href: '/getStatus' },
                    { rel: 'scopeEnd', method: 'POST', href: '/scopeEnd' }
                ];
                return res.status(400).json({ message: 'scopeBegin ignored, instances already active', supervisorId, success: false, links });
            }
        } else if (connectionPoint === 'restart') {
            if (activeCommitments.length > 0) {
                const links = [
                    { rel: 'cancelInstance', method: 'POST', href: '/cancelInstance' },
                    { rel: 'scopeEnd', method: 'POST', href: '/scopeEnd' },
                    { rel: 'getStatus', method: 'GET', href: '/getStatus' }
                ];
                return res.status(400).json({ message: 'You must cancel the active instance first', supervisorId, success: false, links });
            }
        } else if (connectionPoint !== 'any' && connectionPoint !== 'all') {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' },
                { rel: 'scopeEnd', method: 'POST', href: '/scopeEnd' },
                { rel: 'scopeBegin', method: 'POST', href: '/scopeBegin' }
            ];
            return res.status(400).json({ message: 'Unsupported connectionPoint type', supervisorId, success: false, links });
        }


        const response = await axios.post('http://localhost:3000/api/commitment/create', {
            connectionPoint: connectionPoint,
            outcome: req.body.outcome
        }, { timeout: 5000 });

        const links = [
            { rel: 'scopeEnd', method: 'POST', href: '/scopeEnd' },
            { rel: 'getStatus', method: 'GET', href: '/getStatus' }
        ];

        if (connectionPoint !== 'ignore' && connectionPoint !== 'restart') {
            links.push({ rel: 'scopeBegin', method: 'POST', href: '/scopeBegin' });
        }

        if (connectionPoint === 'restart') {
            links.push({ rel: 'cancelInstance', method: 'POST', href: '/cancelInstance' });
        }

        res.status(200).json({ message: 'scopeBegin processed successfully', data: response.data, supervisorId, success: true, links });
    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' }
        ];
        res.status(500).json({ message: 'Error processing your request', supervisorId, success: false, links });
    }
});

router.post('/scopeEnd', async (req, res) => {
    console.log('scopeEnd');
    try {
        const connectionPoint = await controller.getConnectionPoint();
        const supervisorId = await controller.getSupervisorId();

        const instancesResponse = await axios.get('http://localhost:3000/api/commitment/getInstances', { timeout: 5000 });
        const activeCommitments = instancesResponse.data.data.filter(commitment => commitment.status === 'active');

        if (activeCommitments.length === 0) {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            return res.status(400).json({
                message: 'No active commitments found.',
                supervisorId,
                success: false,
                links
            });
        }

        if (['ignore', 'restart'].includes(connectionPoint)) {
            const firstCommitmentId = activeCommitments[0]._id;
            await axios.post(`http://localhost:3000/api/commitment/${firstCommitmentId}/terminate`);
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            controller.endSupervisor();
            return res.status(200).json({ message: 'ScopeEnd processed successfully', supervisorId, success: true, links });
        } else if (connectionPoint === 'any') {
            for (let commitment of activeCommitments) {
                await axios.post(`http://localhost:3000/api/commitment/${commitment._id}/terminate`);
            }
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            controller.endSupervisor();
            return res.status(200).json({ message: 'ScopeEnd processed successfully', supervisorId, success: true, links });
        } else if (connectionPoint === 'all') {
            const firstCommitmentId = activeCommitments[0]._id;
            await axios.post(`http://localhost:3000/api/commitment/${firstCommitmentId}/terminate`);
            if (activeCommitments.length === 1) {
                const links = [
                    { rel: 'getStatus', method: 'GET', href: '/getStatus' },
                ];
                controller.endSupervisor();
                return res.status(200).json({ message: 'ScopeEnd processed successfully', supervisorId, success: true, links });
            } else {
                const links = [
                    { rel: 'getStatus', method: 'GET', href: '/getStatus' },
                    { rel: 'scopeEnd', method: 'POST', href: '/scopeEnd' }
                ];
                return res.status(200).json({ message: 'There are still active commitments', supervisorId, success: true, links });
            }
        } else {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            return res.status(400).json({ message: 'Unsupported connectionPoint type', supervisorId, success: false, links });
        }

    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' }
        ];
        const statusCode = error.response?.status || 500;
        res.status(statusCode).json({ message: error.message || 'Error processing your request', supervisorId, success: false, links });
    }
});

router.post('/cancelInstance', async (req, res) => {
    try {
        const connectionPoint = await controller.getConnectionPoint();
        const supervisorId = await controller.getSupervisorId();
        if (connectionPoint !== 'restart') {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            return res.status(400).json({ message: 'Cancellation is only allowed if the connectionPoint is "restart".', supervisorId, success: false, links });
        }

        const instancesResponse = await axios.get('http://localhost:3000/api/commitment/getInstances', { timeout: 5000 });
        const activeCommitments = instancesResponse.data.data.filter(commitment => commitment.status === 'active');

        if (activeCommitments.length === 0) {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' },
                { rel: 'scopeBegin', method: 'POST', href: '/scopeBegin' }
            ];
            return res.status(400).json({ message: 'No active commitments to cancel.', supervisorId, success: false, links });
        }

        const commitment = activeCommitments[0];
        const cancelUrl = `http://localhost:3000/api/commitment/${commitment._id}/cancel`;
        const cancelResponse = await axios.post(cancelUrl);

        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' },
            { rel: 'scopeBegin', method: 'POST', href: '/scopeBegin' }
        ];

        if (cancelResponse.status === 200) {
            res.status(200).json({ message: 'Commitment cancelled successfully', supervisorId, success: true, data: cancelResponse.data, links });
        } else {
            res.status(cancelResponse.status).json({ message: 'Failed to cancel commitment', supervisorId, success: false, error: cancelResponse.data, links });
        }
    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' }
        ];
        res.status(500).json({
            message: 'Error processing your request',
            supervisorId,
            success: false,
            error: error.message || 'Internal Server Error',
            links
        });
    }
});

router.get('/getStatus', async (req, res) => {
    try {
        const supervisorId = await controller.getSupervisorId();
        const instancesResponse = await axios.get('http://localhost:3000/api/commitment/getInstances');
        const commitments = instancesResponse.data.data;

        let globalStatus = 'terminated';
        for (let commitment of commitments) {
            if (commitment.status === 'active') {
                globalStatus = 'active';
                break;
            }
        }

        res.status(200).json({ globalStatus: globalStatus, supervisorId, success: true });
    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        res.status(500).json({
            message: 'Error processing your request',
            supervisorId,
            success: false,
            error: error.message
        });
    }
});

router.get('/getInstances', async (req, res) => {
    try {
        const supervisorId = await controller.getSupervisorId();
        const supervisors = await controller.getInstances();
        res.status(200).json({
            message: "Supervisors retrieved successfully",
            supervisorId,
            success: true,
            data: supervisors
        });
    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        res.status(500).json({
            message: 'Error processing your request',
            supervisorId,
            success: false,
            error: error.message
        });
    }
});

router.post('/closeCommitment', async (req, res) => {
    try {
        const supervisorId = await controller.getSupervisorId();
        const instancesResponse = await axios.get('http://localhost:3000/api/commitment/getInstances', { timeout: 5000 });
        const allCommitments = instancesResponse.data.data;

        if (req.body.identity === 'debtor') {
            debtorCloseRequist = true;
        }
        if (req.body.identity === 'creditor') {
            creditorCloseRequest = true;
        }


        
        if (debtorCloseRequist && creditorCloseRequest) {
            if (allCommitments.length === 0) {
                const links = [
                    { rel: 'getStatus', method: 'GET', href: '/getStatus' }
                ];
                await controller.endSupervisor();
                res.status(400).json({ message: 'No commitments found to close.', supervisorId, success: false, links });
                process.exit(0);
            }

            for (let commitment of allCommitments) {
                await axios.post(`http://localhost:3000/api/commitment/${commitment._id}/terminate`);
            }

            await controller.endSupervisor();
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];

            const response = await axios.get('http://localhost:3000/api/commitment/getInstances', { timeout: 5000 });
            const commitmentList = response.data.data;
            
            res.status(200).json({ message: 'All commitments closed and supervisor terminated successfully', supervisorId, success: true, links, commitmentList });
            process.exit(0);
        } else {
            const links = [
                { rel: 'getStatus', method: 'GET', href: '/getStatus' }
            ];
            res.status(200).json({ message: 'Waiting for all parties to request to close commitments', supervisorId, success: true, links });
        }
    } catch (error) {
        const supervisorId = await controller.getSupervisorId();
        const links = [
            { rel: 'getStatus', method: 'GET', href: '/getStatus' }
        ];
        res.status(500).json({
            message: 'Error processing your request',
            supervisorId,
            success: false,
            error: error.message || 'Internal Server Error',
            links
        });
        process.exit(1);
    }
});

module.exports = router;