const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Load Models
const MenuItem = require('../models/MenuItem');
const SideItem = require('../models/SideItem');
const Order = require('../models/Order');

const runBackup = async () => {
  try {
    console.log('Connecting to database for backup...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully.');

    console.log('Fetching Menu Items...');
    const menuItems = await MenuItem.find({}).lean();
    console.log(`Found ${menuItems.length} menu items.`);

    console.log('Fetching Side Items...');
    const sideItems = await SideItem.find({}).lean();
    console.log(`Found ${sideItems.length} side items.`);

    console.log('Fetching Orders...');
    const orders = await Order.find({}).lean();
    console.log(`Found ${orders.length} orders.`);

    const backupData = {
      timestamp: new Date().toISOString(),
      menuItems,
      sideItems,
      orders
    };

    const backupPath = path.join(__dirname, '../../database_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`\nSUCCESS: Database backup written to ${backupPath}`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  }
};

runBackup();
