import express from "express";
import cors from "cors";
import "dotenv/config";
import passport from "passport";
import cookieSession from "cookie-session";
import songRouter from "./src/routes/songRoute.js";
import connectDB from "./src/config/mongodb.js";
import connectCloudinary from "./src/config/cloudinary.js";
import albumRouter from "./src/routes/albumRoute.js";
import userRouter from "./src/routes/userRouter.js";
import session from "express-session";
import {Strategy as GoogleStrategy} from "passport-google-oauth2"
import userModel from "./src/models/userModel.js";
import { Strategy as LocalStrategy } from "passport-local";
import corsOptions from "./src/config/corsOptions.js";
import path from "path";
import { fileURLToPath } from 'url';
import UserModel from "./src/models/userModel.js";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
// import { store } from "./src/config/mongodb.js";
// import newRouter from "./routes/newRouter.js"
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
// App configuration
const app = express();
const port = process.env.PORT || 4000;
// app.use(cookieSession({    
//     name: "session",
//     keys: ["cyberwolve"],
//     maxAge: 24 * 60 * 60 * 100,
// }));
// app.use(cors(corsOptions));

app.use(cors({
    // origin: process.env.CLIENT_HOSTED_URL,
    origin: "https://spotify-clone-3-psi.vercel.app",
    // origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    sameSite: "none"
}));
// app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader("Permission-Policy", "interest-cohort=()");
//     next();
// });

app.use((req, res, next) => {
    // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization", "Set-Cookie");
    // Set the header to allow any origin to access this server
    // res.header('Access-Control-Allow-Origin', 'https://spotify-clone-3-psi.vercel.app');
    // res.header('Access-Control-Allow-Origin', true);
    // Proceed to the next middleware or route handler
    next();
});
app.enable("trust proxy");
app.set("trust proxy", 1);
connectDB();
connectCloudinary();
app.use(express.json());
app.use(session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'MyCoolWebAppCookieName',
    cookie: {secure: true, key: ["ssss"], sameSite: "none", maxAge: 1000000000000, path: "/", priority: "high", httpOnly: false},
    store: MongoStore.create({
        // mongoUrl: process.env.MONGODB_SESSIONS_URI,
        client: mongoose.connection.getClient()
    }),
    proxy: true
}));

app.use((req, res, next) => {
    console.log("start Middleware")
    console.log(req.session);
    console.log(req.sessionID);
    console.log(req.user);
    console.log("finish Middleware")
    next();
});
// app.use(cookieSession({
//     name: "session",
//     keys: ["lama"],
//     maxAge: 20000000
// }));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


passport.serializeUser((user, done) => {
    console.log("start Serializing user");
    process.nextTick(function() {
        return done(null, (user._id || user.id));
      });
    
    console.log("finish Serializing user");
});


passport.deserializeUser((id, done) => {
    console.log("Deserializing user");
    console.log("A&A")
    console.log(id);
    userModel.findById(id).then((user) => {
        if(user) return done(null, user);
    })
    console.log(user);
});


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
        console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSS")
        const user = await UserModel.findOne({ email });
        if (!user || !user?.comparePasswords(password, user?.password)) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    };
}));




passport.use(
    new GoogleStrategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: "https://spotify-clone-server-tau.vercel.app/auth/google/callback",
        scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("Google");
            let user = await userModel.findOne({googleId: profile.id});
            if (!user) {
                user = new userModel({
                    googleId: profile.id,
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value
                });
                await user.save();
            };
            return done(null, user);
        } catch (err) {
            return done(err, null);
        };
    })
)

// Middleware

// app.post('/api/user/login', passport.authenticate('local', {
//     successRedirect: "/success",
//     failureRedirect: "/failure" // Replace with desired failure redirect
//     // failureFlash: true // Optional: Flash error message for display
// }));

// app.post('/api/user/login', 
//     passport.authenticate('local', { failureRedirect: '/failure' }),
//     function(req, res) {
//         // console.log(req.user);
//         res.status(200).json({
//             user: req.user,
//             message: "Successfully authenticated!"
//         });
//     //   res.redirect('/');
// });



app.post('/api/user/login', async (req, res) => {
    console.log(req.body);
    try {
        const {email, password} = req.body;
        console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSS")
        if(!email || !password) {
            res.status(400).json({
                message: "NO CREDENTIALS PROVIDED",
            });
        };
        const user = await UserModel.findOne({ email });
        if (!user || !user?.comparePasswords(password, user?.password)) {
            return res.status(400).json({
                message: "NO USER FOUND!",
            });
        }
        req.session.authenticated = true;
        req.login(user, function(err) {
            if (err) { return next(err); }
            console.log(req.session);
            console.log(req.sessionID);
            return res.status(200).json({
                status: "success",
                message: "Successfully authenticated",
                user
            })
          });

    } catch (err) {
        console.log(err);
        return res.status(200).json({
            status: "success",
            err
        })
    };
});




app.get("/success", (req, res) => {
    // console.log("AA")
    // console.log(req.user);
    // console.log(req);
    // console.log("AA")
    // req.user.password = undefined;
    res.status(200).json({
        user: req.user,
        message: "Successfully authenticated!"
    });
})
// app.get("/", (req, res) => {
//     console.log(req.user);
//     console.log("Success");
// })
app.get("/failure", (req, res) => {
    console.log("failure");
})
app.get("/api/user/logout", (req, res) => {
    console.log(req.session);
    req.session.destroy((err) => {

        res.clearCookie('connect.sid');

        res.redirect("https://spotify-clone-3-psi.vercel.app/");
        // res.status(200).json({
        //     message: "Logged out successfully!"
        // });
    });
});

app.post("/api/user/auth", passport.authenticate("local", {
    successRedirect: "http://localhost:5173", // Replace with desired success redirect
    failureRedirect: "http://localhost:5173/login" // Replace with desired failure redirect
    // failureFlash: true // Optional: Flash error message for display
}));

// Initializing routes

// app.use(() => {
//     console.log("Fuck")
// });
// app.get("/", (req, res) => {
//     console.log("Got ");
// })
app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/user", userRouter);

// app.all("*", (req, res) => {
//     res.status(404);
//     if(req.accepts("html")) {
//         console.log("Sending file");
//     } else if(req.accepts("json")) {
//         res.json({message: "Source not found!"})
//     } else {
//         res.type("txt").send("Source not found!");
//     };
// });

app.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}));

app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect("/login/failed");

        req.logIn(user, (err) => {
            console.log(user);
            if (err) return next(err);
            // Redirect only after the session is successfully established
            return res.redirect("https://spotify-clone-3-psi.vercel.app/#/");
        });
    })(req, res, next);
});

app.get("/" , (req, res) => {
    console.log("Mohamed")
    console.log(req.user);
    console.log(req.session);
    console.log(req.sessionID);
    console.log("Mohamed")
    // res.status(200).json({
    //     status: "success",
    //     message: "Logged in Successfully!",
    //     user: req.user
    // })
    res.send("<div>HELLO WORLD</div>");
})
app.get("/login/failed", (req, res) => {
    res.status(401).json({
        status: "success",
        message: "failure"
    });
});

app.get("/login/success", async(req, res) => {
    // console.log(req.session);
    // console.log(req.user);
    if(req.user) {
        res.status(200).json({
            message: "User login",
            user: req.user
        })
    } else {
        res.status(400).json({
            message: "Not Authorized",
        })
    }
});

app.get("/logout", (req, res, next) => {
    console.log("looggging outttt")
    req.logout(function(err) {
        if(err) {
            // console.log(err);
            return next(err);
        } res.redirect("http://localhost:5173")
    })
});
app.listen(port, () => {
    console.log(`Server starter on port ${port}`)
})