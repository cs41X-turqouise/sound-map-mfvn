<script setup>
import { useStore } from 'vuex';
import { computed, onMounted, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';

const store = useStore();
const id = computed(() => store.state.fileId);
const files = computed(() => {
  return store.state.files;
});
const urls = computed(() => store.state.fileUrls);

const options = {
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  height: 'auto'
};


let wavesurfer = null;
onMounted(() => {
  wavesurfer = WaveSurfer.create(options);
});

watch(id, (newId, oldId) => {
  if (urls.value.has(newId)) {
    // options.url = urls.value.get(newId);
    wavesurfer.load(urls.value.get(newId));
    wavesurfer.on('ready', (duration) => {
      wavesurfer.play();
    });
  }
});
</script>

<template>
    <v-footer>
        <v-row>
            <v-icon icon="mdi-play-circle" size="50px"></v-icon>
            <div id="waveform" class="flex-fill"></div>
            {{ file }}
        </v-row>
    </v-footer>
</template>
