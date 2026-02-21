const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const app = express();

// কানেকশন সমস্যা (CORS) সমাধানের জন্য
app.use(cors());
app.use(express.json());

// index.html ফাইলটি দেখানোর জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ভিডিওর তথ্য পাওয়ার রুট
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: "URL is required" });
    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            videos: formats.map(f => ({
                quality: f.qualityLabel || 'Auto',
                itag: f.itag
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "Invalid URL" });
    }
});

// সরাসরি ডাউনলোড রুট
app.get('/download', async (req, res) => {
    const { url, itag } = req.query;
    try {
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(url, { format: itag }).pipe(res);
    } catch (err) {
        res.status(500).send("Download failed");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
            
