const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

exports.generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).send('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Attach decoded user info to request
        next();
    } catch (err) {
        res.status(401).send('Invalid or expired token.');
    }
};
