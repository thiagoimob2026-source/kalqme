const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        console.log('Auth Middleware: No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY', (err, user) => {
        if (err) {
            console.log('Auth Middleware: Verification failed', err.message);
            return res.sendStatus(403);
        }
        console.log('Auth Middleware: Verified user', user.id);
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
