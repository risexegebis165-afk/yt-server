const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core'); 
const app = express();

app.use(cors());

// সার্ভার সচল আছে কি না দেখার জন্য
app.get('/', (req, res) => {
    res.send('Server is Live! 🚀');
});

// ভিডিওর তথ্য পাওয়ার জন্য
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;
    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            videos: formats.map(f => ({ itag: f.itag, quality: f.qualityLabel, container: f.container })),
            audios: audioFormats.map(f => ({ itag: f.itag, bitrate: f.audioBitrate + 'kbps', container: f.container }))
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch video info" });
    }
});

// MP4 ডাউনলোডের জন্য (Fixes ERR_HTTP_RESPONSE_CODE_FAILURE)
app.get('/mp4', async (req, res) => {
    const { url, itag } = req.query;
    try {
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(url, { format: itag }).pipe(res);
    } catch (err) {
        res.status(500).send("Download Failed");
    }
});

// MP3 ডাউনলোডের জন্য
app.get('/mp3', async (req, res) => {
    const { url, itag } = req.query;
    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        ytdl(url, { format: itag, filter: 'audioonly' }).pipe(res);
    } catch (err) {
        res.status(500).send("Download Failed");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
