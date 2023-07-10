const express = require('express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection URL
const url = 'mongodb://127.0.0.1:27017/anonymity';

// Connect to MongoDB
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after successful MongoDB connection
    app.listen(3000, () => {
      console.log('Server started on port 3000');
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

// Define a user schema
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  isAnonymous: { type: Boolean, default: true },
});

// Create a user model
const User = mongoose.model('User', userSchema);

// Parse JSON request bodies
app.use(express.json());

// Create an API endpoint for anonymous user creation
app.post('/users/anonymous', (req, res) => {
  const nameOrEmail = req.body.nameOrEmail;

  createAnonymousUser(nameOrEmail)
    .then(() => {
      res.status(201).json({ message: 'Anonymous user created successfully.' });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
});

// Function to create an anonymous user
async function createAnonymousUser(nameOrEmail) {
  let username;
  let email;

  if (!nameOrEmail) {
    throw new Error('Name or email is required.');
  }

  if (nameOrEmail.includes('@')) {
    // If an email is provided, generate a new email from the first part
    const [usernamePart] = nameOrEmail.split('@');
    email = `${usernamePart}@example.com`;
  } else {
    // If a name is provided, remove spaces and concatenate the name
    username = nameOrEmail.replace(/\s+/g, '');
    email = `${username}@example.com`;
  }

  const user = new User({
    name: nameOrEmail,
    username,
    email,
  });

  // Save the user to the database
  await user.save();
  console.log('Created anonymous user:', user);
}
