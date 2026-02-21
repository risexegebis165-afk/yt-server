const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req,res)=>{
  res.send("YT Server Running 🚀");
});

// Video info (quality list)
app.get("/info", async (req,res)=>{
  try{
    const info = await ytdl.getInfo(req.query.url);
    res.json(info.formats);
  }catch(err){
    res.status(500).send("Error fetching info");
  }
});

// MP4 Download
app.get("/mp4", (req,res)=>{
  const url = req.query.url;
  res.header("Content-Disposition","attachment; filename=video.mp4");
  ytdl(url,{quality:"highestvideo"}).pipe(res);
});

// MP3 Download
app.get("/mp3", (req,res)=>{
  const url = req.query.url;
  res.header("Content-Disposition","attachment; filename=audio.mp3");
  ytdl(url,{filter:"audioonly"}).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server Started"));
