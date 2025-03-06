const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            autoIndex: true
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection error: ' + error);
    }
}

module.exports = {
    dbConnect
};