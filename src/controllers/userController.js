// import googleUserModel from "../models/userModel.js";
// export const addGoogleUser = async (req, res) => {
//     try {
//         if(req.body.email_verified) {
//             const newUser = await googleUserModel.create({
//                 fullName: req.body.fullName,
//                 email: req.body.email,
//                 emailVerified: req.body.email_verified,
//                 expired: req.body.exp,
//                 iat: req.body.iat,
//                 picture: req.body.picture
//             });
//             console.log(newUser);
//             res.status(201).json({
//                 status: "success",
//                 user: newUser
//             })
//         }

// import { normalUserModel } from "../models/userModel.js";

//     } catch (err) {
//         res.status(400).json({
//             status: "fail",
//             error: err
//         })
//     }
// };

// export const getGoogleUser = async (req, res) => {
//     try {
//         const googleUsers = await googleUserModel.findById(req.body);

//     } catch (err) {

//     }
// };

import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// export const signUp = async (req, res) => {
//     console.log("Signup")
//     console.log(req.body.password)
//     console.log(req.body)
//     if(req.body) {
//         try {
//             // const newUser = await normalUserModel.create({...req.body, confirmPassword: undefined});
//             // const newUser = new normalUserModel({
//             //     fullName: "User",
//             //     email: req.body.email,
//             //     password: req.body.password,
//             //     confirmPassword: req.body.confirmPassword
//             // });

//             const newUser = await userModel.create({...req.body, fullName: "User"});
//             const accessToken = jwt.sign({
//                 UserInfo: {
//                     id: newUser._id
//                 }
//             }, process.env.ACCESS_TOKEN_SECRET, {
//                 expiresIn: "15m"
//             });

//             const refreshToken = jwt.sign({
//                 UserInfo: {
//                     id: newUser._id
//                 }
//             }, process.env.REFRESH_TOKEN_SECRET, {
//                 expiresIn: "7d"
//             });

//             res.cookie("jwt", refreshToken, {
//                 httpOnly: true, // accessible thorught http only and not by js
//                 secure: true, // https
//                 sameSite: "None",
//                 maxAge: 1000 * 60 * 60 * 24 * 7 // cross site cookie
//             });

//             res.json({
//                 accessToken,
//                 email: newUser.email,
//                 fullName: newUser.fullName,
//             })
            

//         } catch (err) {
//             console.log(err)
//             res.status(400).json({
//                 status: "fail",
//                 error: err
//             })
//         }

//     }

// };
import bcrypt from "bcrypt";
import UserModel from "../models/userModel.js";
import passport from "passport";
// export const loginUser = async (req, res, next) => {
//     console.log("Login")
//     // res.status(200).json({
//     //     status: "success",
//     //     data: "data"
//     // })
//     if(req.body) {
//         try {
//             let {email, password} = req.body;
//             if(!email || !password) return next(new Error("Please provide your credentials!"));
//             let user = await userModel.findOne({email}).select("+password");
//             if(!user) return next(new Error("We couldn't find this email!"));

//             let isMatch = await user.comparePasswords(password, user.password);
//             // const isMatch = await bcrypt.compare(password, user.password);
//             console.log(isMatch);
//             if(!isMatch) return next(new Error("Incorrect email or password"));
//             const accessToken = jwt.sign({
//                 UserInfo: {
//                     id: user._id
//                 }
//             }, process.env.ACCESS_TOKEN_SECRET, {
//                 expiresIn: "15m"
//             });

//             const refreshToken = jwt.sign({
//                 UserInfo: {
//                     id: user._id
//                 }
//             }, process.env.REFRESH_TOKEN_SECRET, {
//                 expiresIn: "7d"
//             });
//             res.cookie("jwt", refreshToken, {
//                 httpOnly: true, // accessible thorught http only and not by js
//                 secure: true, // https
//                 sameSite: "None",
//                 maxAge: 1000 * 60 * 60 * 24 * 7 // cross site cookie
//             });

//             res.json({
//                 accessToken,
//                 email: user.email,
//                 fullName: user.fullName,
//             })

//         } catch (err) {
//             console.log(err)
//             res.status(400).json({
//                 status: "fail",
//                 error: err
//             })
//         }

//     }
// };


export const register = async (req, res, next) => {
    if(req.body) {
        try {
            // ... rest of your code
            console.log("Now in register");
            let {email, password, username} = req.body;
            if(!email || !password) return next(new Error("Please provide your credentials!"));
            let user = await userModel.findOne({email}).select("+password");
            if(user) return next(new Error('User already exists'));

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await UserModel.create({...req.body, password: hashedPassword});

            await new Promise((resolve, reject) => {
                req.login(newUser, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            res.status(201).json({ message: 'User created successfully' });
        } catch(err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };
};



// export const register = async (req, res, next) => {
//     if(req.body) {
//         try {
//             let {email, password, username} = req.body;
//             if(!email || !password) return next(new Error("Please provide your credentials!"));
//             let user = await userModel.findOne({email}).select("+password");
//             if(user) return next(new Error('User already exists'));

//             const hashedPassword = await bcrypt.hash(password, 10);

//             const newUser = await UserModel.create({...req.body, password: hashedPassword});

//             await req.login(newUser, (err) => {
//                 console.log(req.session)
//                 console.log(req.sessionID)
//                 console.log(req.sessionId)
//                 console.log("*************")
//                 console.log(err);
//                 console.log("*************")
//                 if(err) {
//                     return res.status(500).json({
//                         message: "Error Logging in!"
//                     });
//                 }
//                 return res.status(201).json({ message: 'User created successfully' });
//             });
//         } catch(err) {
//             console.log(err);
//             res.status(500).json({
//                 message: "Server error",
//             });
//         };
//     };
// };


export const refresh = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) res.status(401).json({message: "Unauthorized"});
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async(err, decoded) => {
            if(err) return res.status(403).json({message: "Forbidden"});
            const foundUser = await userModel.findById(decoded.UserInfo.id).exec();
            if(!foundUser) return res.status(401).json({message: "Unauthorized"});
            const accessToken = jwt.sign({
                UserInfo: {
                    id: foundUser._id,
                }
            }, process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: "15m"}
            )
            res.json({ accessToken });
        } 
    )
};

export const logout = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true
    });
    res.json({
        message: "Cookie cleared!"
    });
}