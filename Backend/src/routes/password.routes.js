import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {addPassword, deletePassword, getallPasswords, getPassword, updatePassword} from '../controllers/password.controller.js'
const router= Router();

//SECURED ROUTES
router.route('/addpassword').post(verifyJWT,addPassword);
router.route("/deletePassword/:passwordID").delete(verifyJWT, deletePassword);
router.route("/updatePassword/:passwordID").patch(verifyJWT, updatePassword);
router.route("/allpasswords").get(verifyJWT, getallPasswords);
router.route("/getpassword/:passwordID").get(verifyJWT, getPassword);

export default router
