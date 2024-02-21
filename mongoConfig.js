const { MongoClient } = require("mongodb");

const url = "mongodb+srv://root:s7919838@mycluster.nkbswyo.mongodb.net/?retryWrites=true&w=majority"; // 修改為你的 MongoDB 連線字串
let db;

async function connect() {
    try {
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db("frsh1987"); // 修改為你的資料庫名稱
        console.log("MongoDB 連線成功！");
    } catch (error) {
        console.error("MongoDB 連線失敗", error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error("MongoDB 未連線");
    }
    return db;
}

module.exports = {
    connect,
    getDb
};

