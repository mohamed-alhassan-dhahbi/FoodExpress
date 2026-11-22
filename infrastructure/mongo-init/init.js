db = db.getSiblingDB('foodexpress');

db.createCollection('users');
db.createCollection('restaurants');
db.createCollection('categories');
db.createCollection('dishes');
db.createCollection('orders');