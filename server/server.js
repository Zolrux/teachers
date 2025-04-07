const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const {Teacher, Statistic} = require("./db/schema");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let onlineUsers = 0;

app.use(express.static("../public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("../public/pages/index.html"));
});

app.get("/test", (req, res) => {
  if (req?.query?.mode === "classic") {
    return res.sendFile(path.resolve("../public/pages/test-classic.html"));
  }
  else if (req?.query?.mode === "mountain") {
    return res.sendFile(path.resolve("../public/pages/test-mountain.html"));
  }
});

app.get("/results", (req, res) => {
  res.sendFile(path.resolve("../public/pages/results.html"));
});

app.get("/statistic", async (req, res) => {
  res.sendFile(path.resolve("../public/pages/statistic.html"));
});

app.get("/api/statistics", async (req, res) => {
  const mode = req.query?.mode;

  const stats = await Statistic.find()
  .populate('teacher')
  .sort({
    [`${mode}.wins`]: -1,
    [`${mode}.selectedCount`]: -1,
  });

  if (!stats.length) {
    return res.status(500).json({ error: "Fields are empty" });
  }

  return res.status(200).json(stats);
});

app.get("/api/teachers", async (req, res) => {
  try {
      const count = +req?.query?.count;
      const teachers = await Teacher.aggregate([
        {$sample: {size: count}}
      ]); 
      return res.status(200).json(teachers);
  } catch (err) {
     console.error("Error fetching teachers:", err);
     return res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

app.post("/api/win", async (req, res) => {
  try {
      const {winner, loosersArr, mode} = req?.body;

      async function updateTeachersData(mode) {
        try {
          const updatePromises = loosersArr.map(async (obj) => {
            return await Statistic.findOneAndUpdate(
              { teacher: obj.teacher._id },
              {
                $set: { [`${mode}.selectedCount`]: obj.selectedCount },
              },
              { new: true }
            );
          });
      
          const result = await Promise.all(updatePromises);
          return result;
        } catch (error) {
          console.error('Error to updated datas:', error);
        }
      }
      
      if (mode === "classic") {

        const query = await Statistic.findOneAndUpdate(
          { teacher: winner.teacher._id },
          { 
            $inc: {"classicMode.wins": 1},
            $set: {"classicMode.selectedCount": winner.selectedCount}
          },
          { new: true }
        )

        await updateTeachersData("classicMode");

        return res.status(200).json('Classic mode wins value was updated succesfully');
      }
      else if (mode === "mountain") {

        await Statistic.findOneAndUpdate(
          { teacher: winner.teacher._id },
          { 
            $inc: {"mountainMode.wins": 1},
            $set: {"mountainMode.selectedCount": winner.selectedCount}
          },
          { new: true }
        )
        
        await updateTeachersData("mountainMode");

        return res.status(200).json('Mountain mode wins value was updated succesfully');
      }

  } catch (err) {
    console.error("Error updated values:", err);
    return res.status(500).json({ error: "Error updated values" });
  }
});

// (async () => {
//   const teachers = await Teacher.find({});

//   const statisticsData = teachers.map((teacher) => ({
//     teacher: teacher._id, // Привязываем к ID преподавателя
//     classicMode: {
//       wins: 0,
//       selectedCount: 0,
//     },
//     mountainMode: {
//       wins: 0,
//       selectedCount: 0,
//     },
//   }));
  
//   await Statistic.insertMany(statisticsData);
// })()

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("updateOnlineCount", onlineUsers); // Notify all clients
  // console.log("A user connected. Online users:", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("updateOnlineCount", onlineUsers); // Notify all clients
    // console.log("A user disconnected. Online users:", onlineUsers);
  });
});

const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL)
  .then((res) => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB connection error"));

const PORT = process.env.PORT;

server
  .listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

