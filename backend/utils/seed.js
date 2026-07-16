import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus_lost_found');

const importData = async () => {
  try {
    await User.deleteMany();
    await LostItem.deleteMany();
    await FoundItem.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Student User',
        usn: '1XX21CS001',
        email: 'student@campus.edu',
        phone: '1234567890',
        password: hashedPassword,
        role: 'student',
      },
      {
        name: 'Admin User',
        usn: 'ADMIN001',
        email: 'admin@campus.edu',
        phone: '0987654321',
        password: hashedPassword,
        role: 'admin',
      },
      {
        name: 'Security User',
        usn: 'SEC001',
        email: 'security@campus.edu',
        phone: '1122334455',
        password: hashedPassword,
        role: 'security',
      },
    ];

    const createdUsers = await User.insertMany(users);
    const studentId = createdUsers[0]._id;
    const adminId = createdUsers[1]._id;

    const lostItems = [
      {
        name: 'Blue Backpack',
        category: 'Accessories',
        description: 'Jansport blue backpack with a keychain',
        location: 'Library, 2nd floor',
        dateLost: new Date(),
        imagePath: '',
        contact: '1234567890',
        status: 'Active',
        ownerId: studentId,
      },
      {
        name: 'Calculater Casio FX-991',
        category: 'Electronics',
        description: 'Scientific calculator, name written on back',
        location: 'Main Building, Room 102',
        dateLost: new Date(Date.now() - 86400000), // 1 day ago
        imagePath: '',
        contact: '1234567890',
        status: 'Active',
        ownerId: studentId,
      }
    ];

    const foundItems = [
      {
        name: 'House Keys',
        category: 'Keys',
        description: 'Set of 3 keys with a red lanyard',
        location: 'Cafeteria',
        dateFound: new Date(),
        imagePath: '',
        finderContact: {
          name: 'Admin User',
          phone: '0987654321',
          email: 'admin@campus.edu'
        },
        status: 'Active',
        finderId: adminId,
      }
    ];

    await LostItem.insertMany(lostItems);
    await FoundItem.insertMany(foundItems);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await LostItem.deleteMany();
    await FoundItem.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
