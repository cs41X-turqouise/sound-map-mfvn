<template>
  <div v-if="store.state.user" class="AdminPage">
    <v-toolbar class="" color="deep-orange-accent-1">
      <v-hover v-slot="{ isHovering, props }">
        <v-img
          v-bind="props"
          id="logo"
          class="ml-2"
          cover
          :src="isHovering ? '/soundmap_logo.gif' : '/soundmap_logo.png'"
          style="max-width: 175px; cursor: pointer;"
          @click="$router.push('/')"
        />
      </v-hover>
      <v-spacer></v-spacer>
      <UserMenu></UserMenu>
    </v-toolbar>

    <v-layout row justify-center>
      <v-dialog v-model="editDialog" persistent max-width="500px">
        <v-card v-if="!!edit.selected">
          <v-card-title>
            <span class="headline">Edit Upload</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md class="bg-white">
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
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="red"
              @click="Object.assign(edit.new.metadata, edit.selected.metadata)"
            >
              Reset
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="red" @click="closeEdit">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              type="submit"
              name="submit"
              value="Submit"
              color="blue"
              @click="saveEdit"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

    <v-sheet>
      <v-tabs
        v-model="activeMainTab"
        color="primary"
        dark
        grow
        slider-color="primary"
        height="52px"
      >
        <v-tab value="users">
          <v-icon>mdi-account-group</v-icon>
          Users
        </v-tab>
        <v-tab value="uploads">
          <v-icon>mdi-upload</v-icon>
          Uploads
        </v-tab>
        <v-tab value="pending">
          <v-badge
            location="top right"
            floating
            color="primary"
            :content="pendingUploads.length"
            style="padding-right: 10px;"
          >
            <v-icon>mdi-upload</v-icon>
          </v-badge>
          Pending
        </v-tab>
        <v-tab value="reports">
          <v-badge location="top right" floating color="primary" :content="reports.length" style="padding-right: 10px;">
            <v-icon>mdi-email-outline</v-icon>
          </v-badge>
          Reports
        </v-tab>
      </v-tabs>

      <div v-if="activeMainTab === 'users'">
        <v-table class="userTable" density="comfortable">
          <template v-slot:top>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search for Users"
              single-line
              hide-details
              clearable
              rounded
              variant="outlined"
              style="max-width: 50%;"
            ></v-text-field>
          </template>
          <thead>
            <tr>
              <th style="max-width: fit-content">
                Avatar
              </th>
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
                </button>
              </td>
              <td>{{ user.fullname }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.uploads.length }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
          <template v-slot:bottom>
            <v-pagination
              class="pagination"
              v-model="userTable.current"
              :length="maxUserPage"
              style="margin-top: auto;"
            >
            </v-pagination>
          </template>
        </v-table>
      </div>

      <div v-if="activeMainTab === 'uploads'">
        <v-row>
          <v-col cols="12" sm="6" md="6">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search for Uploads"
              single-line
              hide-details
              clearable
              rounded
              variant="outlined"
              style="max-width: 75%;"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
              <source :src="activeMedia.url" :type="activeMedia.type">
            </audio>
          </v-col>
        </v-row>

        <v-container class="userTable" density="comfortable">
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="6"
              v-for="upload in paginatedUploads"
              :key="upload._id"
            >
              <ItemCard
                :item="upload"
                :urls="urls"
                @add-url="(el) => urls.set(el.id, el.objectUrl)"
              >
                <template v-slot:actions>
                  <v-btn icon @click="playMedia(upload)">
                    <v-tooltip activator="parent" location="top">
                      Play
                    </v-tooltip>
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                  <v-btn icon @click="setEdit(upload)">
                    <v-tooltip activator="parent" location="top">
                      Edit
                    </v-tooltip>
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon>
                    <v-tooltip activator="parent" location="top">
                      Delete
                    </v-tooltip>
                    <v-icon>mdi-delete</v-icon>
                    <ReportDialog @submit-reason="(reason) => deleteUpload(upload, reason)" />
                  </v-btn>
                  <v-btn icon @click="toggleVisibility(upload)">
                    <v-tooltip activator="parent" location="top">
                      {{ upload.visible ? 'Visible' : 'Hidden' }}
                    </v-tooltip>
                    <v-icon>{{ !!upload.visible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                  </v-btn>
                </template>
              </ItemCard>
            </v-col>
          </v-row>
        </v-container>

        <v-pagination
          v-model="uploadsTable.current"
          :length="maxUploadsPage"
        ></v-pagination>
      </div>

      <div v-if="activeMainTab === 'pending'">
        <div v-if="pendingUploads.length">
          <v-row>
            <v-col cols="12" sm="6" md="6">
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search for Uploads"
                single-line
                hide-details
                clearable
                rounded
                variant="outlined"
                style="max-width: 75%;"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
                <source :src="activeMedia.url" :type="activeMedia.type">
              </audio>
            </v-col>
          </v-row>

          <v-container class="userTable" density="comfortable">
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="6"
                v-for="upload in paginatedPendingUploads"
                :key="upload._id"
              >
                <ItemCard
                  :item="upload"
                  :urls="urls"
                  @add-url="(el) => urls.set(el.id, el.objectUrl)"
                >
                  <template v-slot:actions>
                    <v-btn icon @click="playMedia(upload)">
                      <v-tooltip activator="parent" location="top">
                        Play
                      </v-tooltip>
                      <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <v-btn icon @click="setEdit(upload)">
                      <v-tooltip activator="parent" location="top">
                        Edit
                      </v-tooltip>
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon>
                      <v-tooltip activator="parent" location="top">
                        Delete
                      </v-tooltip>
                      <v-icon>mdi-delete</v-icon>
                      <ReportDialog @submit-reason="(reason) => deleteUpload(upload, reason)" />
                    </v-btn>
                    <v-btn icon @click="toggleVisibility(upload)">
                      <v-tooltip activator="parent" location="top">
                        {{ upload.visible ? 'Visible' : 'Hidden' }}
                      </v-tooltip>
                      <v-icon>{{ !!upload.visible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                    </v-btn>
                    <v-btn icon>
                      <v-tooltip activator="parent" location="top">
                        Disapprove
                      </v-tooltip>
                      <v-icon color="red">
                        mdi-close-thick
                      </v-icon>
                      <ReportDialog @submit-reason="(reason) => dissaproveUpload(upload, reason)" />
                    </v-btn>
                    <v-btn icon @click="approveUpload(upload)">
                      <v-tooltip activator="parent" location="top">
                        Approve
                      </v-tooltip>
                      <v-icon color="green">
                        mdi-check-bold
                      </v-icon>
                    </v-btn>
                  </template>
                </ItemCard>
              </v-col>
            </v-row>
          </v-container>

          <v-pagination
            v-model="pendingTable.current"
            :length="maxPendingUploadsPage"
          ></v-pagination>
        </div>
        <span v-else>Nothing for now</span>
      </div>

      <div v-if="activeMainTab === 'reports'">
        <v-table v-if="reports.length" class="reportsTable" density="comfortable">
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
                <v-btn size="small" width="100px" @click="viewUpload(report)">
                  View Upload
                </v-btn>
                <v-btn size="small" width="100px" @click="deleteReport(report)">
                  Delete
                </v-btn>
              </td>
              <td><span>{{ report._id }}</span></td>
              <td><span>{{ users.find((u) => u._id === report.reporter)?.username }}</span></td>
              <td><span>{{ report.fileId }}</span></td>
              <td><span>{{ users.find((u) => u.uploads.find((f) => f._id === report.fileId))?.username }}</span></td>
              <td><span>{{ report.reason }}</span></td>
              <td><span>{{ new Date(report.date).toLocaleDateString() }}</span></td>
            </tr>
          </tbody>
          <template v-slot:bottom>
            <v-pagination
              class="pagination"
              v-model="reportsTable.current"
              :length="maxReportsPage"
              style="margin-top: auto;"
            >
            </v-pagination>
          </template>
        </v-table>
        <p v-else>
          No reports found.
        </p>
      </div>
    </v-sheet>

    <v-card v-if="selectedUser?.username" class="details">
      <v-card-title primary-title>
        <h3 ref="selectedUser">
          {{ selectedUser.username }}'s Details
        </h3>
      </v-card-title>

      <v-tabs
        v-model="activeUserTab"
        color="primary"
        dark
        grow
        slider-color="primary"
      >
        <v-tab value="uploads">
          <v-icon>mdi-upload</v-icon>
          Uploaded Files
        </v-tab>
        <v-tab value="roles">
          <v-icon>mdi-account</v-icon>
          Manage User
        </v-tab>
      </v-tabs>

      <div v-show="activeUserTab === 'uploads'" class="uploads-tab">
        <v-table v-if="selectedUser.uploads && selectedUser.uploads.length">
          <template v-slot:top>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="userUploadSearch"
                  append-icon="mdi-magnify"
                  label="Search for Uploads"
                  single-line
                  hide-details
                  clearable
                  rounded
                  max-width="50%"
                  width="100px"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
                  <source :src="activeMedia.url" :type="activeMedia.type">
                </audio>
              </v-col>
            </v-row>
          </template>
          <thead>
            <tr>
              <th style="width: 50px">
                Actions
              </th>
              <th style="width: 500px">
                Upload Data
              </th>
              <th style="width: 200px;">
                Metadata
              </th>
              <th>Image(s)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(upload, uploadIndex) in paginatedUserUploads"
              :key="uploadIndex"
              :ref="`tr-${upload._id}`"
              :class="{ 'highlight': upload._id === selectedReport?.fileId }"
            >
              <td>
                <v-row dense>
                  <v-col>
                    <v-btn class="text-button" @click="playMedia(upload)">
                      Play
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn class="text-button" @click="setEdit(upload)">
                      Edit{{ edit.selected?._id === upload._id ? 'ing' : '' }}
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn class="text-button">
                      Delete
                      <ReportDialog @submit-reason="(reason) => deleteUpload(upload, reason)" />
                    </v-btn>
                  </v-col>
                </v-row>
              </td>
              <td>
                <v-card flat class="my-2">
                  <v-card-subtitle>
                    Title: <span>{{ upload.metadata.title }}</span>
                  </v-card-subtitle>
                  <v-card-subtitle class="wrap-text">
                    Address:
                    <span>
                      {{ upload.metadata.geodata ? JSON.parse(upload.metadata.geodata).formatted : '' }}
                    </span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Description: <p class="wrap-text">
                      {{ upload.metadata.description }}
                    </p>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Tags:
                    <v-chip
                      v-for="(tag, index) in upload.metadata.tags"
                      :key="index"
                      color="primary"
                      text-color="white"
                      size="small"
                      density="comfortable"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-card-subtitle>
                </v-card>
              </td>
              <td>
                <v-card flat class="my-2">
                  <v-card-subtitle>
                    ID: <span>{{ upload._id }}</span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Uploaded: <span>{{ new Date(upload.uploadDate).toLocaleDateString() }}</span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Type: <span>{{ upload.contentType }}</span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    File Name: <span>{{ upload.filename }}</span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    File Size: <span>{{ upload.length / 1000 }} KB</span>
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Location: <span>{{ upload.metadata.latitude }}&deg;, {{ upload.metadata.longitude }}&deg;</span>
                  </v-card-subtitle>
                </v-card>
              </td>
              <td v-if="upload.images.length > 0">
                <v-carousel
                  :style="{ width: '200px', height: '150px' }"
                  hide-delimiters
                  :show-arrows="upload.images.length > 1 ? 'hover' : false"
                >
                  <v-carousel-item
                    v-for="(image, imageIndex) in upload.images"
                    :key="imageIndex"
                    :src="urls.get(image) || fetchImage(image)"
                  >
                    <v-btn
                      icon
                      density="comfortable"
                      size="small"
                      style="position: absolute; top: 0; right: 0;"
                    >
                      <v-tooltip
                        activator="parent"
                        location="start"
                        style="z-index: 9999;"
                      >
                        Delete Image
                      </v-tooltip>
                      <ReportDialog @submit-reason="(reason) => deleteImage(image, reason)" />
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-carousel-item>
                </v-carousel>
              </td>
              <td v-else>
                <span>None</span>
              </td>
              <td>
                <v-chip
                  :color="upload.approvedBy ? 'green' : 'red'"
                  text-color="white"
                  size="small"
                  density="comfortable"
                >
                  {{ upload.approvedBy ? 'Approved' : 'Pending' }}
                </v-chip>
              </td>
            </tr>
          </tbody>
          <template v-slot:bottom>
            <v-pagination
              class="pagination"
              v-model="uploadsTable.current"
              :length="maxUserUploadsPage"
              style="margin-top: auto;"
            >
            </v-pagination>
          </template>
        </v-table>
        <p v-else>
          No uploads found.
        </p>
      </div>

      <v-card v-show="activeUserTab === 'roles'" class="roles-tab">
        <v-row>
          <v-col cols="12" sm="4" md="4">
            <v-card flat>
              <v-card-subtitle>
                Full Name: <span>{{ selectedUser.fullname }}</span>
              </v-card-subtitle>
              <v-card-subtitle>
                Email: <span>{{ selectedUser.email }}</span>
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-card flat>
              <v-card-subtitle>
                Role: <span>{{ selectedUser.role }}</span>
              </v-card-subtitle>
              <v-card-subtitle>
                Banned: <span>{{ selectedUser.banned ? 'Yes' : 'No' }}</span>
              </v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="4">
            <v-card flat>
              <v-card-subtitle>
                Uploads: <span>{{ selectedUser.uploads.length }}</span>
              </v-card-subtitle>
              <v-card-subtitle>
                Bookmarks: <span>{{ selectedUser.bookmarks.length }}</span>
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions style="justify-content: center; margin-top: 10px;">
          <v-btn
            v-for="button in promoteRoleButtons"
            :key="button.text"
            variant="outlined"
            class="text-button"
            @click="button.click"
          >
            {{ button.text }}
          </v-btn>

          <v-btn
            v-if="selectedUser.role === 'admin' && store.state.user.role === 'superadmin'"
            class="text-button"
            variant="outlined"
          >
            Demote to Mod
            <ReportDialog @submit-reason="(reason) => changeUserRole(selectedUser, 'moderator', reason)" />
          </v-btn>

          <v-btn
            v-if="selectedUser.role !== 'user' && roles[selectedUser.role] < roles[store.state.user.role]"
            variant="outlined"
            class="text-button"
          >
            Demote to User
            <ReportDialog @submit-reason="(reason) => changeUserRole(selectedUser, 'user', reason)" />
          </v-btn>

          <v-btn
            v-if="roles[selectedUser.role] < roles[store.state.user.role]"
            variant="outlined"
            class="text-button"
          >
            {{ !selectedUser.banned ? 'Ban' : 'Unban' }} User
            <ReportDialog @submit-reason="(reason) => toggleBan(selectedUser, !selectedUser.banned, reason)" />
          </v-btn>

          <v-btn
            v-if="roles[selectedUser.role] < roles[store.state.user.role] || selectedUser._id === store.state.user._id"
            variant="outlined"
            class="text-button"
            @click="editUserDialog = true"
          >
            Change Username
            <UsernameForm
              v-if="editUserDialog"
              :allow-cancel="true"
              :user-id="selectedUser._id"
              @close="editUserDialog = false"
            />
          </v-btn>

          <v-btn
            v-if="roles[selectedUser.role] < roles[store.state.user.role]"
            variant="outlined"
            class="text-button"
            @click="deleteUser(selectedUser)"
          >
            Delete User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-card>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import UserMenu from '../components/UserMenu.vue';
import ItemCard from '../components/ItemCard.vue';
import ReportDialog from '../components/ReportDialog.vue';
import UsernameForm from '../components/UsernameForm.vue';

/** @typedef {import('../App.vue').UserSchema} UserSchema */
/** @typedef {import('../App.vue').ReportSchema} ReportSchema */
/** @typedef {import('../App.vue').MetadataSchema} Metadataschema */
/** @typedef {import('../App.vue').UploadSchema} UploadSchema */

/** @param {number} perPage */
const paginationSetup = (perPage) => ({
  current: 1,
  perPage
});

export default {
  name: 'AdminPage',
  components: {
    UserMenu,
    ItemCard,
    ReportDialog,
    UsernameForm,
  },
  setup () {
    const store = useStore();
    const roles = Object.freeze({
      user: 1,
      moderator: 2,
      admin: 3,
      superadmin: 4,
    });
    const userTableHeaders = [
      { key: 'fullname', label: 'Full Name' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'uploads.length', label: 'Uploads' },
      { key: 'role', label: 'Role' },
    ];
    return { store, roles, userTableHeaders };
  },
  data () {
    return {
      /** @type { UserSchema[] } */
      users: [],
      /** @type { UploadSchema[] } */
      uploads: [],
      /** @type { UserSchema } */
      selectedUser: { uploads: [] },
      /** @type { ReportSchema } */
      selectedReport: null,
      activeMainTab: 'users',
      activeUserTab: null,
      activeMedia: {
        type: null,
        url: null,
      },
      urls: new Map(),
      search: '',
      userUploadSearch: '',
      reports: [],
      viewReports: false,
      userTable: paginationSetup(10),
      pendingTable: paginationSetup(10),
      uploadsTable: paginationSetup(5),
      reportsTable: paginationSetup(3),
      usersSortBy: {
        key: '',
        order: 'asc',
        sorted: false,
      },
      editDialog: false,
      editUserDialog: false,
      edit: {
        selected: null,
        new: null,
        tag: '',
      },
    };
  },
  computed: {
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
    maxUserPage () {
      return Math.ceil(this.filteredUsers.length / this.userTable.perPage);
    },
    paginatedUsers () {
      const start = (this.userTable.current - 1) * this.userTable.perPage;
      const end = start + this.userTable.perPage;
      return this.filteredUsers.slice(start, end);
    },
    filteredUploads () {
      if (!this.search) return this.uploads.filter((upload) => upload.approvedBy);
      return this.uploads.filter((upload) => upload.approvedBy
        && (upload.metadata.title.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.description.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.tags.some((tag) => tag.toLowerCase().includes(this.search.toLowerCase()))
        || upload.filename.toLowerCase().includes(this.search.toLowerCase())
        || upload.contentType.toLowerCase().includes(this.search.toLowerCase()))
      );
    },
    maxUploadsPage () {
      return Math.ceil(this.filteredUploads.length / this.uploadsTable.perPage);
    },
    paginatedUploads () {
      const start = (this.uploadsTable.current - 1) * this.uploadsTable.perPage;
      const end = start + this.uploadsTable.perPage;
      return this.filteredUploads.slice(start, end);
    },
    filteredUserUploads () {
      if (!this.userUploadSearch) return this.selectedUser.uploads;
      return this.selectedUser.uploads.filter((upload) =>
        upload.metadata.title.toLowerCase().includes(this.userUploadSearch.toLowerCase())
        || upload.metadata.description.toLowerCase().includes(this.userUploadSearch.toLowerCase())
        || upload.metadata.tags.some((tag) => tag.toLowerCase().includes(this.userUploadSearch.toLowerCase()))
        || upload.filename.toLowerCase().includes(this.userUploadSearch.toLowerCase())
        || upload.contentType.toLowerCase().includes(this.userUploadSearch.toLowerCase())
      );
    },
    maxUserUploadsPage () {
      return Math.ceil(this.filteredUserUploads.length / this.uploadsTable.perPage);
    },
    paginatedUserUploads () {
      const start = (this.uploadsTable.current - 1) * this.uploadsTable.perPage;
      const end = start + this.uploadsTable.perPage;
      return this.filteredUserUploads.slice(start, end);
    },
    pendingUploads () {
      return this.uploads.filter((upload) => !upload.approvedBy);
    },
    maxPendingUploadsPage () {
      return Math.ceil(this.pendingUploads.length / this.pendingTable.perPage);
    },
    paginatedPendingUploads () {
      const start = (this.pendingTable.current - 1) * this.pendingTable.perPage;
      const end = start + this.pendingTable.perPage;
      return this.pendingUploads.slice(start, end);
    },
    maxReportsPage () {
      return Math.ceil(this.reports.length / this.reportsTable.perPage);
    },
    paginatedReports () {
      const start = (this.reportsTable.current - 1) * this.reportsTable.perPage;
      const end = start + this.reportsTable.perPage;
      return this.reports.slice(start, end);
    },
    promoteRoleButtons () {
      return [
        {
          condition: this.selectedUser.role === 'user' && this.roles[this.store.state.user.role] > this.roles['moderator'],
          click: () => this.changeUserRole(this.selectedUser, 'moderator'),
          text: 'Promote to Mod',
        },
        {
          condition: this.selectedUser.role === 'moderator' && this.store.state.user.role === 'superadmin',
          click: () => this.changeUserRole(this.selectedUser, 'admin'),
          text: 'Promote to Admin',
        },
      ].filter((button) => button.condition);
    },
  },
  methods: {
    /** @param {UploadSchema} upload */
    setEdit (upload) {
      this.edit.selected = JSON.parse(JSON.stringify(upload));
      this.edit.new = JSON.parse(JSON.stringify(upload));
      this.editDialog = true;
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
      this.edit.tag = '';
      this.editDialog = false;
    },
    async saveEdit () {
      try {
        const res = await Api().patch(`uploads/metadata/${this.edit.selected._id}`, { ...this.edit.new.metadata });
        const owner = this.selectedUser._id
          ? this.selectedUser
          : this.users.find((u) => u.uploads.find((f) => f._id === res.data._id));
        const index = owner.uploads.findIndex((u) => u._id === res.data._id);
        const uIdx = this.uploads.findIndex((u) => u._id === res.data._id);
        index !== -1 && (owner.uploads[index].metadata = res.data.metadata);
        uIdx !== -1 && (this.uploads[uIdx].metadata = res.data.metadata);
        this.closeEdit();
      } catch (err) {
        console.error(err);
      }
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
        this.activeUserTab = 'uploads';
        this.selectedReport = report;
        /**
         * Figure out which page the report is on and set the current page to that.
         */
        const index = this.selectedUser.uploads.findIndex((u) => u._id === report.fileId);
        console.log(index);
        this.uploadsTable.current = Math.ceil((index + 1) / this.uploadsTable.perPage);
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
     * @param {string} [reason]
     */
    async changeUserRole (user, newRole, reason = '') {
      try {
        await Api().patch(`users/${user._id}/role`, { role: newRole, reason });
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
     * @param {string} [reason]
     */
    async toggleBan (user, ban = true, reason = '') {
      try {
        await Api().patch(`users/${user._id}/ban`, { ban, reason });
        user.banned = ban;
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {UploadSchema} upload */
    async toggleVisibility (upload) {
      try {
        upload.visible = !upload.visible;
        await Api().patch(`uploads/visibility/${upload._id}`, { visible: upload.visible });
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {UploadSchema} upload */
    async approveUpload (upload) {
      try {
        await Api().patch(`uploads/approve/${upload._id}`);
        upload.approvedBy = this.store.state.user._id;
        const owner = this.selectedUser._id
          ? this.selectedUser
          : this.users.find((u) => u.uploads.find((f) => f._id === upload._id));
        await Api().post(`users/${owner._id}/inbox`, {
          title: '[Review] Your upload has been approved!',
          message: `Your upload "${upload.metadata.title}" has been approved by an admin.`,
        });
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {UploadSchema} upload */
    async dissaproveUpload (upload, reason) {
      try {
        const owner = this.selectedUser._id
          ? this.selectedUser
          : this.users.find((u) => u.uploads.find((f) => f._id === upload._id));
        await Api().post(`users/${owner._id}/inbox`, {
          title: `[Review] Your upload "${upload.metadata.title}" has been dissaproved.`,
          message: reason,
        });
        await this.deleteUpload(upload, reason);
      } catch (err) {
        console.error(err);
      }
    },
    /**
     * @param {UploadSchema} upload
     * @param {string} reason
     */
    async deleteUpload (upload, reason) {
      try {
        const res = await Api().delete(`uploads/sound/${upload._id}`);
        const owner = this.selectedUser._id
          ? this.selectedUser
          : this.users.find((u) => u.uploads.find((f) => f._id === deleted.data._id));
        await Api().post(`users/${owner._id}/inbox`, {
          title: `[Deleted] Your upload "${upload.metadata.title}" has been deleted by an admin.`,
          message: reason,
        });
        this.store.dispatch('removeFile', res.data._id);
        if (this.edit.selected?._id === res.data._id) {
          this.closeEdit();
        }
        const index = owner.uploads.findIndex((u) => u._id === res.data._id);
        const uIdx = this.uploads.findIndex((u) => u._id === res.data._id);
        index !== -1 && owner.uploads.splice(index, 1);
        uIdx !== -1 && this.uploads.splice(uIdx, 1);

        // Remove any reports related to this upload
        for (let i = 0; i < this.reports.length; i++) {
          if (this.reports[i].fileId === res.data._id) {
            this.reports.splice(i, 1);
            i--;
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * @param {string} image
     * @param {string} reason
     */
    async deleteImage (image, reason) {
      try {
        const deleted = await Api().delete(`uploads/image/${image}`);
        const upload = this.selectedUser.uploads.find((u) => u.images.includes(deleted.data._id));
        await Api().post(`users/${this.selectedUser._id}/inbox`, {
          title: `[Deleted] An image upload from "${upload?.metadata.title || ''}" has been deleted by an admin.`,
          message: reason,
        });
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
      if (this.activeMainTab === 'users') {
        this.userTable.current = 1;
      } else if (this.activeMainTab === 'uploads') {
        this.uploadsTable.current = 1;
      } else if (this.activeMainTab === 'reports') {
        this.reportsTable.current = 1;
      } else if (this.activeMainTab === 'review') {
        //
      }
    },
    userUploadSearch () {
      this.uploadsTable.current = 1;
    },
    activeMainTab () {
      this.activeUserTab = null;
      this.selectedUser = { uploads: [] };
      this.selectedReport = null;
      this.viewReports = false;
      this.search = '';
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
      this.uploads = response.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
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
  /* padding: 20px; */
  width: 99%;
}
.v-sheet {
  width: 80%;
  margin: 1em auto;
}
.userTable {
  background-color: #fff;
}
.userTable th,
userTable td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.userTable th:first-child, td:first-child {
  width: 50px;
  text-align: center;
  justify-content: center;
  padding: 0;
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
.userTable th, .reportsTable th {
  background-color: #f2f2f2;
}
.userTable tr:nth-child(even), .reportsTable tr:nth-child(even) {
  background-color: #f2f2f2;
}
.userTable td span {
  display: block;
  margin-bottom: 5px;
}
.userTable td span:last-child {
  margin-bottom: 0;
}
.user-id-button:hover {
  color: blue;
  background-color: #f2f2f2;
  text-decoration: underline;
  cursor: pointer;
}
.details {
  width: 80%;
  margin: 1em auto;
}
.uploads-tab {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: small;
}
.uploads-tab th, td {
  text-align: left;
}
.roles-tab {
  margin: 0 auto;
  max-width: 1200px;
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
.wrap-text {
  white-space: normal;
  word-wrap: break-word;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
