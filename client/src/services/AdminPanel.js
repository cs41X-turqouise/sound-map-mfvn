
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
    await client.connect();     //connects mongoDB servers

    const db = client.db(dbName);
    const users = await db.collection('users').find().toArray();
    for (const user of users) 
    {
      user.uploads = await db.collection('uploads').find({ userId: user._id }).toArray();
    }

    client.close();
    res.json(users);
  } 
  catch (error) 
  {
    res.status(500).json({ error: 'Internal Server Error' });   //error statement
  }
});

/*
app.listen(PORT, () => 
{
  console.log(`Server is running on port ${PORT}`);
});
*/


<template>
<head>
  <meta></meta> charset="UTF-8"
  <meta></meta> name="viewport" content="width=device-width, initial-scale=1.0"
  <title>Admin Panel</title>
</head>
<table></table>
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
    <!-- Users and content will be kept here -->  
    </tbody>
  </table>

  <script>
    // User uploads will fill into the table for storage
    fetch('/users')
      .then(response '{'>'}' response.json())
      .then(users '{'>'}' {
        const usersTable = document.getElementById('usersTable');
        users.forEach(user '{'>'}' 
        {
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
      .catch(error '{'>'}' console.error(error));
  </script>
</body>
</template>