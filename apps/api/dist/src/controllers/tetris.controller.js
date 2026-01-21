"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerTetris = void 0;
const tetris_service_1 = require("../services/tetris.service");
const shared_1 = require("@iter/shared");
const triggerTetris = async (req, res) => {
    const { role } = req.user;
    if (role !== shared_1.ROLES.ADMIN) {
        return res.status(403).json({ error: 'Only admins can trigger the assignment process.' });
    }
    try {
        const result = await (0, tetris_service_1.runTetris)();
        res.json({
            message: 'Tetris assignment completed successfully.',
            stats: result.stats,
            assignmentsCreated: result.createdAssignments.length
        });
    }
    catch (error) {
        console.error('Tetris Error:', error);
        res.status(500).json({ error: 'An error occurred during the Tetris assignment process.' });
    }
};
exports.triggerTetris = triggerTetris;
