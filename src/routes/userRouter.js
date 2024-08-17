import express from "express";
import { refresh, logout, register } from "../controllers/userController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import passport from "passport";
const userRouter = express.Router();

// userRouter.use(verifyJWT);

userRouter.post("/signup", register)
// userRouter.post("/login", loginUser)


// userRouter.post('/login', passport.authenticate('local', {
//     successRedirect: 'http://localhost:5173', // Replace with desired success redirect
//     failureRedirect: 'http://localhost:5173/login', // Replace with desired failure redirect
//     failureFlash: true // Optional: Flash error message for display
// }));
userRouter.get("/refresh", refresh);
userRouter.get("/logout", logout);

export default userRouter;