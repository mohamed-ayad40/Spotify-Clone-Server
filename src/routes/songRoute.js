import { addSong, deleteSong, listSong, updateSongSession, getSongSession } from "../controllers/songController.js";
import express from "express";
import upload from "../middleware/multer.js";

const songRouter = express.Router();
songRouter.post("/playing-song", updateSongSession);
songRouter.get("/playing-song", getSongSession);
songRouter.post("/add", upload.fields([{name: "image", maxCount: 1}, {name: "audio", maxCount: 1}]), addSong);
songRouter.get("/list", listSong);
songRouter.post("/delete", deleteSong);
export default songRouter;