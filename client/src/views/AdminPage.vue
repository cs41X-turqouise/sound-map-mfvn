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
    <div v-if="selectedUser?.username">
      <h2 :class="{ 'flash-black': flash }">{{ selectedUser.username }}'s Details</h2>
      <div class="tabs">
        <button
          @click="setActiveTab('uploads')"
          :class="{ active: activeTab === 'uploads' }">
          Uploaded Files
        </button>
        <button
          @click="setActiveTab('roles')"
          :class="{ active: activeTab === 'roles' }">
          Manage User Roles
        </button>
      </div>
      <div v-show="activeTab === 'uploads'" class="uploads-tab">
        <h2>Uploaded Files</h2>
        <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
          <source :src="activeMedia.url" :type="activeMedia.type">
        </audio>
        <v-table v-if="selectedUser.uploads && selectedUser.uploads.length">
          <thead>
            <tr>
              <th>Actions</th>
              <th>File Id</th>
              <th>File Name</th>
              <th>File Type</th>
              <th>Upload Date</th>
              <th>Title</th>
              <th>Description</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Tags</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(upload, uploadIndex) in selectedUser.uploads" :key="uploadIndex">
              <td>
                <v-btn @click="playMedia(upload)">Play</v-btn>
                <v-btn>Edit</v-btn>
                <v-btn @click="deleteUpload(upload)">Delete</v-btn>
              </td>
              <td><span>{{ upload._id }}</span></td>
              <td><span>{{ upload.filename }}</span></td>
              <td><span>{{ upload.contentType }}</span></td>
              <td><span>{{ new Date(upload.uploadDate).toLocaleDateString() }}</span></td>
              <td><span>{{ upload.metadata.title }}</span></td>
              <td><span>{{ upload.metadata.description }}</span></td>
              <td><span>{{ upload.metadata.latitude }}</span></td>
              <td><span>{{ upload.metadata.longitude }}</span></td>
              <td><span>{{ upload.metadata.tags.join(', ') }}</span></td>
              <td>
                <span>
                  {{ upload.metadata.geodata ? JSON.parse(upload.metadata.geodata).formatted : '' }}
                </span>
              </td>
              <!-- <td>
                <div>
                  <img v-if="upload.type === 'image'" :src="upload.url"
                    alt="upload.filename" width="100" height="100" />
                </div>
              </td> -->
            </tr>
          </tbody>
        </v-table>
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
        <button @click="toggleBan(selectedUser, !selectedUser.banned)">
          {{ !selectedUser.banned ? 'Ban' : 'Unban' }} User
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../services/Api';

/**
 * @typedef {Object} MetadataSchema
 * @property {string} [title]
 * @property {string} [description]
 * @property {string[]} [tags]
 * @property {string} [latitude]
 * @property {string} [longitude]
 * @property {string} [geodata]
 */

/**
 * @typedef {Object} UploadSchema
 * @property {string} _id - MongoDB ObjectId
 * @property {number} length
 * @property {number} chunkSize
 * @property {string} uploadDate - date-time format
 * @property {string} filename
 * @property {string} contentType
 * @property {MetadataSchema} metadata
 * @property {string} user - UserID as a MongoDB ObjectId
 */

/**
 * @typedef {Object} UserSchema
 * @property {string} _id - MongoDB ObjectId
 * @property {string} username
 * @property {string} fullname
 * @property {string} email - Email format
 * @property {string} gid - Google ID
 * @property {string[]} uploads - Array of MongoDB ObjectId
 * @property {string[]} bookmarks - Array of MongoDB ObjectId
 */

export default {
  name: 'AdminPage',
  data () {
    return {
      /** @type { UserSchema[] } */
      users: [],
      /** @type { UploadSchema[] } */
      uploads: [],
      /** @type {{ uploads: UploadSchema[] }} */
      selectedUser: { uploads: [] },
      activeTab: null,
      activeMedia: {
        type: null,
        url: null,
      },
      urls: new Map(),
    };
  },
  methods: {
    setActiveTab (tab) {
      this.activeTab = tab;
    },
    /** @param {UserSchema} user */
    showMenu (user) {
      this.selectedUser = { ...user, uploads: [] };
      console.log(this.selectedUser);
      Api().get(`users/${user._id}/uploads`)
        .then((response) => {
          this.selectedUser.uploads = response.data;
          this.activeTab = 'uploads';
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /** @param {UploadSchema} upload */
    playMedia (upload) {
      this.activeMedia.type = upload.contentType;
      if (this.urls.has(upload._id)) {
        this.activeMedia.url = this.urls.get(upload._id);
      } else {
        Api().get(`uploads/${upload._id}`, { responseType: 'blob' })
          .then((response) => {
            console.log(response.data);
            const objectUrl = URL.createObjectURL(response.data);
            this.urls.set(upload._id, objectUrl);
            this.activeMedia.url = objectUrl;
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    /**
     * @param {UserSchema} user
     * @param {'user' | 'moderator'} newRole
     */
    async changeUserRole (user, newRole) {
      try {
        await Api().patch(`users/${user._id}/role`, { role: newRole });
        user.role = newRole;
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * @param {UserSchema} user
     * @param {boolean} [ban]
     */
    async toggleBan (user, ban = true) {
      try {
        await Api().patch(`users/${user._id}/ban`, { ban });
        user.banned = ban;
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * @param {UploadSchema} upload
     * @param {'sound' | 'image'} [type]
     * */
    async deleteUpload (upload, type = 'sound') {
      try {
        const deleted = await Api().delete(`uploads/${type}/${upload._id}`);
        const index = this.selectedUser.uploads.findIndex((u) => u._id === deleted.data._id);
        if (index !== -1) {
          this.selectedUser.uploads.splice(index, 1);
        }
      } catch (error) {
        console.error(error);
      }
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
