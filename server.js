const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");

const app = express();
app.use(cors());

app.get("/", (req,res)=>{
  res.send("YT Server Running 🚀");
});

// 🔹 Video Info (Title + Thumbnail + MP3 formats)
app.get("/info", async (req,res)=>{
  try{
    const info = await ytdl.getInfo(req.query.url);

    const audioFormats = ytdl.filterFormats(info.formats, "audioonly")
      .map(f => ({
        itag: f.itag,
        bitrate: f.audioBitrate + " kbps",
        container: f.container
      }));

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      audios: audioFormats
    });

  }catch(err){
    res.status(500).json({error:"Failed"});
  }
});

// 🔹 MP3 Download (Selected Quality)
app.get("/mp3", (req,res)=>{
  const url = req.query.url;
  const itag = req.query.itag;

  res.header("Content-Disposition","attachment; filename=audio.mp3");

  ytdl(url,{ quality: itag, filter:"audioonly" }).pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server Running"));
