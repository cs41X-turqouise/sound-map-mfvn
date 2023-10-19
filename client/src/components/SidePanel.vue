<template>
  <div v-if="clicked" id="sidebar" class="sidebar" @click.stop>
    <section id="heading">
      <CloseButton @close="close" />
    </section>
    <ul id="popup-list" class="popup-list">
      <li v-for="(marker, index) in paginatedMarkers" :key="marker.data._id">
        <b class="name">{{ marker.data.metadata.title }}</b>
        (<span class="distance">{{ clicked.latlng.distanceTo(marker._latlng).toFixed(2) }}</span> m)<br>
        Date: <span class="date">{{ new Date(marker.data.uploadDate).toLocaleDateString() }}</span><br>
        <span class="description">{{ marker.data.metadata.description }}</span>
        <v-carousel v-if="marker.data.images.length" :style="{ width: '400px', height: '200px' }">
          <v-carousel-item
            v-for="(image, index) in marker.data.images"
            :key="index"
            :src="urls.get(image) || fetchImage(image)"
            cover>
          </v-carousel-item>
        </v-carousel>
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
      <v-pagination v-model="currentPage" :length="maxPage"></v-pagination>
    </ul>
  </div>
</template>

<script>
// import { divIcon } from 'leaflet';
import { circle } from 'leaflet';
import CloseButton from './CloseButton.vue';

export default {
  name: 'SidePanel',
  components: {
    CloseButton,
  },
  props: {
    markers: {
      type: Array,
      default: () => [],
    },
    map: {
      type: Object,
      default: null,
    },
    /** @type {{ lat: number, lng: number }} */
    clicked: null,
  },
  data () {
    return {
      urls: new Map(),
      circles: new WeakMap(),
      /** @type {HTMLAudioElement} */
      currentAudio: null,
      currentPage: 1,
      perPage: 5,
      colors: ['#FF0000', '#008000', '#0000FF', '#FFA500', '#800080'],
    };
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
    paginatedMarkers () {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.markers.toSorted((a, b) => {
        const distanceA = this.clicked.latlng.distanceTo(a._latlng);
        const distanceB = this.clicked.latlng.distanceTo(b._latlng);
        return distanceA - distanceB;
      }).slice(start, end);
    },
    /**
     * @todo Figure out why when the `+ 1` is removed we get a recursion error
     * @returns {number}
     */
    maxPage () {
      return Math.ceil(this.markers.length / this.perPage) + 1;
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
  },
  mounted () {
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
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  background-color: #f9f9f9;
  width: auto;
  min-width: 200px;
  height: auto;
  overflow: hidden;
  overflow-y: auto;
  transition: height 0.5s ease;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
}

#heading {
  border-bottom: 1px solid #ddd;
  height: 40px;
}

h3 {
  /* TODO: Change this font */
  position: absolute;
  margin: 0;
  padding: 10px 10px;
  left: 0;
}

.popup-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.popup-list li {
  padding: 8px 16px;
  text-decoration: none;
  display: block;
  border-bottom: 1px solid #ddd;
}

.popup-list li:hover {
  background-color: aliceblue;
}

.sound-bar {
  margin-top: 10px;
}
</style>
