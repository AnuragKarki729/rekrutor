import mongoose from "mongoose";

let isConnected = false; // Track the connection state

const connectToDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    const connectionURL = "mongodb+srv://AnuragKarki:Anurag123@cluster0.8ryru.mongodb.net/";

    try {
        await mongoose.connect(connectionURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true; // Set the connection state to true
        console.log("Database connection is successful");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

export default connectToDB;
