<!-- views/ProfilePage -->
<template>
  <div>
    <v-toolbar class="bg-deep-orange-accent-1">
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
      <UserMenu class="mr-2" />
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

    <v-container class="mx-auto" style="max-width: 98vw;" justify-space-between>
      <v-row>
        <v-col cols="2" class="text-start">
          <div id="profile">
            <div id="profile-header">
              <v-card class="mx-auto" variant="text">
                <v-img
                  id="profile-avatar"
                  :src="store.state.user.profilePhoto"
                  alt="Profile Avatar"
                  height="200px"
                  width="200px"
                >
                  <template v-slot:error>
                    <v-img
                      class="mx-auto"
                      height="200"
                      max-width="200"
                      src="/default-avatar.png"
                    ></v-img>
                  </template>
                </v-img>
                <v-card-item>
                  <v-card-title>
                    {{ store.state.user.username }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ store.state.user.email }}
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Created: {{ new Date(store.state.user.joined).toLocaleDateString() }}
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Uploads: {{ store.state.user.uploads.length }}
                  </v-card-subtitle>
                  <v-card-subtitle>
                    Bookmarks: {{ store.state.user.bookmarks.length }}
                  </v-card-subtitle>
                </v-card-item>
                <v-card-actions>
                  <v-btn color="info" block variant="outlined" @click="editUserDialog = true">
                    Edit
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </div>
        </v-col>
        <v-col cols="10">
          <v-tabs
            v-model="activeMainTab"
            color="primary"
            dark
            grow
            slider-color="primary"
            height="52px"
          >
            <v-tab value="uploads">
              <v-icon>mdi-upload</v-icon>
              Uploads
            </v-tab>
            <v-tab value="bookmarks">
              <v-icon>mdi-bookmark</v-icon>
              Bookmarks
            </v-tab>
          </v-tabs>

          <div class="profile-content">
            <v-container v-if="activeMainTab === 'uploads'">
              <v-sheet v-if="uploads.length" align-center>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="search"
                      label="Search by Title, Address, Tags, Creator, or Description"
                      append-icon="mdi-magnify"
                      variant="outlined"
                      single-line
                      hide-details
                      full-width
                      rounded
                    >
                    </v-text-field>
                    <div v-if="search">
                      Number of Matches: {{ filteredUploads.length }}
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <audio
                      class="audio mt-2"
                      controls
                      controlslist="nodownload"
                      :key="activeMedia.url"
                      ref="audio-player"
                    >
                      <source :src="activeMedia.url" :type="activeMedia.type">
                    </audio>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="auto"
                    class="mx-auto mb"
                    v-for="upload in paginatedUploads"
                    :key="upload._id"
                  >
                    <ItemCard
                      :item="upload"
                      :urls="urls"
                      max-width="380px"
                      @add-url="(el) => urls.set(el.id, el.objectUrl)"
                    >
                      <template #carousel-item="{ image }">
                        <v-btn
                          icon
                          density="comfortable"
                          size="small"
                          style="position: absolute; top: 0; right: 0;"
                          @click="deleteImage(image)"
                        >
                          <v-tooltip
                            activator="parent"
                            location="start"
                            style="z-index: 9999;"
                          >
                            Delete Image
                          </v-tooltip>
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <template v-slot:actions>
                        <v-btn v-if="activeMedia.id !== upload._id" icon @click="playMedia(upload)">
                          <v-tooltip activator="parent" location="top">
                            Play
                          </v-tooltip>
                          <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn v-else icon @click="stopMedia">
                          <v-tooltip activator="parent" location="top">
                            Stop
                          </v-tooltip>
                          <v-icon>mdi-stop</v-icon>
                        </v-btn>
                        <v-btn v-if="!store.state.user.banned" icon @click="setEdit(upload)">
                          <v-tooltip activator="parent" location="top">
                            Edit
                          </v-tooltip>
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteUpload(upload)">
                          <v-tooltip activator="parent" location="top">
                            Delete
                          </v-tooltip>
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-btn v-if="upload.approvedBy" icon @click="toggleVisibility(upload)">
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
              </v-sheet>
              <div v-else>
                <v-row>
                  <v-col cols="12">
                    <v-alert type="info" elevation="2" icon="mdi-information">
                      You have no uploads.
                    </v-alert>
                  </v-col>
                </v-row>
              </div>
            </v-container>

            <v-container v-if="activeMainTab === 'bookmarks'">
              <v-sheet v-if="bookmarks.length">
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="search"
                      label="Search by Title, Address, Tags, Creator, or Description"
                      append-icon="mdi-magnify"
                      variant="outlined"
                      rounded
                      single-line
                      hide-details
                      full-width
                    >
                    </v-text-field>
                    <div v-if="search">
                      Number of Matches: {{ filteredBookmarks.length }}
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <audio class="audio mt-2" controls :key="activeMedia.url" ref="audio-player">
                      <source :src="activeMedia.url" :type="activeMedia.type">
                    </audio>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="auto"
                    class="mx-auto mb"
                    v-for="upload in paginatedBookmarks"
                    :key="upload._id"
                  >
                    <ItemCard
                      :item="upload"
                      :urls="urls"
                      max-width="380px"
                      @add-url="(el) => urls.set(el.id, el.objectUrl)"
                    >
                      <template v-slot:actions>
                        <v-btn v-if="activeMedia.id !== upload._id" icon @click="playMedia(upload)">
                          <v-tooltip activator="parent" location="top">
                            Play
                          </v-tooltip>
                          <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn v-else icon @click="stopMedia">
                          <v-tooltip activator="parent" location="top">
                            Stop
                          </v-tooltip>
                          <v-icon>mdi-stop</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteBookmark(upload)">
                          <v-tooltip activator="parent" location="top">
                            Remove Bookmark
                          </v-tooltip>
                          <v-icon>mdi-bookmark-off</v-icon>
                        </v-btn>
                      </template>
                    </ItemCard>
                  </v-col>
                </v-row>
                <v-pagination
                  v-model="bookMarksTable.current"
                  :length="maxBookmarksPage"
                ></v-pagination>
              </v-sheet>
              <div v-else>
                <v-row>
                  <v-col cols="12">
                    <v-alert type="info" elevation="2" icon="mdi-information">
                      You have no bookmarks.
                    </v-alert>
                  </v-col>
                </v-row>
              </div>
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
      /** @type { UploadSchema[] } */
      bookmarks: [],
      uploadsTable: paginationSetup(4),
      bookMarksTable: paginationSetup(4),
      activeMedia: {
        id: null,
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
      activeMainTab: 'uploads',
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
    filteredBookmarks () {
      if (!this.search) return this.bookmarks;
      return this.bookmarks.filter((upload) =>
        upload.metadata.title.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.description.toLowerCase().includes(this.search.toLowerCase())
        || upload.metadata.tags.some((tag) => tag.toLowerCase().includes(this.search.toLowerCase()))
        || upload.filename.toLowerCase().includes(this.search.toLowerCase())
        || upload.contentType.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    maxBookmarksPage () {
      return Math.ceil(this.filteredBookmarks.length / this.bookMarksTable.perPage);
    },
    paginatedBookmarks () {
      const start = (this.bookMarksTable.current - 1) * this.bookMarksTable.perPage;
      const end = start + this.bookMarksTable.perPage;
      return this.filteredBookmarks.slice(start, end);
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
      this.activeMedia.id = upload._id;
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
    async stopMedia () {
      this.activeMedia.id = null;
      this.activeMedia.type = null;
      this.activeMedia.url = null;
      this.$nextTick(() => {
        const audioPlayer = this.$refs['audio-player'];
        audioPlayer.pause();
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
    },
    /** @param {string} image */
    async deleteImage (image) {
      try {
        const deleted = await Api().delete(`uploads/image/${image}`);
        const upload = this.uploads.find((u) => u.images.includes(deleted.data._id));
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
    /** @param {UploadSchema} upload */
    async deleteBookmark (upload) {
      if (confirm('Are you sure you want to delete this bookmark?')) {
        try {
          await Api().patch(`users/${this.store.state.user._id}/bookmarks`, {
            id: upload._id,
            bookmark: false,
          });
          this.bookmarks = this.bookmarks.filter((item) => item._id !== upload._id);
          this.store.commit('removeBookmark', upload._id);
        } catch (error) {
          console.error(error);
        }
      }
    }
  },
  /**
   * Lifecycle hook
   */
  async beforeCreate () {
    try {
      await Api().get('users/self').then((response) => {
        this.store.dispatch('setUser', response.data);
      });
      const uploads = await Api().get(`users/${this.store.state.user._id}/uploads`);
      this.uploads = uploads.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      console.log(this.uploads);

      const bookmarks = await Api().get(`users/${this.store.state.user._id}/bookmarks`);
      this.bookmarks = bookmarks.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      console.log(this.bookmarks);
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
@media (max-width: 1200px) {
  audio {
    width: 100%;
  }
}
</style>
