const jwt = require('jsonwebtoken');
const { JWTPASS } = require('../utilities/config');


const auth = {
    auth_middleware: async (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(400).json({ message: 'Invalid Token' });
        }

        const getToken = (request) => {
            const Auth = request.get('authorization');
            if (Auth && Auth.toLowerCase().startsWith('bearer ')) {
                return Auth.substring(7);
            }
            return null;
        };

        try {
            jwt.verify(getToken(req), JWTPASS, (error, decoded) => {
                if (error) {
                    return res.status(400).json({ message: 'Token error' });
                }
                req.user = decoded;
                next();
            });
        } catch (e) {
            console.log('Token error', e);
        }
    }
};

module.exports = auth;