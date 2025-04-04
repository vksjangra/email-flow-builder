require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const flowRoutes = require("./routes/flowRoutes.js");


const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());
app.use("/api/flows", flowRoutes);


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error: ", err));


app.get("/", (req, res) => {
    res.send("Flowchart Backend is Running! 🚀");
})

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
})