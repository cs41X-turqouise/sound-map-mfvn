<template>
  <div
    v-if="clicked || filteredFiles.length"
    id="sidebar"
    class="sidebar"
    @click.stop
  >
    <ReportModal
      v-if="reportMarker"
      :marker="reportMarker"
      :show="!!reportMarker"
      @close="reportMarker = null"
      @report="report"
    >
    </ReportModal>
    <div id="popup-grid" class="popup-grid">
      <v-btn
        v-if="filteredFiles.length"
        size="small"
        density="comfortable"
        flat
        icon
        @click="clearFilter"
      >
        <v-tooltip
          activator="parent"
          location="end"
          style="z-index: 9999;"
        >
          Clear Filter
        </v-tooltip>
        <v-icon color="red">
          mdi-filter-remove-outline
        </v-icon>
      </v-btn>
      <v-card v-for="(marker, index) in paginatedMarkers" :key="marker.data._id" elevation-19>
        <div class="file-info">
          <div>
            <h2 class="title">
              <div v-if="store.state.user">
                <v-btn
                  v-if="!store.state.user.banned"
                  flat
                  size="x-small"
                  icon="mdi-flag"
                  @click="reportMarker = marker.data"
                >
                  <v-tooltip
                    activator="parent"
                    location="end"
                    style="z-index: 9999;"
                  >
                    Report
                  </v-tooltip>
                  <v-icon color="red">
                    mdi-flag
                  </v-icon>
                </v-btn>

                <v-btn
                  v-if="store.state.user.bookmarks.includes(marker.data._id)"
                  flat
                  size="x-small"
                  icon="mdi-bookmark"
                >
                  <v-tooltip
                    activator="parent"
                    location="end"
                    style="z-index: 9999;"
                  >
                    Remove Bookmark
                  </v-tooltip>
                  <v-icon color="blue">
                    mdi-bookmark
                  </v-icon>
                </v-btn>
                <v-btn
                  v-else
                  flat
                  size="x-small"
                  icon="mdi-bookmark"
                >
                  <v-tooltip
                    activator="parent"
                    location="end"
                    style="z-index: 9999;"
                  >
                    Bookmark
                  </v-tooltip>
                  <v-icon color="blue">
                    mdi-bookmark-outline
                  </v-icon>
                </v-btn>
              </div>
              <b>{{ marker.data.metadata.title }}</b>
            </h2>
            <div v-if="marker.data.metadata.geodata">
              <p>{{ JSON.parse(marker.data.metadata.geodata).formatted }}</p>
            </div>
            <div class="info-row">
              <div class="info-column">
                <span>
                  Lat: {{ Number(marker.data.metadata.latitude).toFixed(4) }}&deg;
                  Lng: {{ Number(marker.data.metadata.longitude).toFixed(4) }}&deg;
                  <br>
                </span>
                <span v-if="clicked" class="distance">
                  Distance: {{ clicked.latlng.distanceTo(marker._latlng).toFixed(2) }} m
                </span>
                <br>
                <span class="date">
                  Date: {{ new Date(marker.data.uploadDate).toLocaleDateString() }}
                </span><br>
              </div>
              <v-carousel
                v-if="!!marker.data.images && marker.data.images.length"
                show-arrows="hover"
                :style="{ width: '200px', height: '100px' }"
              >
                <v-carousel-item
                  v-for="(image, imgIdx) in marker.data.images"
                  :key="imgIdx"
                  :src="urls.get(image) || fetchImage(image)"
                  cover
                >
                </v-carousel-item>
              </v-carousel>
            </div>
            <span class="description" v-if="marker.data.metadata.description">
              Description: <p>{{ marker.data.metadata.description }}</p>
            </span><br>
            <v-chip v-for="(tag, tIdx) of marker.data.metadata.tags" :key="tIdx">
              {{ tag }}
            </v-chip>
          </div>
        </div>
        <div class="sound-bar" :style="{ backgroundColor: colors[index] }">
          <audio
            v-if="urls.has(marker.data._id)"
            class="audio"
            :ref="`audio-${marker.data._id}`"
            @playing="playing(marker)"
            controls
          >
            <source :src="urls.get(marker.data._id)" :type="`${marker.data.contentType}`">
          </audio>
          <v-btn v-else @click="fetchAudio(marker.data)" flat>
            Play
          </v-btn>
        </div>
      </v-card>
    </div>
    <v-pagination class="pagination" v-model="currentPage" :length="maxPage" style="margin-top: auto;"></v-pagination>
  </div>
</template>

<script>
import Api from '../services/Api';
import { circle } from 'leaflet';
import { useStore } from 'vuex';
import ReportModal from './ReportModal.vue';

/** @typedef {import('../App.vue').UploadSchema} UploadSchema */

export default {
  name: 'SidePanel',
  components: {
    ReportModal,
  },
  props: {
    /** @type {Array<import('leaflet').Marker & { data: UploadSchema }>} */
    markers: {
      type: Array,
      default: () => [],
    },
    /** @type {Array<UploadSchema>} */
    filteredFiles: {
      type: Array,
      default: () => [],
    },
    /** @type {import('leaflet').Map} */
    map: {
      type: Object,
      default: null,
    },
    /** @type {{ lat: number, lng: number }} */
    clicked: {
      type: Object,
      default: null
    },
  },
  emits: ['close', 'focus-marker', 'clear-filter'],
  setup () {
    const store = useStore();
    return { store };
  },
  data () {
    return {
      urls: new Map(),
      circles: new WeakMap(),
      /** @type {HTMLAudioElement} */
      currentAudio: null,
      currentPage: 1,
      perPage: Math.max(1, Math.floor(window.innerHeight / 400)),
      colors: ['red', 'green', 'blue', 'purple'],
      reportMarker: null,
    };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    clearFilter () {
      if (!this.clicked) {
        this.close();
      }
      this.$emit('clear-filter');
    },
    updatePerPage () {
      this.perPage = Math.max(1, Math.floor(window.innerHeight / 400));
      this.currentPage = 1;
    },
    async fetchAudio (marker) {
      await Api().get(`uploads/${marker._id}`, { responseType: 'blob' }).then((response) => {
        const objectUrl = URL.createObjectURL(response.data);
        this.urls.set(marker._id, objectUrl);
        this.$nextTick(() => {
          this.$refs[`audio-${marker._id}`][0].play();
        });
      });
    },
    async fetchImage (id) {
      await Api().get(`uploads/image/${id}`, { responseType: 'blob' }).then((response) => {
        const objectUrl = URL.createObjectURL(response.data);
        this.urls.set(id, objectUrl);
        return objectUrl;
      });
    },
    playing (marker) {
      const newAudio = this.$refs[`audio-${marker.data._id}`][0];
      if (this.currentAudio) {
        if (this.currentAudio === newAudio) return;
        this.currentAudio.pause();
      }
      this.currentAudio = newAudio;
      this.$emit('focus-marker', marker);
    },
    report (marker, reason) {
      if (confirm('Are you sure you want to report this content?')) {
        Api().post(`reports/${marker._id}`, { reason, reporter: this.store.state.user._id }).then((response) => {
          console.log(response);
          this.reportMarker = null;
        });
      }
    },
    getFileData (id) {
      return this.store.state.files.get(id);
    },
  },
  computed: {
    paginatedMarkers () {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      if (this.filteredFiles.length) {
        return this.markers
          .filter((m) => m.data.visible && this.filteredFiles.some((f) => f._id === m.data._id))
          .slice(start, end);
      }
      return this.markers.filter((m) => m.data.visible).toSorted((a, b) => {
        const distanceA = this.clicked.latlng.distanceTo(a._latlng);
        const distanceB = this.clicked.latlng.distanceTo(b._latlng);
        return distanceA - distanceB;
      }).slice(start, end);
    },
    /** @returns {number} */
    maxPage () {
      if (this.filteredFiles.length) {
        return Math.ceil(this.filteredFiles.filter((m) => m.visible).length / this.perPage);
      }
      return Math.ceil(this.markers.filter((m) => m.data.visible).length / this.perPage);
    }
  },
  watch: {
    clicked () {
      this.currentPage = 1;
    },
    paginatedMarkers (newMarkers, oldMarkers) {
      oldMarkers.forEach((marker) => {
        if (this.circles.has(marker)) {
          this.circles.get(marker).remove();
          this.circles.delete(marker);
        }
      });
      newMarkers.forEach((marker, index) => {
        const color = this.colors[index];
        const circleMarker = circle(marker._latlng, {
          radius: 250,
          color,
          fillColor: color,
          fillOpacity: 0.2,
        }).addTo(this.map);
        this.circles.set(marker, circleMarker);
      });
    },
    filteredFiles () {
      this.currentPage = 1;
    },
  },
  mounted () {
    window.addEventListener('resize', this.updatePerPage);
    console.log('filteredFiles', this.filteredFiles);
    for (const marker of this.markers) {
      marker.data = this.getFileData(marker.data._id);
    }
    this.paginatedMarkers.forEach((marker, index) => {
      const color = this.colors[index];
      const circleMarker = circle(marker._latlng, {
        radius: 250,
        color,
        fillColor: color,
        fillOpacity: 0.2,
      }).addTo(this.map);
      this.circles.set(marker, circleMarker);
    });
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.updatePerPage);
    this.paginatedMarkers.forEach((marker) => {
      if (this.circles.has(marker)) {
        this.circles.get(marker).remove();
        this.circles.delete(marker);
      }
    });
    this.circles = new WeakMap();
  },
};
</script>

<style scoped>
.sidebar {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  background-color: #f9f9f9;
  width: 410px;
  min-width: 200px;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  transition: height 0.5s ease;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  /* padding: 1em; */
}

#heading {
  border-bottom: 1px solid #ddd;
  height: 40px;
}

.title {
  width: 100%;
}

.info-row {
  display: flex;
  flex-direction: row;
}

.info-column {
  flex: 1;
}

.file-info {
  display: flex;
  flex-direction: row;
  text-align: left;
}

.popup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1em;
  padding: 1em;
}
.popup-grid .file-info:hover {
  background-color: aliceblue;
}

.sound-bar {
  margin-top: 10px;
}
</style>
