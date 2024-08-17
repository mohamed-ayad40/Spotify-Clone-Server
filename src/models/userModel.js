import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    emailVerified: Boolean,
    expired: String,
    iat: String,
    picture: String,
    googleId: String,
    password: String
});

userSchema.pre("save", async function (next) {
    // console.log(next)
    if(this.password) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = undefined;
    }
    next();
});
userSchema.methods.comparePasswords = (async (pswd, pswdDB) => {
    console.log("Comparing")
    return await bcrypt.compare(pswd, pswdDB);
});
const UserModel = mongoose.model("User", userSchema);
export default  UserModel;

// const normalUserSchema = new mongoose.Schema({
//     fullName: String,
//     email: String,
//     password: String,
//     confirmPassword: String
// }, {timestamps: true});

// export const normalUserModel = mongoose.model("normalUser", normalUserSchema);

