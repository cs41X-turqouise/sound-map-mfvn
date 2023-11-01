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
      upload: [],
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
      fetch(upload)
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
#AdminPage {
  display: users;
  display: uploadedContent;
  display: uploaded-content-list;
  display: contents;
  display: loginWithGoogle;
  display: audio;
  display: audioType;
}
#userTable {
  <!-- something -->
}
</style>
