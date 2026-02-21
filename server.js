const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const app = express();

// ১. ব্রাউজারের কানেকশন ব্লক (CORS) ঠিক করার জন্য
app.use(cors());
app.use(express.json());

// ২. আপনার ডিজাইন করা index.html পেজটি দেখানোর জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ৩. ভিডিওর তথ্য (Title, Thumbnail, Quality) বের করার জন্য
app.get('/info', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: "URL is required" });

    try {
        const info = await ytdl.getInfo(videoURL);
        // ভিডিও এবং অডিও একসাথে আছে এমন কোয়ালিটি ফিল্টার করা
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            videos: formats.map(f => ({
                quality: f.qualityLabel || 'Auto',
                itag: f.itag,
                container: f.container
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Invalid YouTube URL or Server Busy" });
    }
});

// ৪. সরাসরি ফাইল ডাউনলোড করার জন্য রুট
app.get('/download', async (req, res) => {
    const { url, itag } = req.query;
    try {
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(url, { format: itag }).pipe(res);
    } catch (err) {
        res.status(500).send("Download failed");
    }
});

// ৫. সার্ভার পোর্ট সেটআপ
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
