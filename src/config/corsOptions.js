import allowedOrigins from "./allowedOrigins.js";
const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET,POST,PUT,DELETE",
};

export default corsOptions