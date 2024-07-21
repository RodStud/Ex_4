exports.db_connection = {
    async Create_Connection() {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        return connection;
    }
}