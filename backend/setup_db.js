const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const cliPassword = process.argv[2];
const DB_PASSWORD = cliPassword !== undefined ? cliPassword : (process.env.DB_PASSWORD || '');

async function setupDB() {
    let connection;
    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: DB_PASSWORD,
            multipleStatements: true
        });

        console.log('📄 Creating database and tables...');
        const schemaSQL = `
            CREATE DATABASE IF NOT EXISTS store_rating_platform;
            USE store_rating_platform;

            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(60) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                address VARCHAR(400) NOT NULL,
                role ENUM('admin', 'normal_user', 'store_owner') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_email (email)
            );

            CREATE TABLE IF NOT EXISTS stores (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(60) NOT NULL,
                email VARCHAR(255) NOT NULL,
                address VARCHAR(400) NOT NULL,
                owner_id VARCHAR(36),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_store_email (email),
                UNIQUE KEY unique_owner (owner_id),
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS ratings (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                store_id VARCHAR(36) NOT NULL,
                rating_value SMALLINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_store (user_id, store_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
                CONSTRAINT chk_rating CHECK (rating_value BETWEEN 1 AND 5)
            );
        `;

        await connection.query(schemaSQL);
        console.log('✅ Tables created successfully!');

        const password = 'Admin@1234';
        const hash = await bcrypt.hash(password, 10);

        const { v4: uuidv4 } = require('uuid');
        const adminId = uuidv4();

        await connection.query('USE store_rating_platform');
        await connection.query(
            `INSERT IGNORE INTO users (id, name, email, password_hash, address, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [adminId, 'System Administrator', 'admin@example.com', hash, 'Admin Headquarters, Platform City', 'admin']
        );

        console.log('');
        console.log('🎉 Database setup complete!');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Seeded Admin Credentials:');
        console.log('  Email   : admin@example.com');
        console.log('  Password: Admin@1234');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

    } catch (error) {
        console.error('❌ Failed to set up database:', error.message);
        console.error('');
        console.error('💡 Try passing your MySQL password as an argument:');
        console.error('   node setup_db.js YOUR_MYSQL_PASSWORD');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

setupDB();
