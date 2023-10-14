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
    <CenterModal :show="showSearchModal" @close="showSearchModal = false">
      <h2>Search Media</h2>
      <!-- TODO - custom error messages and validation -->
      <v-form @submit.prevent>
        <v-text-field name="title" label="Title" id="title" clearable
        ></v-text-field>
        <v-text-field name="artist" label="Artist" id="artist" clearable
        ></v-text-field>
        <v-text-field name="description" label="Description" id="description" clearable
        ></v-text-field>
        <v-text-field name="tags" label="Tags" id="tags" clearable
        ></v-text-field>
        <v-text-field name="fileType" label="File Type" id="fileType" clearable
        ></v-text-field>
        <v-text-field name="dateFrom" label="From" id="dateFrom" type="date" clearable
        ></v-text-field>
        <v-text-field name="dateTo" label="To" id="dateTo" type="date" clearable
        ></v-text-field>
        <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
      </v-form>
    </CenterModal>
    <CenterModal :show="showUploadModal" @close="showUploadModal = false">
      <h2>Upload Media</h2>
      <!-- TODO - better handling of these as tags are technically an array of strings -->
        <v-form @submit.prevent="upload" ref="form">
          <v-text-field name="title" label="Title" id="title" clearable
          ></v-text-field>
          <v-text-field name="description" label="Description" id="description" clearable
          ></v-text-field>
          <v-text-field name="tags" label="Tags" id="tags" clearable
          ></v-text-field>
          <div>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  label="Enter Latitude Coordinates"
                  hint="Must be between -90 and 90"
                  id="latitude"
                  name="latitude"
                  type="number"
                  min="-90"
                  max="90"
                  class="no-spinner"
                  clearable
                  :rules="latitudeRules"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="Enter Longitude Coordinates"
                  hint="Must be between -180 and 180"
                  id="longitude"
                  name="longitude"
                  type="number"
                  min="-180"
                  max="180"
                  class="no-spinner"
                  clearable
                  :rules="longitudeRules"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
          <v-file-input
            label="Select a Sound File"
            id="sound"
            name="sound"
            accept="audio/*"
            required
            :rules="soundRules"
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
    </CenterModal>
    <UserMenu :user="user" :show="showUserMenu" />
    <v-main style="height: 100vh; width: 100vw; overflow-y: auto; margin-bottom: 1vh;">
      <LeafletMap :files="files"/>
    </v-main>
  </div>
</template>

<script>
import LeafletMap from '../components/LeafletMap.vue';
import CenterModal from '../components/CenterModal.vue';
import UserMenu from '../components/UserMenu.vue';
import UploadService from '../services/UploadService';
import Api from '../services/Api';

export default {
  name: 'HomePage',
  components: {
    LeafletMap,
    CenterModal,
    UserMenu,
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
      files: [],
      soundRules: [
        (v) => {
          if (v?.length) {
            return true;
          }
          return 'Choose a file';
        }
      ],
      latitudeRules: [
        (v) => {
          if (v) return true;
          return 'Latitude is required.';
        },
        (v) => {
          if (v >= -90 && v <= 90) return true;
          return 'Must be between -90 and 90.';
        },
      ],
      longitudeRules: [
        (v) => {
          if (v) return true;
          return 'Longitude is required.';
        },
        (v) => {
          if (v >= -180 && v <= 180) return true;
          return 'Must be between -180 and 180.';
        },
      ],
    };
  },
  beforeCreate () {
    Api().get('uploads/filedata/all').then((response) => {
      this.files = response.data;
    });
  },
  methods: {
    logout () {
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$router.push({
        name: 'home'
      });
    },
    /**
     * @async
     * @param {Event} e
     */
    async upload (e) {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const form = e.target;
      const formData = new FormData(form);
      const response = await UploadService.upload(formData);

      this.files.push(response.data);
      e.target.reset();
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
