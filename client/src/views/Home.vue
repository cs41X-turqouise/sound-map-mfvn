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
    <Modal :show="showSearchModal" @close="showSearchModal = false">
      <h2>Search Media</h2>
      <form id="search-form" action="" method="post">
        <!-- TODO - custom error messages and validation -->
        <label for="title">Title:</label>
        <input type="text" name="title" id="title"><br>

        <label for="artist">Artist:</label>
        <input type="text" name="artist" id="artist"><br>

        <label for="description">Description:</label>
        <input type="text" name="description" id="description"><br>

        <label for="tags">Tags:</label>
        <input type="text" name="tags" id="tags"><br>

        <label for="fileType">File Type:</label>
        <input type="text" name="fileType" id="fileType"><br>

        <label for="dateFrom">From:</label>
        <input type="date" name="dateFrom" id="dateFrom"><br>

        <label for="dateTo">To:</label>
        <input type="date" name="dateTo" id="dateTo"><br>

        <input type="submit" name="submit" value="Submit">
      </form>
    </Modal>
    <Modal :show="showUploadModal" @close="showUploadModal = false">
      <h2>Upload Media</h2>
        <form id="upload-form" action="" method="post" enctype="multipart/form-data">
          <label for="title">Title:</label>
          <input type="text" name="title" id="title"><br>
          
          <label for="description">Description:</label>
          <input type="text" name="description" id="description"><br>
          <!-- TODO - better handling of these as tags are technically an array of strings -->
          <label for="tags">Tags:</label>
          <input type="text" name="tags" id="tags"><br>

          <label for="sound">Select a Sound File:</label>
          <input type="file" name="sound" id="sound" accept="audio/*" required><br>

          <label for="images">Select Image File(s):</label>
          <input type="file" name="images" id="images" accept="image/*" multiple><br>

          <input type="submit" name="submit" value="Submit">
        </form>
    </Modal>
    <UserMenu :user="user" :show="showUserMenu" />
    <!-- <LeafletMap /> -->
    <v-main style="height: 100vh; width: 100vw; overflow-y: auto; margin-bottom: 1vh;">
      <LeafletMap />
    </v-main>
  </div>
</template>

<script>
import LeafletMap from "../components/LeafletMap.vue";
import Modal from '../components/Modal.vue';
import UserMenu from '../components/UserMenu.vue';

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

footer {
  height: 4vh;
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
