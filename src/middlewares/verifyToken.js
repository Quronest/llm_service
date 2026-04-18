import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PUBLIC_KEY = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];

  // Verify RSA token
  const decoded = jwt.verify(token, PUBLIC_KEY, {
    algorithms: ['RS256'],
  });

  // Invalid payload type
  if (decoded.type !== 'service') {
    throw new ApiError(403, 'Forbidden: Invalid token type');
  }

  // attach decoded payload
  req.user = decoded;

  next();
});