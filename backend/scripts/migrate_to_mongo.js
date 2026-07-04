import fs from 'fs';
import path from 'path';
import connectMongo from '../config/mongo.js';
import User from '../models/User.js';

async function migrateUsers() {
  const dataDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data');
  const usersFile = path.join(dataDir, 'users.json');
  if (!fs.existsSync(usersFile)) {
    console.error('users.json not found at', usersFile);
    return;
  }

  const raw = fs.readFileSync(usersFile, 'utf-8');
  const users = JSON.parse(raw);
  console.log('Found', users.length, 'users in JSON.');

  for (const u of users) {
    const doc = {
      id: u.id || Math.random().toString(36).substr(2,9),
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: u.password,
      role: u.role,
      profilePic: u.profilePic,
      walletBalance: u.walletBalance || 0,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date()
    };

    await User.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
  }
  console.log('Users migrated.');
}

async function run() {
  try {
    await connectMongo();
    await migrateUsers();
    console.log('Migration finished.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
