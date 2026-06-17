import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getCurrentUser, loginUser, logoutUser,forgotPassword,resetPassword, refreshAccessToken, registerUser, setupVault, getVaultMeta, rotateVault } from '../controllers/user.controller.js';
import { createRedisRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router= Router();

const loginRateLimit = createRedisRateLimiter({
    prefix: "login",
    limit: 10,
    windowSeconds: 15 * 60,
});

const registerRateLimit = createRedisRateLimiter({
    prefix: "register",
    limit: 5,
    windowSeconds: 60 * 60,
});

const forgotPasswordRateLimit = createRedisRateLimiter({
    prefix: "forgotpassword",
    limit: 3,
    windowSeconds: 15 * 60,
    keyFn: (req) => req.body?.email || req.ip || "unknown",
});

router.route('/register').post(registerRateLimit, registerUser);
router.route('/login').post(loginRateLimit, loginUser);
router.route('/forgotpassword').post(forgotPasswordRateLimit, forgotPassword);
router.route('/resetpassword/:token').post(resetPassword);
router.route('/vault/setup').post(verifyJWT,setupVault);
router.route('/vault/meta').get(verifyJWT,getVaultMeta);
router.route('/vault/rotate').patch(verifyJWT,rotateVault);

//SECURED ROUTES
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/getcurrentuser').get(verifyJWT,getCurrentUser);

export default router;
