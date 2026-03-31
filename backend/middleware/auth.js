const admin = require('firebase-admin');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).send('Unauthorized access');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).send('Unauthorized access');
    }
};