<template>
  <div class="AdminPage">
    <h1>Users</h1>
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
            <button class="user-id-button" @click="showMenu(user)">
              {{ user._id }}
            </button >
          </td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.uploads.length }}</td>

        </tr>
      </tbody>
    </table>
    <div v-if="selectedUser && selectedUser.uploads">
      <h2 :class="{ 'flash-black': flash }"   >{{ selectedUser.username }}'s Details</h2>
      <div class="tabs">
        <button @click="setActiveTab('uploads')" :class="{ active: activeTab === 'uploads' }">Uploaded Files</button>
        <button @click="setActiveTab('roles')" :class="{ active: activeTab === 'roles' }">Manage User Roles</button>
      </div>
      <div v-show="activeTab === 'uploads'" class="uploads-tab">
        <h2>Uploaded Files</h2>
        <ul v-if="selectedUser.uploads && selectedUser.uploads.length">
          <li v-for="(upload, uploadIndex) in selectedUser.uploads" :key="uploadIndex">
            <tread>
                <td>
                  <img v-if="upload.type === 'image'" :src="upload.url"
                    alt="upload.filename" width="100" height="100" />
                  <audio v-else :src="upload.url" controls></audio>
                  <span>File Id: {{ upload._id }}</span>
                </td>
                <button @click="deleteUpload(upload)">Delete</button>
            </tread>

          </li>
        </ul>
        <p v-else>No uploads found.</p>
      </div>
      <div v-show="activeTab === 'roles'" class="roles-tab">
        <h2>Manage User Roles</h2>
        <p>Current role: {{ selectedUser.role }}</p>
        <button v-if="selectedUser.role !== 'moderator'" @click="changeUserRole(selectedUser, 'admin')">
          Promote to Mod
        </button>
        <button v-if="selectedUser.role !== 'user'" @click="changeUserRole(selectedUser, 'user')">
          Demote to User
        </button>
        <button v-if="!selectedUser.banned" @click="banUser(selectedUser)">Ban User</button>
        <button v-else @click="unbanUser(selectedUser)">Unban User</button>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../services/Api';

export default {
  name: 'AdminPage',
  data () {
    return {
      users: [],
      uploads: [],
      selectedUser: { uploads: [] },
      activeTab: null,
    };
  },
  methods: {
    showMenu (user) {
      this.selectedUser = { ...user, uploads: [] };
      console.log(this.selectedUser);
      Api().get(`uploads/user/${user._id}/uploads`)
        .then((response) => {
          this.selectedUser.uploads = response.data.sounds.concat(response.data.images);
          this.activeTab = 'uploads';
        })
        .catch((error) => {
          console.error(error);
        });
    },
    changeUserRole (user, newRole) {
      Api().put(`users/${user._id}/role`, { role: newRole })
        .then(() => {
          user.role = newRole;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    banUser (user) {
      Api().put(`users/${user._id}/ban`)
        .then(() => {
          user.banned = true;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    setActiveTab (tab) {
      this.activeTab = tab;
    },
    unbanUser (user) {
      Api().put(`users/${user._id}/unban`)
        .then(() => {
          user.banned = false;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    deleteUpload (upload) {
      Api().delete(`uploads/${upload._id}`)
        .then(() => {
          const index = this.selectedUser.uploads.findIndex((u) => u._id === upload._id);
          if (index !== -1) {
            this.selectedUser.uploads.splice(index, 1);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  beforeCreate () {
    Api().get('uploads/filedata/all').then((response) => {
      this.uploads = response.data;
      console.log(this.uploads);
    });
    Api().get('users/').then((response) => {
      this.users = response.data;
      console.log(this.users);
    });
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
  background-color: #fff;
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
.user-id-button:hover {
  color: blue;
  background-color: #f2f2f2;
  text-decoration: underline;
  cursor: pointer;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background-color: #f2f2f2;
  margin-right: 5px;
  cursor: pointer;
}
.tabs button.active {
  background-color: #d1eaff;
}
.tabs button:hover {
  background-color: #e3f2fd;
}
.uploads-tab {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}
.roles-tab {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}
.roles-tab button {
  margin-right: 10px;
}
</style>
