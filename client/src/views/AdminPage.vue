<template>
  <div class="AdminPage">
    <v-toolbar >
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search for Users"
        single-line
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-badge left color="primary" :content="reports.length" style="padding-right: 10px;">
        <v-tooltip
          activator="parent"
          location="start"
          style="z-index: 9999;"
        >
          View Reports
        </v-tooltip>
        <v-btn color="info" icon="mdi-email-outline" @click="viewReports = !viewReports"></v-btn>
      </v-badge>
      <UserMenu></UserMenu>
    </v-toolbar>
    <CenterModal
      :show="viewReports"
      style="top: 0; transform: translate(-50%, 0); font-size: small;"
      :modalStyle="{ 'width': 'fit-content', 'max-width': 'none' }"
      @close="closeReport"
    >
      <h2>Reports</h2>
      <div v-if="reports.length">
        <v-table >
          <thead>
            <tr>
              <th>Actions</th>
              <th>Report ID</th>
              <th>Reporter</th>
              <th>Reported Artifact</th>
              <th>Reported Artifact Owner</th>
              <th>Reason</th>
              <th>Report Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in paginatedReports" :key="index">
              <td>
                <v-btn size="small" width="100px" @click="viewUpload(report)">View Upload</v-btn>
                <v-btn size="small" width="100px" @click="deleteReport(report)">Delete</v-btn>
              </td>
              <td><span>{{ report._id }}</span></td>
              <td><span>{{ users.find((u) => u._id === report.reporter)?.username }}</span></td>
              <td><span>{{ report.fileId }}</span></td>
              <td><span>{{ users.find((u) => u.uploads.find((f) => f._id === report.fileId))?.username }}</span></td>
              <td><span>{{ report.reason }}</span></td>
              <td><span>{{ new Date(report.date).toLocaleDateString() }}</span></td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          class="pagination"
          v-model="currentReportsPage"
          :length="maxReportsPage"
          style="margin-top: auto;">
        </v-pagination>
      </div>
      <p v-else>No reports found.</p>
    </CenterModal>
    <table class="userTable">
      <thead>
        <tr>
          <th>Profile Photo</th>
          <th>User ID</th>
          <th
            v-for="(entry, index) in userTableHeaders"
            :key="index"
            @click="sortUsersBy(entry.key)"
            class="clickable"
          >
            {{ entry.label }}
            <v-icon v-if="usersSortBy.key === entry.key" size="x-small">
              {{ usersSortBy.order === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
            </v-icon>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in paginatedUsers" :key="index">
          <td>
            <img
              v-if="user.profilePhoto"
              :src="user.profilePhoto"
              alt="User Avatar"
              width="50"
              height="50"
            />
          </td>
          <td>
            <button class="user-id-button" @click="showMenu(user)">
              {{ user._id }}
            </button >
          </td>
          <td>{{ user.fullname }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.uploads.length }}</td>
          <td>{{ user.role }}</td>
        </tr>
      </tbody>
    </table>
    <v-pagination
      class="pagination"
      v-model="currentUserPage"
      :length="maxUserPage"
      style="margin-top: auto;">
    </v-pagination>
    <div v-if="selectedUser?.username">
      <h2 ref="selectedUser">
        {{ selectedUser.username }}'s Details
      </h2>
      <div class="tabs">
        <button
          @click="setActiveTab('uploads')"
          :class="{ active: activeTab === 'uploads' }">
          Uploaded Files
        </button>
        <button
          @click="setActiveTab('roles')"
          :class="{ active: activeTab === 'roles' }">
          Manage User
        </button>
      </div>
      <div v-show="activeTab === 'uploads'" class="uploads-tab">
        <CenterModal :show="!!edit.selected" @close="closeEdit">
          <ItemCard :item="edit.selected" :urls="urls" @addUrl="(el) => urls.set(el.id, el.objectUrl)">
          </ItemCard>
          <v-form @submit.prevent="saveEdit">
            <v-text-field
              v-model="edit.new.metadata.title"
              label="Title"
              required
            ></v-text-field>
            <v-textarea
              v-model="edit.new.metadata.description"
              label="Description"
              required
            ></v-textarea>
            <v-text-field
              v-model="edit.tag"
              label="Tags"
              required
              hint="Tags are single words, enter a space to create a new tag"
              persistent-hint
              @keyup.space="addTag"
              @keyup.enter.prevent="addTag"
            ></v-text-field>
            <v-chip-group>
              <v-chip
                v-for="(tag, index) in edit.new.metadata.tags"
                :key="tag"
                closable
                @click:close="edit.new.metadata.tags.splice(index, 1)"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
            <v-btn
              type="submit"
              name="submit"
              value="Submit"
              color="info"
            >
              Save
            </v-btn>
          </v-form>
        </CenterModal>
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
              <th>Image(s)</th>
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
            <tr
              v-for="(upload, uploadIndex) in selectedUser.uploads"
              :key="uploadIndex"
              :ref="`tr-${upload._id}`"
              :class="{ 'highlight': upload._id === selectedReport?.fileId }"
            >
              <td>
                <v-btn @click="playMedia(upload)">Play</v-btn>
                <v-btn @click="setEdit(upload)">
                  Edit{{ edit.selected?._id === upload._id ? 'ing' : '' }}
                </v-btn>
                <v-btn @click="deleteUpload(upload)">Delete</v-btn>
              </td>
              <td><span>{{ upload._id }}</span></td>
              <td><span>{{ upload.filename }}</span></td>
              <td><span>{{ upload.contentType }}</span></td>
              <td v-if="upload.images.length > 0">
                <v-carousel
                  :style="{ width: '200px', height: '150px' }"
                  hide-delimiters
                  :show-arrows="upload.images.length > 1 ? 'hover' : false">
                  <v-carousel-item
                    v-for="(image, imageIndex) in upload.images"
                    :key="imageIndex"
                    :src="urls.get(image) || fetchImage(image)">
                    <v-btn
                      icon
                      density="comfortable"
                      size="small"
                      style="position: absolute; top: 0; right: 0;"
                      @click="deleteImage(image)">
                      <v-tooltip
                        activator="parent"
                        location="start"
                        style="z-index: 9999;"
                      >
                        Delete Image
                      </v-tooltip>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-carousel-item>
                </v-carousel>
              </td>
              <td v-else><span>None</span></td>
              <td><span>{{ new Date(upload.uploadDate).toLocaleDateString() }}</span></td>
              <td><span>{{ upload.metadata.title }}</span></td>
              <td><span>{{ upload.metadata.description }}</span></td>
              <td><span>{{ upload.metadata.latitude }}&deg;</span></td>
              <td><span>{{ upload.metadata.longitude }}&deg;</span></td>
              <td><span>{{ upload.metadata.tags.join(', ') }}</span></td>
              <td>
                <span>
                  {{ upload.metadata.geodata ? JSON.parse(upload.metadata.geodata).formatted : '' }}
                </span>
              </td>
            </tr>
          </tbody>
        </v-table>
        <p v-else>No uploads found.</p>
      </div>
      <div v-show="activeTab === 'roles'" class="roles-tab">
        <h2>Manage User</h2>
        <p>Current role: {{ selectedUser.role }}</p>
        <v-btn
          v-if="selectedUser.role === 'user'"
          @click="changeUserRole(selectedUser, 'moderator')">
          Promote to Mod
        </v-btn>
        <v-btn
          v-else-if="selectedUser.role === 'moderator' && store.state.user.role === 'admin'"
          @click="changeUserRole(selectedUser, 'admin')">
          Promote to Admin
        </v-btn>
        <v-btn
          v-if="selectedUser.role !== 'user'"
          @click="changeUserRole(selectedUser, 'user')">
          Demote to User
        </v-btn>
        <v-btn @click="toggleBan(selectedUser, !selectedUser.banned)">
          {{ !selectedUser.banned ? 'Ban' : 'Unban' }} User
        </v-btn>
        <v-btn @click="deleteUser(selectedUser)">
          Delete User
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import CenterModal from '../components/CenterModal.vue';
import UserMenu from '../components/UserMenu.vue';
import ItemCard from '../components/ItemCard.vue';

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
 * @property {string[]} images - Array of MongoDB ObjectId
 */

/**
 * @typedef {Object} UserSchema
 * @property {string} _id - MongoDB ObjectId
 * @property {string} username
 * @property {string} fullname
 * @property {string} email - Email format
 * @property {string} gid - Google ID
 * @property {string[] | UploadSchema[]} uploads - Array of MongoDB ObjectId or UploadSchema
 * @property {string[]} bookmarks - Array of MongoDB ObjectId
 * @property {string} role - 'user' | 'moderator' | 'admin'
 * @property {boolean} banned
 */

/**
 * @typedef {Object} ReportSchema
 * @property {string} _id - The MongoDB ObjectId of the document.
 * @property {string} reporter - The MongoDB ObjectId of the user who created the report.
 * @property {string} fileId - The MongoDB ObjectId of the upload being reported.
 * @property {string} reason - The reason for the report.
 * @property {Date} date - The date the report was created.
 */

export default {
  name: 'AdminPage',
  components: {
    CenterModal,
    UserMenu,
    ItemCard,
  },
  setup () {
    const store = useStore();
    return { store };
  },
  data () {
    return {
      userTableHeaders: [
        { key: 'fullname', label: 'Full Name' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'uploads.length', label: 'Uploads' },
        { key: 'role', label: 'Role' },
      ],
      /** @type { UserSchema[] } */
      users: [],
      /** @type { UploadSchema[] } */
      uploads: [],
      /** @type { UserSchema } */
      selectedUser: { uploads: [] },
      /** @type { ReportSchema } */
      selectedReport: null,
      activeTab: null,
      activeMedia: {
        type: null,
        url: null,
      },
      urls: new Map(),
      search: '',
      reports: [],
      viewReports: false,
      currentUserPage: 1,
      usersPerPage: 10,
      currentReportsPage: 1,
      reportsPerPage: 3,
      usersSortBy: {
        key: '',
        order: 'asc',
        sorted: false,
      },
      edit: {
        selected: null,
        new: null,
        tag: '',
      },
    };
  },
  computed: {
    maxUserPage () {
      return Math.ceil(this.filteredUsers.length / this.usersPerPage);
    },
    paginatedUsers () {
      const start = (this.currentUserPage - 1) * this.usersPerPage;
      const end = start + this.usersPerPage;
      return this.filteredUsers.slice(start, end);
    },
    filteredUsers () {
      if (!this.search) return this.users;
      return this.users.filter((user) =>
        user.fullname.toLowerCase().includes(this.search.toLowerCase())
        || user.username.toLowerCase().includes(this.search.toLowerCase())
        || user.email.toLowerCase().includes(this.search.toLowerCase())
        || user.uploads.length.toString().includes(this.search)
        || user.role.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    maxReportsPage () {
      return Math.ceil(this.reports.length / this.reportsPerPage);
    },
    paginatedReports () {
      const start = (this.currentReportsPage - 1) * this.reportsPerPage;
      const end = start + this.reportsPerPage;
      return this.reports.slice(start, end);
    },
  },
  methods: {
    /** @param {'uploads' | 'roles'} tab */
    setActiveTab (tab) {
      this.activeTab = tab;
    },
    /** @param {UploadSchema} upload */
    setEdit (upload) {
      this.edit.selected = JSON.parse(JSON.stringify(upload));
      this.edit.new = JSON.parse(JSON.stringify(upload));
    },
    addTag () {
      /** @type {string} */
      const tag = this.edit.tag.toLowerCase().replace(/\s+/g, '');
      if (!tag) {
        this.edit.tag = '';
      } else if (!this.edit.new.metadata.tags.includes(tag)) {
        this.edit.new.metadata.tags.push(tag);
        this.edit.tag = '';
      }
    },
    closeEdit () {
      this.edit.selected = null;
      this.edit.new = null;
    },
    saveEdit () {
      Api().patch(`uploads/metadata/${this.edit.selected._id}`, { ...this.edit.new.metadata })
        .then((response) => {
          const index = this.selectedUser.uploads.findIndex((u) => u._id === response.data._id);
          if (index !== -1) {
            this.selectedUser.uploads[index].metadata = response.data.metadata;
          }
          this.edit.selected = null;
          this.edit.new = null;
          this.edit.tag = '';
        })
        .catch((error) => {
          console.error(error);
        });
    },
    closeReport () {
      this.selectedReport = null;
      this.viewReports = false;
    },
    /** @param {string} val */
    sortUsersBy (val) {
      if (this.usersSortBy.key === val) {
        this.usersSortBy.order = this.usersSortBy.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.usersSortBy.key = val;
        this.usersSortBy.order = 'asc';
      }
      const key = this.usersSortBy.key;
      const order = this.usersSortBy.order;
      const sorted = this.usersSortBy.sorted;
      if (val.includes('.')) {
        const [obj, prop] = val.split('.');
        this.users.sort((a, b) => {
          if (a[obj][prop] < b[obj][prop]) {
            return order === 'asc' ? -1 : 1;
          }
          if (a[obj][prop] > b[obj][prop]) {
            return order === 'asc' ? 1 : -1;
          }
          return 0;
        });
      } else {
        this.users.sort((a, b) => {
          if (a[key] < b[key]) {
            return order === 'asc' ? -1 : 1;
          }
          if (a[key] > b[key]) {
            return order === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      this.usersSortBy.sorted = !sorted;
    },
    /** @param {UserSchema} user */
    async showMenu (user) {
      this.selectedUser = { ...user, uploads: [] };
      try {
        const uploads = await Api().get(`users/${user._id}/uploads`);
        this.selectedUser.uploads = uploads.data;
        this.activeTab = 'uploads';
        this.$nextTick(() => {
          this.$refs['selectedUser'].scrollIntoView();
        });
      } catch (error) {
        console.error(error);
      }
    },
    /** @param {ReportSchema} report */
    async viewUpload (report) {
      try {
        this.selectedUser = {
          ...this.users.find((u) => u.uploads.find((f) => f._id === report.fileId)),
          uploads: []
        };
        const uploads = await Api().get(`users/${this.selectedUser._id}/uploads`);
        this.selectedUser.uploads = uploads.data;
        this.activeTab = 'uploads';
        this.selectedReport = report;
        this.$nextTick(() => {
          this.$refs[`tr-${report.fileId}`][0].scrollIntoView();
        });
      } catch (error) {
        console.error(error);
      }
    },
    /** @param {UploadSchema} upload */
    async playMedia (upload) {
      this.activeMedia.type = upload.contentType;
      if (this.urls.has(upload._id)) {
        this.activeMedia.url = this.urls.get(upload._id);
      } else {
        await Api().get(`uploads/${upload._id}`, { responseType: 'blob' })
          .then((response) => {
            const objectUrl = URL.createObjectURL(response.data);
            this.urls.set(upload._id, objectUrl);
            this.activeMedia.url = objectUrl;
          })
          .catch((error) => {
            console.error(error);
          });
      }
      this.$nextTick(() => {
        const audioPlayer = this.$refs['audio-player'];
        audioPlayer.play();
      });
    },
    /** @param {string} id  */
    async fetchImage (id) {
      await Api().get(`uploads/image/${id}`, { responseType: 'blob' })
        .then((response) => {
          const objectUrl = URL.createObjectURL(response.data);
          this.urls.set(id, objectUrl);
          return objectUrl;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /**
     * @param {UserSchema} user
     * @param {'user' | 'moderator'} newRole
     */
    async changeUserRole (user, newRole) {
      try {
        await Api().patch(`users/${user._id}/role`, { role: newRole });
        const _user = this.users.find((u) => u._id === user._id);
        if (_user) {
          user.role = newRole;
          _user.role = newRole;
        }
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
    /** @param {UploadSchema} upload */
    async deleteUpload (upload) {
      try {
        const deleted = await Api().delete(`uploads/sound/${upload._id}`);
        const index = this.selectedUser.uploads.findIndex((u) => u._id === deleted.data._id);
        if (this.edit.selected?._id === deleted.data._id) {
          this.edit.selected = null;
          this.edit.new = null;
        }
        if (index !== -1) {
          this.selectedUser.uploads.splice(index, 1);
        }
      } catch (error) {
        console.error(error);
      }
    },
    /** @param {string} image */
    async deleteImage (image) {
      try {
        const deleted = await Api().delete(`uploads/image/${image}`);
        const upload = this.selectedUser.uploads.find((u) => u.images.includes(deleted.data._id));
        if (upload) {
          const index = upload.images.findIndex((i) => i === deleted.data._id);
          if (index !== -1) {
            upload.images.splice(index, 1);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    /** @param {UserSchema} user */
    async deleteUser (user) {
      try {
        await Api().delete(`users/${user._id}`);
        const index = this.users.findIndex((u) => u._id === user._id);
        if (index !== -1) {
          this.users.splice(index, 1);
        }
        this.selectedUser = { uploads: [] };
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {ReportSchema} report */
    async deleteReport (report) {
      try {
        await Api().delete(`reports/${report._id}`);
        const index = this.reports.findIndex((r) => r._id === report._id);
        if (index !== -1) {
          this.reports.splice(index, 1);
        }
      } catch (err) {
        console.error(err);
      }
    },
  },
  watch: {
    search () {
      this.currentUserPage = 1;
    },
  },
  /**
   * Lifecycle hook
   */
  async beforeCreate () {
    if (!this.store.state.user) {
      await Api().get('users/self').then((response) => {
        this.store.dispatch('setUser', response.data);
      }).catch((error) => {
        console.log(error);
      });
      if (!this.store.state.user || this.store.state.user.role === 'user') {
        this.$router.push({ path: '/' });
      }
    }
    Api().get('uploads/filedata/all').then((response) => {
      this.uploads = response.data;
      console.log(this.uploads);
    });
    Api().get('users/').then((response) => {
      this.users = response.data;
      console.log(this.users);
    });
    Api().get('reports/').then((response) => {
      this.reports = response.data;
      console.log(this.reports);
    });
  },
};
</script>

<style scoped>
.AdminPage {
  padding: 20px;
}
.userTable {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  text-align: center;
}
.userTable th,
userTable td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
@media (max-width: 900px) {
  h1 {
    font-size: 2rem;
  }
  .userTable {
    margin-top: 10px;
    font-size: small;
  }
  .userTable th,
  userTable td {
    padding: 5px;
  }
}
.userTable th {
  background-color: #f2f2f2;
}
/* .userTable tr:nth-child(4n), .userTable tr:nth-child(4n-1) {
  background-color: #f2f2f2;
}
.userTable tr:nth-child(4n-2), .userTable tr:nth-child(4n-3) {
  background-color: #e6e6e6;
} */
.userTable tr:nth-child(2n) {
  background-color: #f2f2f2;
}
.userTable tr:nth-child(2n - 1) {
  background-color: #e6e6e6;
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
  font-size: small;
}
.roles-tab {
  margin: 0 auto;
  max-width: 800px;
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}
.roles-tab button {
  margin-right: 10px;
}
.clickable {
  cursor: pointer;
}
.clickable:hover {
  background-color: #e3f2fd;
}
.highlight {
  background-color: #d1eaff;
}
</style>
