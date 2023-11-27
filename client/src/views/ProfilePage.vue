<!-- views/ProfilePage -->
<template>
  <div>
    <v-toolbar fixed color="cyan" style="height: 85px;" dark>
      <v-toolbar-items style="padding: 0 50px;">
        <figure>
          <router-link to="/">
            <img src="../assets/globe-icon.png" height="50" width="50">
            <figcaption>Home</figcaption>
          </router-link>
        </figure>
      </v-toolbar-items>
    </v-toolbar>
    <main style="height: 100vh; background-color: beige;">
      <v-container>
        <CenterModal v-if="showModal" :show="showModal" @close="cancelEditUpload">
          <h1>Editing Mode</h1>
          <v-form>
            <v-text-field v-model="editableFields.title" label="Title"></v-text-field>
            <v-text-field v-model="editableFields.description" label="Description"></v-text-field>
            <v-btn @click="saveChanges">Save</v-btn>
            <v-btn @click="cancelEditUpload">Cancel</v-btn>
          </v-form>
        </CenterModal>
        <v-row>
          <v-col cols="6">
            <div id="profile">
              <div id="profile-header">
                <img id="profile-avatar" src="../assets/default-avatar.png" alt="Profile Avatar">
                <div>
                  <h2 v-if="!editMode" id="profile-username">
                    {{ store.state.user.username }}
                  </h2>
                  <v-text-field v-else v-model="username" label="Username">
                  </v-text-field>
                  <v-btn v-if="!editMode" color="info" @click="editMode = !editMode">
                    Edit
                  </v-btn>
                  <v-btn v-else color="info" @click="saveEdit">
                    Save
                  </v-btn>
                  <v-btn v-if="editMode" color="red" @click="cancelEdit">
                    Cancel
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="profile-content">
              <h2>Uploaded Content</h2>
              <v-container>
                <v-row>
                  <v-col cols="30">
                    <v-text-field v-model="searchQuery" label="Search by Title" single-line hide-details full-width>
                    </v-text-field>
                    <!-- <div>Search Query: "{{ searchQuery }}"</div> -->
                    <div>Number of Matches: {{ filteredUploads.length }}</div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="30">
                    <v-carousel v-if="filteredUploads.length" hide-delimiters>
                      <v-carousel-item v-for="(item, index) in filteredUploads" :key="index">
                        <v-card>
                          <v-card-item align="center" justify="center">
                            <v-card-title>
                              {{ item.metadata.title }}
                            </v-card-title>
                            <v-card-subtitle>
                              <span>
                                Lat: {{ Number(item.metadata.latitude).toFixed(4) }}
                                Lng: {{ Number(item.metadata.longitude).toFixed(4) }}
                                <br>
                              </span>
                              <span class="date">
                                Date: {{ new Date(item.uploadDate).toLocaleDateString() }}
                              </span><br>
                              <span class="description" v-if="item.metadata.description">
                                Description: <p>{{ item.metadata.description }}</p>
                              </span><br>
                              <v-chip v-for="(tag, index) of item.metadata.tags" :key="index">
                                {{ tag }}
                              </v-chip>
                            </v-card-subtitle>
                            <v-carousel v-if="!!item.images && item.images.length" show-arrows="hover"
                              :style="{ width: '350px', height: '150px' }">
                              <v-carousel-item v-for="(image, index) in item.images" :key="index"
                                :src="urls.get(image) || fetchImage(image)" cover>
                              </v-carousel-item>
                            </v-carousel>
                            <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
                              <source :src="activeMedia.url" :type="activeMedia.type">
                            </audio>
                          </v-card-item>
                          <v-card-actions class="d-flex justify-center">
                            <v-btn x-small @click="playMedia(item)">
                              <v-icon x-small>mdi-play</v-icon> Play
                            </v-btn>
                            <v-btn x-small @click="editUpload(item)">
                              <v-icon x-small>mdi-pencil</v-icon> Edit
                            </v-btn>
                            <v-btn x-small @click="deleteUpload(item)">
                              <v-icon x-small>mdi-delete</v-icon> Delete
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-carousel-item>
                    </v-carousel>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </main>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import CenterModal from '../components/CenterModal.vue';

export default {
  name: 'ProfilePage',
  components: {
    CenterModal,
  },
  setup () {
    const store = useStore();
    console.log(store.state.user);
    return { store };
  },
  data () {
    return {
      urls: new Map(),
      activeMedia: {
        type: null,
        url: null,
      },
      editMode: false,
      username: '',
      showModal: false,
      selectedItem: null,
      editableFields: {
        title: '',
        description: '',
      },
      searchQuery: '',
    };
  },
  computed: {
    /**
     * @typedef {Object} FileData
     * @property {string} _id
     * @property {string} filename
     * @property {string} contentType
     * @property {Date} uploadDate
     * @property {number} length
     * @property {number} chunkSize
     * @property {Object} metadata
     * @property {string} metadata.title
     * @property {string} metadata.description
     * @property {string} metadata.latitude
     * @property {string} metadata.longitude
     * @property {string} metadata.tags
     */
    /** @return {Array<FileData>} */
    uploadedContent () {
      /** @type {Array<FileData>} */
      const files = this.store.state.user.uploads.map((file) => {
        return this.store.state.files.get(file);
      }).filter((file) => {
        return !!file;
      });
      return files;
    },
    filteredUploads () {
      if (!this.searchQuery) {
        return this.uploadedContent;
      }

      const query = this.searchQuery.toLowerCase();
      return this.uploadedContent.filter((item) => {
        return item.metadata.title.toLowerCase().includes(query);
      });
    },
  },
  methods: {
    async fetchImage (id) {
      await Api().get(`uploads/image/${id}`, { responseType: 'blob' }).then((response) => {
        const objectUrl = URL.createObjectURL(response.data);
        this.urls.set(id, objectUrl);
        return objectUrl;
      }).catch((error) => {
        console.log(error);
      });
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
    cancelEdit () {
      this.username = this.store.state.user.username;
      this.editMode = false;
    },
    saveEdit () {
      this.editMode = false;
      Api().patch(`users/${this.store.state.user._id}`, { username: this.username }).then((response) => {
        this.store.dispatch('setUser', response.data);
      }).catch((error) => {
        console.log(error);
      });
    },
    /** @param {UploadSchema} upload */
    editUpload (upload) {
      this.selectedItem = upload;
      this.editableFields.title = upload.metadata.title;
      this.editableFields.description = upload.metadata.description;
      this.showModal = true;
    },
    cancelEditUpload () {
      this.selectedItem = null;
      this.editableFields.title = '';
      this.editableFields.description = '';
      this.showModal = false;
    },
    saveChanges () {
      this.showModal = false;
      Api().patch(`uploads/metadata/${this.selectedItem._id}`, {
        title: this.editableFields.title,
        description: this.editableFields.description,
      }).then((response) => {
        this.store.dispatch('updateFile', response.data);
      }).catch((error) => {
        console.log(error);
      });
    },
    /** @param {UploadSchema} upload */
    async deleteUpload (upload) {
      if (confirm('Are you sure you want to delete this upload?')) {
        try {
          await Api().delete(`uploads/sound/${upload._id}`);
          this.store.dispatch('deleteFile', upload._id).then(() => {
            this.uploadedContent = this.uploadedContent.filter((item) => item._id !== upload._id);
          });
        } catch {
          console.log(error);
        }
      }
    }
  },
  created () {
    this.username = this.store.state.user.username;
  }
};
</script>

<style scoped>
/* header a {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 10px;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
  text-decoration: none;
  color: black;
}

header a:hover {
  background-color: black;
  color: white;
}

#profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
}

#profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
}

#profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}*/
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: left;
}

.list-item-container {
  position: relative;
}

.edit-button,
.delete-button {
  position: absolute;
  top: 0;
  z-index: 0;
  /* Ensure the buttons are on top */
}

.edit-button {
  left: 0;
  color: blue;
}

.delete-button {
  left: 65px;
  /* Adjust as necessary */
  color: red;
}

/* #uploaded-content-list,
#bookmarked-content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#uploaded-content-list li,
#bookmarked-content-list li {
  margin-bottom: 10px; */
/* } */
</style>
