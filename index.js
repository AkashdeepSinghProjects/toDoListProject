import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

const app = express();
const port = 3000;

// Express Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// Local Database connect
await mongoose.connect('mongodb://127.0.0.1/todolistDB').
catch(error => console.error("Error: ",error.message));

// User Schema and Model made through mongoose method
const UserSchema = new mongoose.Schema({
    userName:String ,
    list:[{name:String,items:[]}]
})
const UserModel = mongoose.model("user",UserSchema);

const defaultDocument = new UserModel({
    userName:"Akash",
    list: [],
})

app.get("/",async (req,res)=>{
    
    try{
        let result = await UserModel.findOne({userName:"Akash"}); 
        if(!result){
            defaultDocument.save();
            result = await UserModel.findOne({userName:"Akash"}); 
        }
        if(result){
            res.render("index.ejs",{user:result});
        }
        
    }catch(err){
       console.error("error",err.message);
    }
    
});

async function addTopic(topic){

    topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
    const result = await UserModel.findOne({userName:"Akash","list.name":topic}); 
    if(!result){
        const documentObject = {name:topic,items:[]};
        await UserModel.updateOne({userName:"Akash"},{$push:{list:documentObject}});
    }
}

app.post("/trial",(req,res)=>{
    console.log(req.body);
    console.log("pressed");
});

app.post("/userName",(req,res)=>{
    if (req.body["userName"]!=""){
        var x=req.body["userName"]
        dataObject["userName"] = x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
        res.redirect("/");
    }
});

app.post("/grocery",(req,res)=>{
    addTopic("Grocery");
    res.redirect("/");
});

app.post("/home",(req,res)=>{
    addTopic("Home");
    res.redirect("/");
});

app.post("/work",(req,res)=>{
    addTopic("Work");
    res.redirect("/");
});

app.post("/custom",(req,res)=>{
    addTopic(req.body["customText"]);
    res.redirect("/");
});

app.post("/addItem",async (req,res)=>{

    const obj = JSON.parse(JSON.stringify(req.body)); 
    const parsedBodyObject = obj;  // object with attached item/value to its topic/key
    const topic = Object.keys(parsedBodyObject)[0]; //  topic or heading of the list/key array
    const enteredItem = req.body[topic];

    if(enteredItem!=""){

       const result =  await UserModel.updateOne({userName:"Akash","list.name":topic},{$push:{"list.$.items":enteredItem}});
        res.redirect("/");
    }
});

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
});