<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Results</h2>
    <ul id="popup-list" class="popup-list">
      <li v-for="(marker, index) in fetchedFiles" :key="marker.data._id">
        <div class="file-info">
          <div>
            <h2>
              <b class="name">
                {{ marker.data.metadata.title }}
              </b>
            </h2>
            <span class="distance">
              Distance: {{ clicked.latlng.distanceTo(marker._latlng).toFixed(2) }} m
            </span>
            <br>
            <span class="date">
              Date: {{ new Date(marker.data.uploadDate).toLocaleDateString() }}
            </span><br>
            <span class="description" v-if="marker.data.metadata.description">
              Description: <p>{{ marker.data.metadata.description }}</p>
            </span><br>
            <v-chip v-for="(tag, index) of marker.data.metadata.tags" :key="index">
              {{ tag }}
            </v-chip>
          </div>
          <v-carousel
            v-if="!!marker.data.images && marker.data.images.length"
            show-arrows="hover"
            :style="{ width: '350px', height: '150px' }">
            <v-carousel-item
              v-for="(image, index) in marker.data.images"
              :key="index"
              :src="urls.get(image) || fetchImage(image)"
              cover>
            </v-carousel-item>
          </v-carousel>
        </div>
        <div class="sound-bar" :style="{ backgroundColor: colors[index] }">
          <audio
            v-if="urls.has(marker.data._id)"
            class="audio"
            :ref="`audio-${marker.data._id}`"
            @playing="playing(marker)"
            controls>
            <source :src="urls.get(marker.data._id)" :type="`${marker.data.contentType}`">
          </audio>
          <v-btn v-else @click="fetchAudio(marker.data)">Play</v-btn>
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
    // I am trying to get filteredFiles from the searchModal to here
    filteredFiles: {
      type: Map,
      default: null,
    }
  },
  data () {
    return {
      urls: new Map(),
      circles: new WeakMap(),
      /** @type {HTMLAudioElement} */
      currentAudio: null,
      currentPage: 1,
      perPage: 4,
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
    playing (marker) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.currentAudio = this.$refs[`audio-${marker.data._id}`][0];
      this.$emit('focusMarker', marker);
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
  },
};
</script>

<style scoped>
</style>
