<template>
  <div class="AdminPage">
    <h1>User List</h1>
    <table class="userTable">
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
          <td>
            <button @click="showMenu(user)">
              {{ user._id }}
            </button>
          </td>
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
    <div v-if="selectedUser">
      <h2>Uploaded Files</h2>
      <ul>
        <li v-for="(upload, uploadIndex) in selectedUser.uploads" :key="uploadIndex">
          {{ upload.fileName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Api from '../services/Api';

export default {
  name: 'AdminPage',
  data () {
    return {
      UserID: [
      _id: 1,
          user: 'Prestin B.',
          email: 'Prestin97@gmail.com.com',
          uploads: [
            { fileName: 'file1.txt' },
            { fileName: 'file2.jpg' },
      ],
    ],
    selectedUser: null,
    };
  },
    methods: {
    showMenu(user) {
      this.selectedUser = user;
  },
  beforeCreate () {
    Api().get('uploads/filedata/all').then((response) => {
      this.uploads = response.data;
      console.log(this.uploads);
      });
    },
  },
};
</script>

<style>
.AdminPage {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.userTable {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
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
.selected-user-files {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

</style>
