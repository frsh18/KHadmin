//./KHADMIN/index.js
//MongoDB基礎設定
const mongodb = require("mongodb");
const url = "mongodb+srv://root:s7919838@mycluster.nkbswyo.mongodb.net/?retryWrites=true&w=majority";
const client = new mongodb.MongoClient(url);
let db;
async function main() {
try {
    await client.connect();
    db = client.db("frsh1987");
    console.log("資料庫連線成功");
}catch (err) {
    console.log("連線失敗", err);
}};
main();

//===============================
//建立網站伺服器的基礎設定
//載入express模組
const express = require("express");

//建立Application物件
const app = express();
//===================
//設定Session使用者狀態管理工具
const session = require("express-session");
app.use(session({
   secret:"anything",
   resave:false,
   saveUninitialized:true
}));

//===================

//靜態檔案處理
//將靜態[檔案的名稱]對應到網址 http://localhost:3000/檔案的名稱
app.use(express.static("public"));

//===================

//設定樣板引擎模組
app.set("views emgine","./ejs");
app.set("views","./views");

//====================
//讓後端能夠取得 POST 方法
app.use(express.urlencoded({extended:true}))
//==============================================
//建立處理需要的路由
app.get("/",function(req,res){
   res.render("index.ejs");
});


app.get("/member",async function(req,res){
    //檢查使用者是否有透過登入程序，進入會員
    if(!req.session.member){
        res.redirect("/");
        return;
    }
    
    //從Session取得會員名稱
    const name = req.session.member.name;
    //取得所有會員的名稱
    let collection = db.collection("users");
    let result = await collection.find({});
    let data=[];
    await result.forEach(function(member){
        data.push(member);
    })
    res.render("member.ejs",{name:name,data:data});
});

//連線到 /error?msg=錯誤訊息
app.get("/error",function(req,res){
    const msg = req.query.msg;
    res.render("error.ejs",{msg:msg});
});

//註冊會員
app.post("/signup",async function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    //檢查資料庫中的資料
    let collection = db.collection("users");

    let result = await collection.findOne({
        email:email
    });
    if(result !== null){
        //EMAILL已經存在
        res.redirect("/error?msg=註冊失敗，信箱重複");
        return;
    }
    //將新的會員資料放到資料庫
    result = await collection.insertOne({
        name:name,email:email,password:password
    });
    //新增成功，導向首頁
    res.redirect("/");
});

//會員登入
app.post("/signin",async function(req,res){
    const email = req.body.email;
    const password = req.body.password;
    //檢查資料庫中的資料
    let collection = db.collection("users");
    let result = await collection.findOne({
        $and:[
            {email:email},
            {password:password}
        ]
    });
    if(result === null){
       ///沒有對應會員資料，登入失敗
       res.redirect("/error?msg=登入失敗，郵件或密碼輸入錯誤");
       return;
    }
    //登入成功，紀錄會員資訊在Session中
    req.session.member=result;
    res.redirect("/member");
});

//會員登出
app.get("/signout",function(req,res){
    req.session.member=null;
    res.redirect("/");
});
//==============================================
//啟動伺服器在 http://localhost:3000/
app.listen(3000,function(){
   console.log("Server Started")
});