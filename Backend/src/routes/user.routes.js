import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getCurrentUser, loginUser, logoutUser,forgotPassword,resetPassword, refreshAccessToken, registerUser, setupVault, getVaultMeta, rotateVault } from '../controllers/user.controller.js';

const router= Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:token').post(resetPassword);
router.route('/vault/setup').post(verifyJWT,setupVault);
router.route('/vault/meta').get(verifyJWT,getVaultMeta);
router.route('/vault/rotate').patch(verifyJWT,rotateVault);

//SECURED ROUTES
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/getcurrentuser').get(verifyJWT,getCurrentUser);

export default router;
