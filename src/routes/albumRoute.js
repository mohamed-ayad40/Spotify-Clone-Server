import express from "express";
import { addAlbum, deleteAlbum, listAlbum } from "../controllers/albumController.js";
import upload from "../middleware/multer.js";

const albumRouter = express.Router();
albumRouter.post("/add", upload.single("image"), addAlbum);
albumRouter.get("/list", listAlbum);
albumRouter.post("/delete", deleteAlbum);

export default albumRouter;