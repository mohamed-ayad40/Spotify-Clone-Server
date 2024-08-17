import {v2 as cloudinary} from "cloudinary";
import songModel from "../models/songModel.js"
const addSong = async (req, res) => {
    try {
        const {name, desc, album} = req.body;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];
        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {resource_type: "video"});
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;
        console.log(name, desc, album, audioUpload, imageUpload);
        const songData = {
            name,
            desc,
            album,
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration
        }
        const song = await songModel.create(songData);
        res.json({
            success: true,
            message: "Song Added"
        })
    } catch (err) {
        res.json({
            success: false,
            err
        })
    }
};

const updateSongSession = async (req, res) => {

    console.log("ass", req.body);
    try {
        req.session.playingSong = req.body;
        await req.session.save();
        console.log("SSSSS");
        console.log(req.session);
        console.log("SSSSS");
        res.status(201).json({
            message: "Saved session song!"
        });
    } catch (err) {
        console.log("ass twice" , err);
        res.status(500).json({
            error: err,
            message: "Failed to update playing song"
        });
    };
};

const getSongSession = async (req, res) => {
    console.log("a7a ",req.session.playingSong);
    res.json(req.session.playingSong || {});
};

const listSong = async (req, res) => {
    try{
        const allSongs = await songModel.find({});
        res.json({
            success: true,
            songs: allSongs
        })
    } catch (err) {
        res.json({
            success: false,
            err
        });
    };
};

const deleteSong = async (req, res) => {
    try {
        console.log(req.body.id)
        await songModel.findByIdAndDelete(req.body.id);
        res.json({
            success: true,
            message: "Song deleted successfully"
        })
    } catch (err) {
        res.json({
            success: false
        })
    }
};




export { addSong, listSong, deleteSong, updateSongSession, getSongSession };