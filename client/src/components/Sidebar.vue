<template>
  <div v-if="clicked" id="sidebar" class="sidebar" @click.stop>
    <CloseButton @close="close" />
    <h2>Selected Location</h2>
    <p>{{ clicked.lat }}, {{ clicked.lng }}</p>
    <!-- <ul id="popup-list" class="popup-list">
      <li v-for="popup in popups" :key="popup.id">
        <b class="name">{{ popup.title }}</b> (<span class="distance">{{ popup.distance.toFixed(2) }}</span> m)<br>
        Date: <span class="date">{{ popup.date.toLocaleDateString() }}</span><br>
        <div class="sound-bar">
          <audio class="audio" controls>
            <source :src="popup.file instanceof File ? URL.createObjectURL(popup.file) : popup.file" :type="`audio/${popup.fileType}`">
          </audio>
        </div>
      </li>
    </ul> -->
  </div>
</template>

<script>
import CloseButton from "./CloseButton.vue";

export default {
  name: "Sidebar",
  components: {
    CloseButton,
  },
  props: {
    popups: {
      type: Array,
      default: () => [],
    },
    map: {
      type: Object,
      default: null,
    },
    clicked: null,
  },
  methods: {
    close() {
      this.$emit("close");
    },
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
  /* width: 100%; */
  width: auto;
  height: auto;
  /* height: 0; */
  overflow: hidden;
  transition: height 0.5s ease;
}

.sidebar-close {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 36px;
  margin-right: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
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
}

.popup-list li:hover {
  background-color: #f1f1f1;
}

.sound-bar {
  margin-top: 10px;
}
</style>