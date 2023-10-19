import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

const app = express();
const port = 3000;

// Express Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// Local Database connect and todolistDB Database created
await mongoose.connect('mongodb://127.0.0.1/todolistDB').
catch(error => console.error("Error: ",error.message));

// User Schema and Model made through mongoose method
const UserSchema = new mongoose.Schema({
    _id:Number,
    userName:String ,
    list:[{name:String,items:[]}]
})
// colection name user is created
const UserModel = mongoose.model("user",UserSchema);

const defaultDocument = new UserModel({
    _id: 1,
    userName:"Akash",
    list: [],
})
// home page routing
app.get("/",async (req,res)=>{
    
    try{
        let result = await UserModel.findOne({userName:"Akash"}); 
        if(!result){
            defaultDocument.save();
            result = await UserModel.findOne({userName:"Akash"}); 
        }
        res.render("index.ejs",{user:result});
    }catch(err){
       console.error("error",err.message);
    }
});

// delete route to delete topic
app.post("/delete",(req,res)=>{
    console.log(req.body);
    console.log("pressed");
    res.redirect("/");
});

// topic is added 
app.post("/addTopic",(req,res)=>{
    if(req.body.topic!=""){addTopic(req.body.topic);}
    res.redirect("/");
});
// item will be added to corresponding topic
app.post("/addItem",async (req,res)=>{
    const topic = Object.keys(req.body)[0]; //  topic or heading of the list/key array
    const enteredItem = req.body[topic];

    if(enteredItem!=""){
       const result =  await UserModel.updateOne({userName:"Akash","list.name":topic},{$push:{"list.$.items":enteredItem}});
        res.redirect("/");
    }
});

// app.post("/userName",(req,res)=>{
//     if (req.body["userName"]!=""){
//         dataObject["userName"] = req.body["userName"].charAt(0).toUpperCase() + req.body["userName"].slice(1).toLowerCase();
//         res.redirect("/");
//     }
// });

// topic is created by function
async function addTopic(topic){

    topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
    const result = await UserModel.findOne({userName:"Akash","list.name":topic}); 
    if(!result){
        const documentObject = {name:topic,items:[]};
        await UserModel.updateOne({userName:"Akash"},{$push:{list:documentObject}});
    }
}

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
});