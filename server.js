const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const { exec } = require("child_process");

const app = express();
app.use(cors());

app.get("/", (req,res)=>{
  res.send("YT Server Running 🚀");
});

// 🔹 Get MP4 Formats (Quality List)
app.get("/formats", async (req,res)=>{
  try{
    const info = await ytdl.getInfo(req.query.url);
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio')
      .map(f => ({
        quality: f.qualityLabel,
        itag: f.itag
      }));
    res.json(formats);
  }catch(err){
    res.status(500).json({error:"Failed"});
  }
});

// 🔹 Download Selected Quality
app.get("/download", (req,res)=>{
  const url = req.query.url;
  const itag = req.query.itag;

  res.header("Content-Disposition","attachment; filename=video.mp4");

  ytdl(url,{ quality: itag }).pipe(res);
});

// 🔹 Playlist Download (ZIP)
app.get("/playlist", (req,res)=>{
  const url = req.query.url;

  exec(`yt-dlp -f mp4 -o "%(title)s.%(ext)s" ${url}`, (err)=>{
    if(err) return res.send("Error downloading playlist");
    res.send("Playlist Download Started on Server");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server Running"));app.listen(PORT, ()=> console.log("Server Started"));
