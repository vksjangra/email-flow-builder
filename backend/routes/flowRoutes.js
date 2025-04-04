const express = require("express");
const router = express.Router();
const Flow = require("../models/Flow.js");
const agenda = require("../agenda.js");

router.post("/schedule-email", async (req, res) => {
    try {
        const { email, subject, body, delayTime } = req.body;

        // Schedule email after delayTime (in minutes)
        await agenda.schedule(`${delayTime} minutes from now`, "send email", { to: email, subject, body});

        res.status(200).json({ message: `Email scheduled after ${delayTime} minutes.`});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error scheduling email."});
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, nodes, edges } = req.body;
        const newFlow = new Flow({ name, nodes, edges});
        await newFlow.save();
        res.status(201).json(newFlow);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/", async (req, res) => {
    try {
         // Fetch all flows
         const flows = await Flow.find();  

         // Handle case when no flows exist
         if (!flows.length) {
             return res.status(200).json({ message: "No flows found", data: [] });
         }
 
         // Return the flow data
         res.status(200).json(flows);
    } catch (error) {
        console.error("Error fetching flows:", error);  // Logs full error details
        res.status(500).json({ message: "Server error", error: error.message || error });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const flow = await Flow.findById(req.params.id);
        if (!flow) return res.status(404).json({ message: "Flowchart not found"});
        res.status(200).json(flow);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedFlow = await Flow.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!updatedFlow) return res.status(404).json({ message: "Flowchart not found" });
        res.status(200).json(updatedFlow);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedFlow = await Flow.findByIdAndDelete(req.params.id);
        if (!deletedFlow) return res.status(404).json({ message: "Flowchart not found" });
        res.status(200).json({ message: "Flowchart deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;