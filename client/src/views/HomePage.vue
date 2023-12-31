<template>
  <div
    class="home"
    style="height: 100%; width: 100%;
    display: flex; flex-direction: column;"
  >
    <v-toolbar fixed color="deep-orange-accent-1" style="height: fit-content; width: 100%;">
      <v-hover v-slot="{ isHovering, props }">
        <v-img
          v-bind="props"
          id="logo"
          class="ml-2"
          cover
          :src="isHovering ? '/soundmap_logo.gif' : '/soundmap_logo.png'"
          style="max-width: 175px;"
        />
      </v-hover>
      <v-toolbar-items class="pl-10">
        <v-btn @click="showSearchModal = true" icon flat>
          <v-icon left>
            mdi-magnify
          </v-icon>
          Search
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="store.state.user">
        Welcome {{ store.state.user.username }}
      </v-toolbar-title>
      <v-toolbar-items>
        <UserMenu />
      </v-toolbar-items>
    </v-toolbar>
    <UsernameForm v-if="store.state.user && !store.state.user.username" />
    <div v-if="showSearchModal || showUploadModal" class="overlay"></div>
    <SearchModal
      v-if="showSearchModal"
      :show="showSearchModal"
      @filtered-files="search"
      @close="showSearchModal = false"
    >
    </SearchModal>
    <UploadModal
      v-if="showUploadModal"
      :show="showUploadModal"
      @close="showUploadModal = false"
      @upload="upload"
    >
    </UploadModal>
    <LeafletMap
      :filtered-files="filteredFiles"
      @clear-filter="filteredFiles = []"
      @open-upload-modal="showUploadModal = true"
      @close-upload-modal="showUploadModal = false"
    />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import LeafletMap from '../components/LeafletMap.vue';
import SearchModal from '../components/SearchModal.vue';
import UploadModal from '../components/UploadModal.vue';
import UserMenu from '../components/UserMenu.vue';
import UploadService from '../services/UploadService';
import UsernameForm from '../components/UsernameForm.vue';

export default {
  name: 'HomePage',
  components: {
    LeafletMap,
    UserMenu,
    SearchModal,
    UploadModal,
    UsernameForm,
  },
  setup () {
    const store = useStore();
    return { store };
  },
  data () {
    return {
      user: null,
      showUserMenu: false,
      showSearchModal: false,
      showUploadModal: false,
      dialog: true,
      uploadForm: {
        valid: false
      },
      valid: false,
      zoom: 2,
      filteredFiles: [],
    };
  },
  methods: {
    /**
     * @async
     * @param {EventTarget} form
     * @param {FormData} formData
     */
    async upload (form, formData) {
      const response = await UploadService.upload(formData);

      if (!response.data._id && response.data.id) {
        response.data._id = response.data.id;
      }
      this.store.dispatch('addFile', response.data);
      form.reset();
      this.showUploadModal = false;
    },
    async search (filteredFiles) {
      this.filteredFiles = filteredFiles;
      this.showSearchModal = false;
    }
  },
  async beforeCreate () {
    await Api().get('uploads/filedata/all').then((response) => {
      const fileMap = new Map();
      response.data.forEach((file) => {
        fileMap.set(file._id, file);
      });
      this.store.dispatch('setFiles', fileMap);
    });
    if (!this.$store.state.user) {
      Api().get('users/self').then((response) => {
        this.$store.dispatch('setUser', response.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  },
};
</script>

<style>
/* Chrome, Safari, Edge, Opera */
.no-spinner input::-webkit-outer-spin-button,
.no-spinner input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.no-spinner input[type=number] {
  -moz-appearance: textfield;
  appearance: none;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}
</style>
