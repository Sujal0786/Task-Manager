import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@test.com';
  const memberEmail = 'member@test.com';

  let admin = await User.findOne({ email: adminEmail });
  let member = await User.findOne({ email: memberEmail });

  const adminHash = await bcrypt.hash('Admin@123', 12);
  const memberHash = await bcrypt.hash('Member@123', 12);

  if (!admin) {
    admin = await User.create({
      name: 'Demo Admin',
      email: adminEmail,
      password: adminHash,
      role: 'Admin',
    });
    // eslint-disable-next-line no-console
    console.log('Created admin user');
  } else {
    admin.password = adminHash;
    admin.role = 'Admin';
    admin.name = 'Demo Admin';
    await admin.save();
    // eslint-disable-next-line no-console
    console.log('Updated admin user');
  }

  if (!member) {
    member = await User.create({
      name: 'Demo Member',
      email: memberEmail,
      password: memberHash,
      role: 'Member',
    });
    // eslint-disable-next-line no-console
    console.log('Created member user');
  } else {
    member.password = memberHash;
    member.role = 'Member';
    member.name = 'Demo Member';
    await member.save();
    // eslint-disable-next-line no-console
    console.log('Updated member user');
  }

  let project = await Project.findOne({ title: 'TaskFlow Sample Project' });
  if (!project) {
    project = await Project.create({
      title: 'TaskFlow Sample Project',
      description: 'Seeded project with tasks for TaskFlow Manager demo.',
      owner: admin._id,
      members: [admin._id, member._id],
    });
    // eslint-disable-next-line no-console
    console.log('Created sample project');
  } else {
    project.owner = admin._id;
    project.members = [admin._id, member._id];
    await project.save();
    // eslint-disable-next-line no-console
    console.log('Updated sample project');
  }

  const existingTasks = await Task.countDocuments({ projectId: project._id });
  if (existingTasks === 0) {
    const due1 = new Date();
    due1.setDate(due1.getDate() + 3);
    const due2 = new Date();
    due2.setDate(due2.getDate() - 1);
    const due3 = new Date();
    due3.setDate(due3.getDate() + 7);

    await Task.insertMany([
      {
        title: 'Kickoff meeting notes',
        description: 'Document decisions from kickoff.',
        projectId: project._id,
        assignedTo: admin._id,
        createdBy: admin._id,
        status: 'Completed',
        priority: 'Medium',
        dueDate: due1,
      },
      {
        title: 'Implement dashboard charts',
        description: 'Wire dashboard stats to UI.',
        projectId: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        status: 'In Progress',
        priority: 'High',
        dueDate: due2,
      },
      {
        title: 'Review API permissions',
        description: 'Audit role rules for tasks and projects.',
        projectId: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        status: 'Todo',
        priority: 'Low',
        dueDate: due3,
      },
    ]);
    // eslint-disable-next-line no-console
    console.log('Inserted sample tasks');
  } else {
    // eslint-disable-next-line no-console
    console.log('Sample tasks already exist, skipping task seed');
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
