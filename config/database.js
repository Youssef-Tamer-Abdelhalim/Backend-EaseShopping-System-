const mongoose = require("mongoose");// هنا استدعينا mongoose

const dbConnection = () => {

    // هنا بنعمل اتصال بقاعدة البيانات من ال mongoose
    mongoose.connect(process.env.DB_URI)
      .then((conn) => {
        console.log(`Database connected successfully: ${conn.connection.host}`);
      })
};

module.exports = dbConnection;
