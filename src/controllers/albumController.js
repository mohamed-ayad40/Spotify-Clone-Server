import {v2 as cloudinary} from "cloudinary";
import albumModel from "../models/albumModel.js";

const addAlbum = async (req, res) => {
    try {
        const { name, desc, bgColor } = req.body;
        const imageFile = req.file;
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
        const albumData = {
            name,
            desc,
            bgColor,
            image: imageUpload.secure_url
        };
        const album = await albumModel.create(albumData);
        res.json({
            success: true,
            album
        })
    } catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
};

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({});
        res.json({
            success: true,
            allAlbums
        });
    } catch (err) {
        res.json({
            status: "fail",
            err
        });
    };
};

const deleteAlbum = async (req, res) => {
    try {
        await albumModel.findByIdAndDelete(req.body.id);
        res.json({
            success: true,
            message: "Album deleted successfully"
        })
    } catch (err) {
        res.json({
            status: "fail",
            err
        })
    };
};

export { addAlbum, listAlbum, deleteAlbum };