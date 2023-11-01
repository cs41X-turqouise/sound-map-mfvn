<template>
  <div class = 'AdminPage'>
    <h1>User List</h1>
    <table class='userTable'>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Uploads</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user._id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span v-for="(upload, uploadIndex) in user.uploads" :key="uploadIndex">
              {{ upload.fileName }}{{ uploadIndex < user.uploads.length - 1 ? ', ' : '' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  /*
  // componets: {
  },
  */
  data () {
    return {
      users: [],
      uploads: [],
      email: [],
    };
    /*
    if (!empty($_SESSION['logged_in'])) {
    header ('Location: ''); //something to fill in, maybe?
      exit;
      }
  else
    {
      //something
    }
    */
  },
  methods: {
    getUser () {
      fetch('users')
        .then((data) => {
          // code
        })
        .then((blob) => {
          // code
        });
      fetch(uploads)
        .then((data) => {
          // code
        });
      // fetch(name);
      fetch(email)
        .then((data) => {
          // code
        });
    }
  }
};
</script>

<style>
.AdminPage {
  display: users;
  display: uploadedContent;
  display: uploaded-content-list;
  display: contents;
  display: loginWithGoogle;
  display: audio;
  display: audioType;
  /*
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  */
}
.userTable {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
/*
.userTable th,
userTable td {

  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.userTable th {
  background-color: #f2f2f2;
}

.userTable td span {
  display: block;
  margin-bottom: 5px;
}

.userTable td span:last-child {
  margin-bottom: 0;
}
*/
</style>
