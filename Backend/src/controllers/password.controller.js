import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Password} from "../models/password.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { queueAuditEvent } from "../utils/auditStream.js";
import { getClientIp } from "../utils/redisAuth.js";
export const addPassword = asyncHandler(async (req, res) => 
{
    const { websiteName, websiteURL, ciphertext, iv, version = 1 } = req.body;

    if (!websiteName || !websiteURL || !ciphertext || !iv) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const newPasswordEntry = await Password.create({
        user: req.user._id,
        websiteName,
        websiteURL,
        ciphertext,
        iv,
        version,
    });

    await queueAuditEvent({
        userId: req.user._id,
        type: "password_created",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.user.email,
        metadata: {
            passwordId: newPasswordEntry._id,
            websiteName,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newPasswordEntry, "Password saved successfully"));
});

export const deletePassword = asyncHandler(async (req, res) => 
{
    const {passwordID}=req.params;

    const deletedEntry = await Password.findOneAndDelete({
        _id: passwordID,
        user: req.user._id,
    });

    if (!deletedEntry) {
        throw new ApiError(404, "Password entry not found");
    }

    await queueAuditEvent({
        userId: req.user._id,
        type: "password_deleted",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.user.email,
        metadata: {
            passwordId,
            websiteName: deletedEntry.websiteName,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200,{},"Password entry deleted successfully"));
});

export const updatePassword = asyncHandler(async (req, res) => {
    const { passwordID } = req.params;
    const { websiteName, websiteURL, ciphertext, iv, version } = req.body;

    const passwordEntry = await Password.findOne({
        _id: passwordID,
        user: req.user._id,
    });

    if (!passwordEntry) {
        throw new ApiError(404, "Password entry not found");
    }

    if (websiteName !== undefined) passwordEntry.websiteName = websiteName;
    if (websiteURL !== undefined) passwordEntry.websiteURL = websiteURL;
    if (ciphertext !== undefined) passwordEntry.ciphertext = ciphertext;
    if (iv !== undefined) passwordEntry.iv = iv;
    if (version !== undefined) passwordEntry.version = version;

    await passwordEntry.save();

    await queueAuditEvent({
        userId: req.user._id,
        type: "password_updated",
        status: "success",
        severity: "info",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.user.email,
        metadata: {
            passwordId,
            websiteName: passwordEntry.websiteName,
        },
    });

    return res.status(200).json(new ApiResponse(200,passwordEntry,"Password entry updated successfully"));
});

export const getallPasswords=asyncHandler(async(req,res)=>{
    const passwords = await Password.find({ user: req.user._id })
        .select("_id websiteName websiteURL updatedAt")
        .sort({ updatedAt: -1 });

    return res.status(200).json(new ApiResponse(200,passwords,"Passwords Fetched Successfully"));
});

export const getPassword = asyncHandler(async (req, res) => {
    const { passwordID } = req.params;

    const passwordEntry = await Password.findOne({
        _id: passwordID,
        user: req.user._id,
    }).select("_id websiteName websiteURL ciphertext iv version");

    if (!passwordEntry) {
        throw new ApiError(404, "Password entry not found");
    }

    return res.status(200).json(new ApiResponse(200, passwordEntry, "Password Fetched Successfully"));
});
