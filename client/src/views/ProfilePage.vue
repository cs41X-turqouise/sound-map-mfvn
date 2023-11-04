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
              <h3>Uploaded Content</h3>
              <ul id="uploaded-content-list">
                <li v-for="(item, index) in uploadedContent" :key="index" style="border: 2px solid black;">
                  <div class="file-info">
                    <div>
                      <span>ID: {{ item._id }}</span><br>
                      <h4>
                        <b class="name">
                          {{ item.metadata.title }}
                        </b>
                      </h4>
                      <span class="distance">
                        Lat: {{ item.metadata.latitude }}<br>
                        Lng: {{ item.metadata.longitude }}<br>
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
                    </div>
                    <!-- <v-carousel
                      v-if="!!item.images && item.images.length"
                      show-arrows="hover"
                      :style="{ width: '350px', height: '150px' }">
                      <v-carousel-item
                        v-for="(image, index) in item.images"
                        :key="index"
                        :src="urls.get(image) || fetchImage(image)"
                        cover>
                      </v-carousel-item>
                    </v-carousel> -->
                  </div>
                </li>
              </ul>
            </div>
          </v-col>
          <!-- <v-col cols="5">
            <div class="profile-content">
              <h3>Bookmarked Content</h3>
              <ul id="bookmarked-content-list">
                <li v-for="(item, index) in bookmarkedContent" :key="index">{{ item }}</li>
              </ul>
            </div>
          </v-col> -->
        </v-row>
      </v-container>
    </main>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';

export default {
  name: 'ProfilePage',
  setup () {
    const store = useStore();
    console.log(store.state.user);
    return { store };
  },
  data () {
    return {
      editMode: false,
      username: '',
      bookmarkedContent: ['Item 1', 'Item 2', 'Item 3'],
      soundFile: '',
      audioSrc: '',
      audioType: '',
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
      const files = this.store.state.user.uploads.map((file) => {
        return this.store.state.files.get(file);
      });
      return files;
    },
  },
  methods: {
    getSound () {
      fetch(`http://localhost:3000/uploads/${this.soundFile}`)
        .then((response) => {
          this.audioType = response.headers.get('Content-Type');
          return response.blob();
        })
        .then((blob) => {
          console.log(blob);
          const objectUrl = URL.createObjectURL(blob);
          this.audioSrc = objectUrl;
          this.$refs.audio.innerHTML = `<source src="${objectUrl}" type="${this.audioType}">`;
        });
    },
    getSounds () {
      fetch(`http://localhost:3000/uploads/`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);
          for (const item of data) {
            const { buffer, file } = item;
            const blob = new Blob([buffer.data], { type: file.contentType });
            console.log(blob);
            const objectUrl = URL.createObjectURL(blob);
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.preload = 'auto';
            audio.innerHTML = `<source src="${objectUrl}" type="${file.contentType}">`;
            audio.addEventListener('ended', () => {
              URL.revokeObjectURL(objectUrl);
            });
            this.$refs.sounddiv.appendChild(audio);
          }
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
/*
#uploaded-content-list,
#bookmarked-content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#uploaded-content-list li,
#bookmarked-content-list li {
  margin-bottom: 10px;
} */
</style>
