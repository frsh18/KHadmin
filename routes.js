const express = require("express");
const router = express.Router();
const mongoConfig = require("./mongoConfig");

module.exports = function (app) {

    // 在這裡添加其他路由
    app.get("/",function(req,res){
        res.render("index.ejs");
    });
    
    app.get("/member",async function(req,res){
        //檢查使用者是否有透過登入程序，進入會員
        if(!req.session.member){
            res.redirect("/");
            return;
        }
        const page = parseInt(req.query.page) || 1; // 頁數定義
        const pageSize =4; // 每頁顯示的數量
        //從Session取得會員名稱
        const name = req.session.member.name;
        //取得所有會員的名稱
        const db = mongoConfig.getDb();
        let collection = db.collection("message");
        // 獲取總留言
        const totalMessages = await collection.countDocuments({});
        const totalPages = Math.ceil(totalMessages / pageSize);
        // 獲取數據庫的數據
        const result = await collection
            .find({})
            .sort({ timestamp: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        let data = result || [];
        if (req.query.messageAdded) {
            const newMessage = {
                name: req.query.name,
                message: req.query.message
            };
            data.unshift(newMessage);
            delete req.query.messageAdded; 
        }

        res.render("member.ejs",{ name:name, data: data, totalPages: totalPages, currentPage: page });
    });

    //儲存留言
    router.post("/memberup",async function(req,res){
        try {
            const name = req.body.name;
            const message = req.body.message;
            const currentTime = new Date();
    
            const db = mongoConfig.getDb();
            const collection = db.collection("message");
    
            await collection.insertOne({
                name: name, 
                message: message,
                timestamp: currentTime
            });
    
            res.redirect("member");
        } catch (error) {
            console.error("Error in post route:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    //連線到 /error?msg=錯誤訊息
    app.get("/error",function(req,res){
        const msg = req.query.msg;
        res.render("error.ejs",{msg:msg});
    });

    app.get("/signup1",function(req,res){
        res.render("signup1.ejs");
    });

    //註冊會員
    app.post("/signup",async function(req,res){
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        //檢查資料庫中的資料
        const db = mongoConfig.getDb();
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
        const db = mongoConfig.getDb();
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

    return router;
};