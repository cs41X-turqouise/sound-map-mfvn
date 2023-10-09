<template>
  <div class="home">
    <!-- <header>
      <img 
        id="user-avatar"
        src="../assets/default-avatar.png"
        alt="User Avatar"
        @click="showUserMenu = !showUserMenu">
    </header> -->
    <v-toolbar fixed color="cyan" style="height: fit-content;" dark>
      <v-toolbar-items>
        <v-btn size="small" @click="showSearchModal = true" dark flat>
          Search
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <!-- <v-btn 
          v-if="!$store.state.isUserLoggedIn"
          flat 
          dark
          :to="{
            name: 'login'
          }">
          Login
        </v-btn> -->
        
        <v-btn 
          v-if="!$store.state.isUserLoggedIn"
          flat 
          dark
          :to="{
            name: 'register'
          }">
          Sign Up
        </v-btn>
        
        <v-btn 
          v-if="$store.state.isUserLoggedIn"
          flat 
          dark
          @click="logout">
          Log Out
        </v-btn>
        <v-btn size="small" @click="showUploadModal = true" dark>
          Upload 
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
    <Modal :show="showSearchModal" @close="showSearchModal = false">
      <h2>Search Media</h2>
      <!-- TODO - custom error messages and validation -->
      <v-form @submit.prevent>
        <v-text-field name="title" label="Title" id="title"
        ></v-text-field>
        <v-text-field name="artist" label="Artist" id="artist"
        ></v-text-field>
        <v-text-field name="description" label="Description" id="description"
        ></v-text-field>
        <v-text-field name="tags" label="Tags" id="tags"
        ></v-text-field>
        <v-text-field name="fileType" label="File Type" id="fileType"
        ></v-text-field>
        <v-text-field name="dateFrom" label="From" id="dateFrom" type="date"
        ></v-text-field>
        <v-text-field name="dateTo" label="To" id="dateTo" type="date"
        ></v-text-field>
        <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
      </v-form>
    </Modal>
    <Modal :show="showUploadModal" @close="showUploadModal = false">
      <h2>Upload Media</h2>
      <!-- TODO - better handling of these as tags are technically an array of strings -->
        <v-form @submit.prevent="upload">
          <v-text-field name="title" label="Title" id="title"
          ></v-text-field>
          <v-text-field name="description" label="Description" id="description"
          ></v-text-field>
          <v-text-field name="tags" label="Tags" id="tags"
          ></v-text-field>
          <v-file-input
            label="Select a Sound File"
            id="sound"
            name="sound"
            accept="audio/*"
            required
          ></v-file-input>
          <v-file-input
            label="Select Image File(s)"
            id="images"
            name="images"
            accept="image/*"
            multiple
            clearable
          ></v-file-input>
          <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
        </v-form>
    </Modal>
    <UserMenu :user="user" :show="showUserMenu" />
    <v-main style="height: 100vh; width: 100vw; overflow-y: auto; margin-bottom: 1vh;">
      <LeafletMap />
    </v-main>
  </div>
</template>

<script>
import LeafletMap from "../components/LeafletMap.vue";
import Modal from '../components/Modal.vue';
import UserMenu from '../components/UserMenu.vue';
import UploadService from "../services/UploadService";

export default {
  name: "home",
  components: {
    LeafletMap,
    Modal,
    UserMenu,
  },
  data() {
    return {
      user: null,
      showUserMenu: false,
      showSearchModal: false,
      showUploadModal: false,
      zoom: 2,
    };
  },
  methods: {
    logout () {
      this.$store.dispatch('setToken', null)
      this.$store.dispatch('setUser', null)
      this.$router.push({
        name: 'home'
      })
    },
    /**
     * @async
     * @param {Event} e 
     */
    async upload (e) {
      const form = e.target
      const formData = new FormData(form)
      const response = await UploadService.upload(formData)
      console.log(response)
      e.target.reset()
    }
  }
};
</script>

<style scoped>
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
