const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());

app.get("/", (req,res)=>{
  res.send("YT Server Running 🚀");
});

// 🔹 Get All Formats
app.get("/info", async (req,res)=>{
  try{
    const info = await ytdl.getInfo(req.query.url);

    const videoFormats = ytdl.filterFormats(info.formats,"videoandaudio")
      .map(f=>({
        itag: f.itag,
        quality: f.qualityLabel,
        container: f.container
      }))
      .filter(f=>f.quality);

    const audioFormats = ytdl.filterFormats(info.formats,"audioonly")
      .map(f=>({
        itag: f.itag,
        bitrate: f.audioBitrate + " kbps",
        container: f.container
      }));

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      videos: videoFormats,
      audios: audioFormats
    });

  }catch(err){
    res.status(500).json({error:"Failed"});
  }
});

// 🔹 MP4 Download
app.get("/mp4",(req,res)=>{
  const {url, itag} = req.query;
  res.header("Content-Disposition","attachment; filename=video.mp4");
  ytdl(url,{quality:itag}).pipe(res);
});

// 🔹 MP3 Download
app.get("/mp3",(req,res)=>{
  const {url, itag} = req.query;
  res.header("Content-Disposition","attachment; filename=audio.mp3");
  ytdl(url,{quality:itag, filter:"audioonly"}).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server Running"));
