// MongoDB initialization script for production
// This runs when MongoDB starts for the first time

// Switch to admin database
db = db.getSiblingDB('admin');

// Create admin user if it doesn't exist
try {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME || 'admin',
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD || 'admin',
    roles: [
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' },
      { role: 'dbAdminAnyDatabase', db: 'admin' },
      { role: 'clusterAdmin', db: 'admin' }
    ]
  });
  print('✅ Admin user created successfully');
} catch (error) {
  print('ℹ️ Admin user already exists or creation failed: ' + error.message);
}

// Switch to application database
const dbName = process.env.MONGO_INITDB_DATABASE || 'flashcards';
db = db.getSiblingDB(dbName);

// Create application collections
db.createCollection('users');
db.createCollection('boxes');
db.createCollection('cards');
db.createCollection('stages');
db.createCollection('labels');

print('✅ Database ' + dbName + ' initialized with collections');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.cards.createIndex({ "boxId": 1 });
db.cards.createIndex({ "stageId": 1 });

print('✅ Database indexes created');