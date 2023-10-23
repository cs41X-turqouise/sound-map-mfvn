<template>
  <div class="home">
    <v-toolbar fixed color="cyan" style="height: fit-content;" dark>
      <v-toolbar-items>
        <v-btn @click="showSearchModal = true" flat>
          Search
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="$store.state.user">
        Welcome {{ $store.state.user.username }}
      </v-toolbar-title>
      <v-toolbar-items style="padding: 0 10px;">
        <v-btn
          v-if="!$store.state.user"
          flat
          @click="loginWithGoogle">
          Sign in with Google
        </v-btn>
        <v-btn
          v-if="$store.state.user"
          flat
          @click="logout">
          Log Out
        </v-btn>
        <!-- Figure out why v-avatar and v-img cause this to break -->
        <!-- <img id="user-avatar"
          src="../assets/default-avatar.png"
          alt="User Avatar"
          @click="showUserMenu = !showUserMenu"
        /> -->
      </v-toolbar-items>
    </v-toolbar>
    <div v-if="showSearchModal || showUploadModal" class="overlay"></div>
    <SearchModal :show="showSearchModal" @close="showSearchModal = false">
    </SearchModal>
    <UploadModal :show="showUploadModal" @close="showUploadModal = false" @upload="upload">
    </UploadModal>
    <UserMenu :user="user" :show="showUserMenu" />
    <v-main style="height: 100vh; width: 100vw; overflow-y: auto; margin-bottom: 1vh;">
      <LeafletMap
        :files="files"
        @openUploadModal="showUploadModal = true"
        @closeUploadModal="showUploadModal = false"/>
    </v-main>
  </div>
</template>

<script>
import LeafletMap from '../components/LeafletMap.vue';
import SearchModal from '../components/SearchModal.vue';
import UploadModal from '../components/UploadModal.vue';
import UserMenu from '../components/UserMenu.vue';
import UploadService from '../services/UploadService';
import Api from '../services/Api';

export default {
  name: 'HomePage',
  components: {
    LeafletMap,
    UserMenu,
    SearchModal,
    UploadModal,
  },
  data () {
    return {
      user: null,
      showUserMenu: false,
      showSearchModal: false,
      showUploadModal: false,
      uploadForm: {
        valid: false
      },
      valid: false,
      zoom: 2,
      files: new Map(),
    };
  },
  beforeCreate () {
    Api().get('uploads/filedata/all').then((response) => {
      response.data.forEach((file) => {
        this.files.set(file._id, file);
      });
    });
    if (!this.$store.state.user) {
      Api().get('users/self').then((response) => {
        this.$store.dispatch('setUser', response.data);
      }).catch((error) => {
        console.log(error);
      });
    }
  },
  methods: {
    loginWithGoogle () {
      window.location.href = 'http://localhost:3000/auth/google';
    },
    logout () {
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      Api().post('auth/logout').catch((error) => {
        if (error.message == 'User not logged in') {
          return;
        }
        console.log(error);
      });
    },
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
      this.files.set(response.data._id, response.data);
      form.reset();
      this.showUploadModal = false;
    },
  }
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

#user-avatar {
  position: absolute;
  bottom: 0;
  right: 1%;
  width: 50px;
  height: 50px;
  cursor: pointer;
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
