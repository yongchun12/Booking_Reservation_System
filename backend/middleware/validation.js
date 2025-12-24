// Simple validation middleware
// In a production app, use express-validator or Joi

const validateRegister = (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    next();
};

const validateBooking = (req, res, next) => {
    const { resource_id, booking_date, start_time, end_time } = req.body;
    if (!resource_id || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ message: 'Missing required booking fields' });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateBooking
};
