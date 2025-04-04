const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
    id: String,
    type: String,
    position: {
        x: Number,
        y: Number,
    },
    data: {
        label: String,
        subject: String,
        body: String,
        delayTime: Number,
        leadSource: String
    }
});

const edgeSchema = new mongoose.Schema({
    id: String,
    source: String,
    target: String,
    sourceHandle: String,
    targetHandle: String,
    type: String
});

const flowSchema = new mongoose.Schema(
    {
        name: { type: String, required: true},
        nodes: [nodeSchema],
        edges: [edgeSchema],
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Flow = mongoose.model("Flow", flowSchema);

module.exports = Flow;