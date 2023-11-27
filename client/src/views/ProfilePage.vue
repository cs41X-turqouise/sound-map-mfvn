<!-- views/ProfilePage -->
<template>
  <div>
    <v-toolbar class="bg-orange">
      <v-spacer></v-spacer>
      <UserMenu />
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

    <UsernameFormVue
      v-if="editUserDialog"
      :allow-cancel="true"
      @close="editUserDialog = false"
    />

    <v-container>
      <v-row>
        <v-col cols="6">
          <div id="profile">
            <div id="profile-header">
              <img id="profile-avatar" :src="store.state.user.profilePhoto" alt="Profile Avatar">
              <div>
                <h2 id="profile-username">
                  {{ store.state.user.username }}
                </h2>
                <v-btn color="info" @click="editUserDialog = true">
                  Edit
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="profile-content">
            <h2>Uploaded Content</h2>
            <v-col cols="12" sm="6" md="6">
              <audio class="audio" controls :key="activeMedia.url" ref="audio-player">
                <source :src="activeMedia.url" :type="activeMedia.type">
              </audio>
            </v-col>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="search" label="Search by Title" single-line hide-details full-width>
                  </v-text-field>
                  <div>Number of Matches: {{ filteredUploads.length }}</div>
                </v-col>
              </v-row>
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
                    @addUrl="(el) => urls.set(el.id, el.objectUrl)"
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
                        <!-- <ReportDialog @submitReason="(reason) => deleteUpload(upload, reason)" /> -->
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
              <v-pagination
                v-model="uploadsTable.current"
                :length="maxUploadsPage"
              ></v-pagination>
            </v-container>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import UserMenu from '../components/UserMenu.vue';
import ItemCard from '../components/ItemCard.vue';
import UsernameFormVue from '../components/UsernameForm.vue';

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
  name: 'ProfilePage',
  components: {
    UserMenu,
    ItemCard,
    UsernameFormVue,
  },
  setup () {
    const store = useStore();
    return { store };
  },
  data () {
    return {
      urls: new Map(),
      /** @type { UploadSchema[] } */
      uploads: [],
      uploadsTable: paginationSetup(2),
      activeMedia: {
        type: null,
        url: null,
      },
      editDialog: false,
      editUserDialog: false,
      edit: {
        selected: null,
        new: null,
        tag: '',
      },
      username: '',
      search: '',
    };
  },
  computed: {
    filteredUploads () {
      if (!this.search) return this.uploads;
      return this.uploads.filter((upload) =>
        upload.metadata.title.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.description.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.tags.some((tag) => tag.toLowerCase().includes(this.search.toLowerCase()))
        || upload.filename.toLowerCase().includes(this.search.toLowerCase())
        || upload.contentType.toLowerCase().includes(this.search.toLowerCase())
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
    async saveEdit () {
      try {
        const res = await Api().patch(`uploads/metadata/${this.edit.selected._id}`, { ...this.edit.new.metadata });
        const uIdx = this.uploads.findIndex((u) => u._id === res.data._id);
        uIdx !== -1 && (this.uploads[uIdx].metadata = res.data.metadata);
        this.closeEdit();
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
    async deleteUpload (upload) {
      if (confirm('Are you sure you want to delete this upload?')) {
        try {
          await Api().delete(`uploads/sound/${upload._id}`);
          this.store.dispatch('deleteFile', upload._id).then(() => {
            this.uploads = this.uploads.filter((item) => item._id !== upload._id);
          });
        } catch {
          console.log(error);
        }
      }
    }
  },
  /**
   * Lifecycle hook
   */
  async beforeCreate () {
    try {
      if (!this.store.state.user) {
        await Api().get('users/self').then((response) => {
          this.store.dispatch('setUser', response.data);
        });
      }
      const uploads = await Api().get(`users/${this.store.state.user._id}/uploads`);
      this.uploads = uploads.data;
      console.log(this.uploads);
    } catch (err) {
      console.log(err);
      if (!this.store.state.user) {
        this.$router.push({ path: '/' });
      }
    }
  },
  created () {
    this.username = this.store.state.user.username;
  }
};
</script>

<style scoped>
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
</style>
