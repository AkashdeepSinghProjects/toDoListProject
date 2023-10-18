import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
var userName="";
let topicListArray = [];
let topicObjectWithItems = {};
let dataObject ={topicList:topicListArray,items:topicObjectWithItems,userName:userName};
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }))

function addTopic(topic){
    if(topic != "" && !(topicListArray.includes(topic))){
        topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
        topicListArray.unshift(topic)
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
        res.render("index.ejs",dataObject);
        }
   
});
app.get("/",(req,res)=>{
    res.render("index.ejs",dataObject);
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
    const userInput = req.body["customText"];
    addTopic(userInput);
    res.redirect("/");
});
app.post("/addItem",(req,res)=>{

    const obj = JSON.parse(JSON.stringify(req.body)); 
    const parsedBodyObject = obj;  // object with attached item/value to its topic/key
    const topic = Object.keys(parsedBodyObject)[0]; //  topic or heading of the list/key array
    const enteredItem = req.body[topic];
    console.log(`topic : ${topic}, Entered Item : ${enteredItem}`);
    if(enteredItem!=""){

        if(!topicObjectWithItems.hasOwnProperty(topic)){topicObjectWithItems[topic] = new Array();} // checks whether topic exists in topicObject 
        topicObjectWithItems[topic].push(enteredItem); // checks whether entered item is empty or not
        console.log(`item added: ${topicObjectWithItems[topic]}`);
        res.redirect("/");
    }
});

app.listen(port,()=>{
    console.log(`Server is running on port: ${port}`);
});