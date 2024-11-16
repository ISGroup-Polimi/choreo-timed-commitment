const Supervisor = require('../model/supervisorModel');

exports.createSupervisor = async (req) => {
    try {
        // Check if a supervisor already exists
        const existingSupervisor = await Supervisor.findOne({ status: { $ne: "ended" } });
        if (existingSupervisor) {
            const error = new Error("An active Supervisor instance already exists.");
            error.statusCode = 409;
            throw error;
        }

        // Create a new supervisor
        const newSupervisor = new Supervisor({
            status: req.body.status,
            connectionPoint: req.body.connectionPoint
        });

        await newSupervisor.save();
        return newSupervisor;
    } catch (error) {
        throw error;
    }
};

exports.getConnectionPoint = async () => {
    try {
        const supervisor = await Supervisor.findOne({ status: { $ne: 'ended' } });
        return supervisor ? supervisor.connectionPoint : null;
    } catch (error) {
        console.error('Failed to fetch supervisor:', error);
        throw error;
    }
};

exports.endSupervisor = async () => {
    try {
        const supervisor = await Supervisor.findOne({ status: { $ne: 'ended' } });
        if (!supervisor) {
            console.error("No active supervisor found");
            return false;
        }

        supervisor.status = 'ended';
        await supervisor.save();
        console.log("Supervisor ended successfully");
        return true;
    } catch (error) {
        console.error('Error ending the supervisor:', error);
        throw error;
    }
};

exports.getInstances = async () => {
    try {
        const supervisors = await Supervisor.find();
        return supervisors;
    } catch (error) {
        console.error('Error retrieving the supervisor:', error);
        throw error;
    }
};

exports.getSupervisorId = async () => {
    try {
        const supervisor = await Supervisor.findOne();
        return supervisor ? supervisor._id : null;
    } catch (error) {
        console.error('Failed to fetch supervisor:', error);
        throw error;
    }
};