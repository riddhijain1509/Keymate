import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "success",
    },
    severity: {
      type: String,
      required: true,
      default: "info",
    },
    ip: {
      type: String,
      default: null,
    },
    route: {
      type: String,
      default: null,
    },
    identifier: {
      type: String,
      default: null,
      index: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    source: {
      type: String,
      default: "app",
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, occurredAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
