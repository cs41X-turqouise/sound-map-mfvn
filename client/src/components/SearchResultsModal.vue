<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Results</h2>
    <ul id="popup-list" class="popup-list">
      <li v-for="(file, index) in paginatedFiles" :key="file._id">
        <div class="file-info" style="overflow-y:scroll;">
          <div>
            <h2>
              <b class="name">
                {{ file.metadata.title }}
              </b>
            </h2>
            <v-card flat>
              <v-card-content>Date: {{ new Date(file.uploadDate).toLocaleDateString() }}</v-card-content>
              <br>
              <v-card-content>Description: {{ file.metadata.description }}</v-card-content>
              <br>
              <v-chip v-for="(tag, index) of file.metadata.tags" :key="index">
                {{ tag }}
              </v-chip>
            </v-card>
            <br>
          </div>
          <v-carousel
            v-if="!!file.images && file.images.length"
            show-arrows="hover"
            :style="{ width: '350px', height: '150px' }">
            <v-carousel-item
              v-for="(image, index) in file.images"
              :key="index"
              :src="urls.get(image) || fetchImage(image)"
              cover>
            </v-carousel-item>
          </v-carousel>
        </div>
        <div class="sound-bar" :style="{ backgroundColor: colors[index] }">
          <audio
            v-if="urls.has(file._id)"
            class="audio"
            :ref="`audio-${file._id}`"
            @playing="playing(file)"
            controls>
            <source :src="urls.get(file._id)" :type="`${file.contentType}`">
          </audio>
          <v-btn v-else @click="fetchAudio(file)">Play</v-btn>
        </div>
      </li>
      <v-pagination class="pagination" v-model="currentPage" :length="maxPage"></v-pagination>
    </ul>
  </CenterModal>
</template>

<script>
import { useStore } from 'vuex';
import CenterModal from './CenterModal.vue';

export default {
  name: 'SearchResultsModal',
  components: {
    CenterModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    filteredFiles: {
      type: Map,
      default: new Map(),
    }
  },
  data () {
    return {
      urls: new Map(),
      circles: new WeakMap(),
      /** @type {HTMLAudioElement} */
      currentAudio: null,
      currentPage: 1,
      perPage: 2,
      colors: ['red', 'green', 'blue', 'purple'],
    };
  },
  setup () {
    const store = useStore();
    return { store };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    async fetchAudio (marker) {
      fetch(`http://localhost:3000/uploads/${marker._id}`)
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.urls.set(marker._id, objectUrl);
          this.$nextTick(() => {
            this.$refs[`audio-${marker._id}`][0].play();
          });
        });
    },
    async fetchImage (id) {
      fetch(`http://localhost:3000/uploads/image/${id}`)
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.urls.set(id, objectUrl);
          return objectUrl;
        });
    },
    playing (file) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.currentAudio = this.$refs[`audio-${file._id}`][0];
      this.$emit('focusFile', file);
    },
  },
  computed: {
    files () {
      return this.store.state.files;
    },
    tagList () {
      const tags = new Set();
      for (const file of this.files.values()) {
        for (const tag of file.metadata.tags) {
          tags.add(tag);
        }
      }
      return [...tags];
    },
    paginatedFiles () {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      console.log('FilteredFiles:', this.filteredFiles);
      const filteredFilesArray = Array.from(this.filteredFiles.values());
      return filteredFilesArray.slice(startIndex, endIndex);
    },
    /** @returns {number} */
    maxPage () {
      return Math.ceil(this.filteredFiles.size / this.perPage);
    },
  },
};
</script>

<style scoped>
</style>
