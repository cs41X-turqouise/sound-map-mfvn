
//const express = require('express');
//const app = express();
//const PORT = 3000;

const mongoURL = ' ';   //Connects to mongoDB (fill in url)
const dbName = 'adminpanel';

app.get('/users', async (res) => 
{
  try 
  {
    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db(dbName);
    const users = await db.collection('users').find().toArray();

    // Fetch associated uploads for each user
    for (const user of users) 
    {
      user.uploads = await db.collection('uploads').find({ userId: user._id }).toArray();
    }

    client.close();
    res.json(users);
  } 
  catch (error) 
  {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
app.listen(PORT, () => 
{
  console.log(`Server is running on port ${PORT}`);
});
*/


<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel</title>
</head>

<body>
  <h1>Admin Panel</h1>
  <table border="1">
    <thead>
      <tr>
        <th>User ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Uploads</th>
      </tr>
    </thead>
    <tbody id="usersTable">
      <!-- Users and their uploads will be displayed here -->
    </tbody>
  </table>

  <script>
    // Fetch users and their uploads from the server and populate the table
    fetch('/users')
      .then(response => response.json())
      .then(users => {
        const usersTable = document.getElementById('usersTable');
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user._id}</td>    //replace user with actual info
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.uploads.map(upload => upload.fileName).join(', ')}</td>
          `;
          usersTable.appendChild(row);
        });
      })
      .catch(error => console.error(error));
  </script>
</body>
</html>