const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Look for the token in the headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Security token missing.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token string

    try {
        // 2. Verify the token against your secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the user's data (id, name, role) to the request object
        req.user = verified; 
        next(); // Let them pass
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired security token.' });
    }
};

module.exports = verifyToken;