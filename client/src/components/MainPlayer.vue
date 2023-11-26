<script setup>
import { useStore } from 'vuex';
import { computed, onMounted, watch, ref } from 'vue';
import WaveSurfer from 'wavesurfer.js';

const store = useStore();
const id = computed(() => store.state.fileId);
const urls = computed(() => store.state.fileUrls);

const options = {
  container: '#waveform',
  waveColor: '#4F4A85',
  progressColor: '#383351',
  width: 'auto',
  height: 'auto',
  barWidth: 2,
  barGap: 2,
  barRadius: 5,
};

let wavesurfer = null;
const playing = computed(() => store.state.playing);

onMounted(() => {
  wavesurfer = WaveSurfer.create(options);
});

watch(id, (newId, oldId) => {
  if (urls.value.has(newId)) {
    wavesurfer.load(urls.value.get(newId));
    wavesurfer.on('ready', (duration) => {
      play();
    });
  }
});

watch(playing, (newPlaying, oldPlaying) => {
  if (newPlaying) {
    play();
  } else {
    pause();
  }
});
/** */
function toggle () {
  if (playing.value) {
    pause();
  } else {
    play();
  }
}
/** */
function play () {
  if (wavesurfer.isPlaying()) return;
  store.dispatch('setPlaying', true);
  wavesurfer.play();
}
/** */
function pause () {
  if (!wavesurfer.isPlaying()) return;
  store.dispatch('setPlaying', false);
  wavesurfer.pause();
}
</script>

<template>
    <v-footer>
        <v-row>
            <div id="waveform" class="flex-fill"></div>
            <v-icon v-if="!playing"
                icon="mdi-play-circle"
                size="50px"
                @click="toggle()"></v-icon>
            <v-icon v-else
                icon="mdi-pause-circle"
                size="50px"
                @click="toggle()"></v-icon>
        </v-row>
    </v-footer>
</template>
