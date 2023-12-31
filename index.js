import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

const app = express();
const port = 3000;
let CurrentUserID;

// Express Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// Local Database connect and todolistDB Database created
await mongoose.connect('mongodb://127.0.0.1/todolistDB').
catch(error => console.error("Error: ",error.message));

// User Schema and Model made through mongoose method
const UserSchema = new mongoose.Schema({
    _id:{type: Number,required:true},
    userName:{type: String,required:true} ,
    list:[{name:String,items:[],important:Boolean}]
})
// colection name user is created
const UserModel = mongoose.model("user",UserSchema);

// Homepage where user will be created or existing user will open his list
app.get("/",(req,res)=>{

    res.render("userEnter.ejs");
});

// user setup 
/////VERY IMPORTANT TO ADD AWAIT!!!
app.post("/user", async(req,res)=>{

    async function userExist(){
        return await UserModel.findOne({userName:capitalizeFLetter(req.body.username)});
    }

    try{
        const result = await userExist();
        if(!result){
            const count = await UserModel.countDocuments();
            const newId =  count+1;
            const newUser = new UserModel({
                _id: newId,
                userName:capitalizeFLetter(req.body.username),
                list: [],
            })
            newUser.save();
            CurrentUserID = newId;
        }else{
            CurrentUserID = result._id;
        }
        res.redirect("/"+CurrentUserID);
    }catch(err){
        console.error("Error: ",err.message);
    }
    
});

// To Do List Page according to userID
app.get("/:id",async (req,res)=>{

    CurrentUserID = req.params.id;

    try {
        let result = null;
        if(req.query.starred){
            result = await findResult(req.params.id,true);
        }else{
            result = await findResult(req.params.id);
        }
        // console.log(result);
        if(result){
            res.render("index.ejs",{user:result});
        }else{
            res.status(400).send("USER NOT FOUND!!");
        }
        
    }
    catch(err){
        console.error("error",err.message);
        res.status(400).send("Bad Request");
    }
    
});

// delete route to delete topic with current user
app.post("/delete",async (req,res)=>{

    /////VERY IMPORTANT TO ADD AWAIT!!!
    const result = await UserModel.updateOne( { _id: CurrentUserID }, { $pull: { "list": { _id: req.body.id } } } );
    res.redirect("/"+CurrentUserID);
});

// topic is added 
app.post("/addTopic",(req,res)=>{

    if(req.body.topic!=""){addTopic(req.body.topic);}
    res.redirect("/"+CurrentUserID);
});

// item will be added to corresponding topic
app.post("/addItem",async (req,res)=>{

    const topic = Object.keys(req.body)[0]; //  topic or heading of the list/key array
    const enteredItem = req.body[topic];

    if(enteredItem!=""){
        const result =  await UserModel.updateOne({_id: CurrentUserID,"list.name":topic},{$push:{"list.$.items":enteredItem}});
        res.redirect("/"+CurrentUserID);
    }else{
        res.redirect("/"+CurrentUserID);
    }
});

app.post("/toogleImportant",async (req,res)=>{

    try{
        await UserModel.updateOne({_id: CurrentUserID,"list._id":req.body.topicId},{$set:{"list.$.important":req.body.important}})
    }catch(err){
        console.error("Error: ",err.message);
    }
    
    res.redirect("/"+CurrentUserID);
})

//  topic name can be edited and data is received from javascript ajax post reqest
app.post("/editTopic",async(req,res)=>{

    const result = await UserModel.updateOne({_id: CurrentUserID,"list._id":req.body.topicId},{$set:{"list.$.name":req.body.text}});
    res.redirect("/"+CurrentUserID);
});

// edit item using query and USING $ SIGN which shows item corresponding to query array object
app.post("/editItem",async (req,res)=>{

    if(req.body.text!=""){

        const objTry = {};
        objTry["list.$.items."+req.body.itemIndex]=req.body.text;

        const result = await UserModel.updateOne({_id: CurrentUserID,"list._id":req.body.topicID},{$set:objTry});
        
    }else{
        const objTry = {};
        objTry["list.$.items."+req.body.itemIndex]=1;

        const result = await UserModel.updateOne({_id: CurrentUserID ,"list._id":req.body.topicID},{$unset:objTry});
        const result1 = await UserModel.updateOne({_id: CurrentUserID ,"list._id":req.body.topicID},{$pull:{"list.$.items":null}});
    }
    
    res.redirect("/"+CurrentUserID);
})
// find query function for all the data and for important data
async function findResult(idQuery,impQuery) {
      
    if(impQuery){

        const listImportant = await UserModel.aggregate([{$match:{_id:parseInt(idQuery)}},{$unwind:"$list"},{$match:{"list.important":true}},{$group:{_id:"$_id",list:{$push:"$list"}}}]);
        const name = await UserModel.findOne({ _id: parseInt(idQuery) });
        let obj1 = listImportant[0];
        obj1.userName=name.userName;
        return obj1
    }else{
        return await UserModel.findOne({ _id: idQuery });
    }
    
  }

// topic is created by function
async function addTopic(topic){

    topic = capitalizeFLetter(topic);
    const result = await UserModel.findOne({_id: CurrentUserID ,"list.name":topic}); 
    if(!result){
        const documentObject = {name:topic,items:[],important:false};
        await UserModel.updateOne({_id: CurrentUserID },{"$push":{list:{"$each":[documentObject],"$position": 0}}});
    }
}

function capitalizeFLetter(str) {
   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
});