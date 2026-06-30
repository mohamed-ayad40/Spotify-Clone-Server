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
import dns from "dns"
const isProduction = process.env.NODE_ENV === "production";
const CLIENT_URL = isProduction 
    ? "https://spotify-clone-3-psi.vercel.app" 
    : "http://localhost:5173";
const SERVER_URL = isProduction 
    ? "https://spotify-clone-server-tau.vercel.app" 
    : "http://localhost:4000";
    // هيشتغل عندك بس عشان يحل مشكلة مزود الخدمة، ومش هيأثر على Vercel
if (!isProduction) {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
}
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
    origin: CLIENT_URL,
    // origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
}));
// app.use(cors());
// app.use((req, res, next) => {
//     res.setHeader("Permission-Policy", "interest-cohort=()");
//     next();
// });

// app.use((req, res, next) => {
//     // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization", "Set-Cookie");
//     // Set the header to allow any origin to access this server
//     // res.header('Access-Control-Allow-Origin', 'https://spotify-clone-3-psi.vercel.app');
//     // res.header('Access-Control-Allow-Origin', true);
//     // Proceed to the next middleware or route handler
//     next();
// });
// app.enable("trust proxy");
app.set("trust proxy", 1);
await connectDB();
connectCloudinary();
app.use(express.json());
app.use(session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'spotifySession',
    cookie: {
        secure: isProduction, // True on Vercel, False on Localhost
        sameSite: isProduction ? "none" : "lax", // Cross-site in prod, Local in dev
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true // أمان ضد هجمات الـ XSS
    },
    store: MongoStore.create({
        client: mongoose.connection.getClient()
    })
}));

// app.use(cookieSession({
//     name: "session",
//     keys: ["lama"],
//     maxAge: 20000000
// }));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


passport.serializeUser((user, done) => {
    process.nextTick(function() {
        return done(null, (user._id || user.id));
      });
});


passport.deserializeUser(async (id, done) => {
    try {
        console.log("-> Deserializing ID:", id);
        const user = await userModel.findById(id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (err) {
        console.error("💥 Error in deserializeUser:", err);
        return done(err, null);
    }
});


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
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
        callbackURL: `${SERVER_URL}/auth/google/callback`, // Localhost عشان الـ Debugging
        scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log("1. Google Profile received:", profile.displayName);
            
            // استخدمنا let هنا عشان نعرف المتغير صح جوه الـ Try
            let existingUser = await userModel.findOne({ googleId: profile.id });
            
            if (existingUser) {
                console.log("2. User already exists in DB:", existingUser.email);
                return done(null, existingUser);
            }
            
            console.log("2. User not found, creating a new one...");
            let newUser = new userModel({
                googleId: profile.id,
                fullName: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
            
            await newUser.save();
            console.log("3. New user saved successfully:", newUser.email);
            return done(null, newUser);

        } catch (err) {
            console.error("💥 Error in Google Strategy:", err);
            return done(err, null);
        }
    })
);

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
    res.status(200).json({
        user: req.user,
        message: "Successfully authenticated!"
    });
})

app.get("/api/user/logout", (req, res, next) => {
    console.log("-> Starting Logout Process...");
    
    // دالة مجمعة لمسح السيشن والتوجيه عشان منكررش الكود
    const finishLogout = () => {
        req.session.destroy((err) => {
            if (err) console.error("Error destroying session:", err);
            
            console.log("-> Session destroyed in DB.");
            res.clearCookie('spotifySession', { path: '/' });
            console.log("-> Cookie cleared. Redirecting to Frontend...");
            
            res.redirect(`${CLIENT_URL}/`);
        });
    };

    // لو الدالة بتقبل Arguments (يعني إصدار Passport جديد 0.6.0+)
    if (req.logout && req.logout.length > 0) {
        req.logout(function(err) {
            if (err) { return next(err); }
            finishLogout();
        });
    } else {
        // لو إصدار Passport قديم (Synchronous)
        req.logout();
        finishLogout();
    }
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
        if (!user) return res.redirect(`${CLIENT_URL}/login`); // رجعه للوجين لو فشل

        req.logIn(user, (err) => {
            if (err) return next(err);
            
            // 🚨 السر هنا: حفظ الجلسة في MongoDB قبل الـ Redirect
            req.session.save(() => {
                return res.redirect(`${CLIENT_URL}/`); 
            });
        });
    })(req, res, next);
});

app.get("/" , (req, res) => {
    res.send("<div>HELLO WORLD</div>");
})
app.get("/login/failed", (req, res) => {
    res.status(401).json({
        status: "success",
        message: "failure"
    });
});

app.get("/login/success", async(req, res) => {
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

app.listen(port, () => {
    console.log(`Server starter on port ${port}`)
})