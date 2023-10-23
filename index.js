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

    async function findResult(nameQuery) {
        return await UserModel.findOne({ userName: nameQuery });
      }
      // Function call
      try {
         let result = await findResult("Akash");
         if(!result){
            defaultDocument.save();
            result = await findResult("Akash");
         }
         res.render("index.ejs",{user:result});
      }
      catch(err){
      // handle error;
      console.error("error",err.message);
      }
});

// delete route to delete topic
app.post("/delete",async (req,res)=>{
    /////VERY IMPORTANT TO ADD AWAIT!!!
    const result = await UserModel.updateOne( { userName: "Akash" }, { $pull: { "list": { _id: req.body.id } } } );
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
       console.log(result);
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

app.post("/editItem",async (req,res)=>{
    if(req.body.text!=""){
        const objTry = {};
        objTry["list.$.items."+req.body.itemIndex]=req.body.text;

        const result = await UserModel.updateOne({userName:"Akash","list._id":req.body.topicID},{$set:objTry});
        
    }else{
        const objTry = {};
        objTry["list.$.items."+req.body.itemIndex]=1;

        const result = await UserModel.updateOne({userName:"Akash","list._id":req.body.topicID},{$unset:objTry});
        const result1 = await UserModel.updateOne({userName:"Akash","list._id":req.body.topicID},{$pull:{"list.$.items":null}});
        
    }
    
    res.redirect("/");
})
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