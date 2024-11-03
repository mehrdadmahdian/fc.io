const dbName = process.env.MONGO_INITDB_DATABASE || 'defaultDatabase';

db = db.getSiblingDB(dbName);
db.createCollection('myFirstCollection');

db.myFirstCollection.insertOne({ name: "test"});