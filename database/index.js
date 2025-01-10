
const {default:mongoose} = require ("mongoose")
const connectToDB = async()=>{
    const connectionURL = "mongodb+srv://AnuragKarki:Anurag123@cluster0.8ryru.mongodb.net/"
    mongoose.connect(connectionURL).then(()=>console.log('connection skeleton is successful'))
    .catch((error) => console.log(error))
};

export default connectToDB