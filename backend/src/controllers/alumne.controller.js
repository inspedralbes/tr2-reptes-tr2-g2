const Alumne = require('../models/alumne.model');

const getAllAlumnes = async (req, res) => {
    try {
        const alumnes = await Alumne.findAll();
        res.status(200).json(alumnes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAlumnes
};
