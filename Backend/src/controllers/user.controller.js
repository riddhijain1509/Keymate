import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendemail.js'
import crypto from 'crypto';
import { AuditLog } from "../models/auditLog.model.js";
import {
    clearFailedLoginAttempts,
    consumeResetToken,
    getClientIp,
    recordFailedLoginAttempt,
    storeResetToken,
} from "../utils/redisAuth.js";
import { queueAuditEvent } from "../utils/auditStream.js";
import { getDeviceContext, upsertKnownDevice } from "../utils/deviceFingerprint.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went Wrong in generating tokens");
    }
};

const registerUser= asyncHandler( async (req,res)=>{
    const {username,fullname,email,password}=req.body;
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    });
    if(existedUser){
        await queueAuditEvent({
            type: "register_failed",
            status: "failed",
            severity: "warning",
            ip: getClientIp(req),
            route: req.originalUrl,
            identifier: email || username,
            metadata: {
                reason: "user_already_exists",
            },
        });
        return res.status(400).json(new ApiResponse(400,null,"User already exists"));
    }
    const user=await User.create({fullname,email,password,username});
    const createUser= await User.findById(user._id).select("-password -refreshToken -vaultKeyMeta");
    if(!createUser)return res.status(400).json(new ApiResponse(400,null,"Server Error"));
    await queueAuditEvent({
        userId: user._id,
        type: "register_success",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            username: user.username,
        },
    });
    return res.status(200).json(new ApiResponse(200,createUser,"Registered Successfully"))
});

const loginUser= asyncHandler(async(req,res)=>{
    const {text,password}=req.body;
    const clientIp = getClientIp(req);
    const deviceContext = getDeviceContext(req);
    const user = await User.findOne({
        $or: [{ email: text }, { username: text }] 
    });
    //vaildation
    if(!user){
        const failure = await recordFailedLoginAttempt({ identifier: text, ip: clientIp });
        await queueAuditEvent({
            type: failure?.blocked ? "login_rate_limited" : "login_failed",
            status: failure?.blocked ? "blocked" : "failed",
            severity: "warning",
            ip: clientIp,
            route: req.originalUrl,
            identifier: text,
            metadata: {
                reason: "user_not_found",
                userCount: failure?.userCount ?? null,
                ipCount: failure?.ipCount ?? null,
            },
        });
        if (failure?.blocked) {
            return res.status(429).json(new ApiResponse(429,null,"Too many login attempts. Please try again later."));
        }
        return res.status(400).json(new ApiResponse(400,null,"Invalid Email or User Does not exist"));
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        const failure = await recordFailedLoginAttempt({ identifier: user.email || text, ip: clientIp });
        await queueAuditEvent({
            userId: user._id,
            type: failure?.blocked ? "login_rate_limited" : "login_failed",
            status: failure?.blocked ? "blocked" : "failed",
            severity: "warning",
            ip: clientIp,
            route: req.originalUrl,
            identifier: user.email || text,
            metadata: {
                reason: "invalid_password",
                userCount: failure?.userCount ?? null,
                ipCount: failure?.ipCount ?? null,
            },
        });
        if (failure?.blocked) {
            return res.status(429).json(new ApiResponse(429,null,"Too many login attempts. Please try again later."));
        }
        return res.status(400).json(new ApiResponse(400,null,"Invalid password"));
    }

    await clearFailedLoginAttempts({ identifier: user.email || text, ip: clientIp });
    const deviceResult = upsertKnownDevice(user, deviceContext);
    await user.save({ validateBeforeSave: false });
    await queueAuditEvent({
        userId: user._id,
        type: "login_success",
        status: "success",
        severity: "info",
        ip: clientIp,
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            username: user.username,
            deviceLabel: deviceResult.deviceLabel,
        },
    });
    if (deviceResult.isNewDevice) {
        await queueAuditEvent({
            userId: user._id,
            type: "login_from_new_device",
            status: "success",
            severity: "warning",
            ip: clientIp,
            route: req.originalUrl,
            identifier: user.email,
            metadata: {
                username: user.username,
                deviceLabel: deviceResult.deviceLabel,
                reason: "first_seen_device",
            },
        });
    }
    
    //token generation
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken -vaultKeyMeta");
    
    const options={
        httpOnly:true,          
        secure:true ,            
        sameSite:'strict'
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"USER LOGGED IN SUCCESSFULLY"))
});

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1
            }
        },
        {new : true}
    )

    const options={
        httpOnly:true,          
        secure:true ,       
        sameSite:'strict'
    }

    await queueAuditEvent({
        userId: req.user._id,
        type: "logout_success",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.user.email,
    });

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully"))
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken)return res.status(400).json(new ApiResponse(400, null, "Refresh token is missing"));
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user || incomingRefreshToken!==user?.refreshToken)
        {   
            return res.status(401).json(new ApiResponse(401, null, "Invalid or expired refresh token"));
        }
        const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
        const options={
            httpOnly:true,          
            secure:true ,         
            sameSite: 'Strict'
        }
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken},"ACCESS TOKEN REFRESHED SUCCESSFULLY"))
    } catch (error) {
        return res.status(404).json(new ApiResponse(401,{},"plz logout"));
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) return res.status(400).json(new ApiResponse(400, null, "User not authenticated"));
    const curruser = await User.aggregate([
        {
            $match: {
                username: req.user.username
            }
        },
        {
            $project: {
                password: 0 ,
                refreshToken:0,
                vaultKeyMeta:0,
                _id:0
            }
        }
    ]);

    if (curruser?.length == 0) return res.status(400).json(new ApiResponse(400, {}, "User Does Not exist"));

    return res.status(200).json(new ApiResponse(200, curruser[0], "User Fetched Successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const {email}=req.body;
    const user=await User.findOne({email});
    if (!user){
        await queueAuditEvent({
            type: "forgot_password_failed",
            status: "failed",
            severity: "warning",
            ip: getClientIp(req),
            route: req.originalUrl,
            identifier: email,
            metadata: {
                reason: "user_not_found",
            },
        });
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const redisStored = await storeResetToken({ email: user.email, userId: user._id, token: resetToken });
    if (!redisStored) {
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000;
    } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
    }
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONT_END_URL}/setpassword/${resetToken}`;
    await sendEmail(
        user.email,
        "Password Reset Request",
        `You requested a password reset. Please use the link below to reset your password: \n\n ${resetUrl}`
    );
    await queueAuditEvent({
        userId: user._id,
        type: "forgot_password_requested",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            storage: redisStored ? "redis" : "mongodb",
        },
    });
    return res.status(200).json(new ApiResponse(200, null, "Password reset link sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    if(!newPassword){
        await queueAuditEvent({
            type: "password_reset_failed",
            status: "failed",
            severity: "warning",
            ip: getClientIp(req),
            route: req.originalUrl,
            metadata: {
                reason: "missing_new_password",
            },
        });
        return res.status(404).json(new ApiResponse(404, null, "Please enter new password"));
    }
    const redisReset = await consumeResetToken(token);
    let user = null;

    if (redisReset?.userId) {
        user = await User.findById(redisReset.userId);
    } else {
        user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });
    }

    if (!user) {
        await queueAuditEvent({
            type: "password_reset_failed",
            status: "failed",
            severity: "warning",
            ip: getClientIp(req),
            route: req.originalUrl,
            metadata: {
                reason: "invalid_or_expired_token",
                storage: redisReset ? "redis" : "mongodb",
            },
        });
        return res.status(400).json(new ApiResponse(400, null, "Invalid or expired token"));
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await queueAuditEvent({
        userId: user._id,
        type: "password_reset_success",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            storage: redisReset ? "redis" : "mongodb",
        },
    });
    return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

const setupVault = asyncHandler(async (req, res) => {
    const { vaultKeyMeta } = req.body;

    if (
        !vaultKeyMeta?.encryptedDEK ||
        !vaultKeyMeta?.salt ||
        !vaultKeyMeta?.kdf ||
        !vaultKeyMeta?.recoveryKeyMeta?.encryptedDEK
    ) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid vault metadata"));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (user.vaultKeyMeta?.encryptedDEK) {
        await queueAuditEvent({
            userId: user._id,
            type: "vault_create_failed",
            status: "failed",
            severity: "warning",
            ip: getClientIp(req),
            route: req.originalUrl,
            identifier: user.email,
            metadata: {
                reason: "vault_already_initialized",
            },
        });
        return res.status(409).json(new ApiResponse(409, null, "Vault already initialized"));
    }

    user.vaultKeyMeta = {
        version: vaultKeyMeta.version ?? 2,
        mode: vaultKeyMeta.mode ?? "master-password",
        encryptedDEK: vaultKeyMeta.encryptedDEK,
        salt: vaultKeyMeta.salt,
        kdf: vaultKeyMeta.kdf,
        recoveryKeyMeta: vaultKeyMeta.recoveryKeyMeta,
    };

    await user.save({ validateBeforeSave: false });
    await queueAuditEvent({
        userId: user._id,
        type: "vault_created",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            mode: user.vaultKeyMeta.mode,
            version: user.vaultKeyMeta.version,
        },
    });

    return res.status(200).json(new ApiResponse(200, user.vaultKeyMeta, "Vault setup saved successfully"));
});

const getVaultMeta = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("vaultKeyMeta");
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (!user.vaultKeyMeta?.encryptedDEK) {
        return res.status(200).json(
            new ApiResponse(200, { hasVault: false, vaultKeyMeta: null }, "Vault not initialized")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { hasVault: true, vaultKeyMeta: user.vaultKeyMeta }, "Vault metadata fetched successfully")
    );
});

const rotateVault = asyncHandler(async (req, res) => {
    const { vaultKeyMeta } = req.body;

    if (
        !vaultKeyMeta?.encryptedDEK ||
        !vaultKeyMeta?.salt ||
        !vaultKeyMeta?.kdf ||
        !vaultKeyMeta?.recoveryKeyMeta?.encryptedDEK
    ) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid vault metadata"));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    if (!user.vaultKeyMeta?.encryptedDEK) {
        return res.status(404).json(new ApiResponse(404, null, "Vault not initialized"));
    }

    user.vaultKeyMeta = {
        version: vaultKeyMeta.version ?? 2,
        mode: vaultKeyMeta.mode ?? "master-password",
        encryptedDEK: vaultKeyMeta.encryptedDEK,
        salt: vaultKeyMeta.salt,
        kdf: vaultKeyMeta.kdf,
        recoveryKeyMeta: vaultKeyMeta.recoveryKeyMeta,
    };

    await user.save({ validateBeforeSave: false });
    await queueAuditEvent({
        userId: user._id,
        type: "vault_rotated",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            mode: user.vaultKeyMeta.mode,
            version: user.vaultKeyMeta.version,
        },
    });
    await queueAuditEvent({
        userId: user._id,
        type: "recovery_key_regenerated",
        status: "success",
        severity: "warning",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: user.email,
        metadata: {
            reason: "vault_rotation",
            version: user.vaultKeyMeta.version,
        },
    });

    return res.status(200).json(new ApiResponse(200, user.vaultKeyMeta, "Vault keys rotated successfully"));
});

const reportVaultUnlockFailure = asyncHandler(async (req, res) => {
    const { failedCount, method } = req.body;
    const normalizedCount = Number(failedCount);

    if (!Number.isFinite(normalizedCount) || normalizedCount < 3) {
        return res.status(400).json(new ApiResponse(400, null, "Failed unlock count must be at least 3"));
    }

    await queueAuditEvent({
        userId: req.user._id,
        type: "vault_unlock_failed_multiple",
        status: "failed",
        severity: "warning",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.user.email,
        metadata: {
            reason: "repeated_unlock_failures",
            unlockMethod: method === "recovery" ? "recovery" : "master",
            failedCount: normalizedCount,
        },
    });

    return res.status(200).json(new ApiResponse(200, null, "Vault unlock failure recorded"));
});

const getAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({ user: req.user._id })
        .sort({ occurredAt: -1 })
        .limit(50);

    return res
        .status(200)
        .json(new ApiResponse(200, logs, "Audit logs fetched successfully"));
});

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser,forgotPassword,resetPassword,setupVault,getVaultMeta,rotateVault,getAuditLogs,reportVaultUnlockFailure };
