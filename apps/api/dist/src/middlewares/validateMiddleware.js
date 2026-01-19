"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = void 0;
const validateData = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            // El error será capturado por el Global Error Handler
            return next(error);
        }
    };
};
exports.validateData = validateData;
