<template>
  <div v-if="clicked" id="sidebar" class="sidebar" @click.stop>
    <section id="heading">
      <CloseButton @close="close" />
      <h3>
        Clicked ({{ clicked.lat.toFixed(2) }}, {{ clicked.lng.toFixed(2) }})
      </h3>
    </section>
    <ul id="popup-list" class="popup-list">
      <li v-for="marker in markers" :key="marker.data._id">
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
        <div class="sound-bar">
          <audio v-if="urls.has(marker.data._id)" class="audio" :ref="`audio-${marker.data._id}`" controls>
            <source :src="urls.get(marker.data._id)" :type="`${marker.data.contentType}`">
          </audio>
          <v-btn v-else @click="fetchAudio(marker.data)">Play</v-btn>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
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
    }
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
