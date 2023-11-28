<script setup>
import { useStore } from 'vuex';
import { computed, onMounted, ref, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';

const store = useStore();
const id = computed(() => store.state.fileId);
const urls = computed(() => store.state.fileUrls);
const playing = computed(() => store.state.playing);
const duration = ref('0:00');
const currentTime = ref('0:00');

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

/** @type {WaveSurfer} */
let wavesurfer = null;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secondsRemainder = Math.round(seconds) % 60;
  const paddedSeconds = `0${secondsRemainder}`.slice(-2);
  return `${minutes}:${paddedSeconds}`;
};

onMounted(() => {
  wavesurfer = WaveSurfer.create(options);
  wavesurfer.on('decode', () => {
    duration.value = formatTime(wavesurfer.getDuration());
  });
  wavesurfer.on('timeupdate', (current) => {
    currentTime.value = formatTime(current);
  });
});

watch(id, (newId, oldId) => {
  if (urls.value.has(newId)) {
    console.log('load', newId);
    wavesurfer.load(urls.value.get(newId));
    wavesurfer.on('ready', (duration) => {
      console.log('ready', duration);
      play();
    });
  }
});

watch(playing, (newPlaying, oldPlaying) => {
  newPlaying ? play() : pause();
});

/** */
function toggle () {
  playing.value ? pause() : play();
}
/** */
function play () {
  if (wavesurfer.isPlaying()) return;
  if (!playing.value) store.dispatch('setPlaying', true);
  wavesurfer.play();
}
/** */
function pause () {
  if (!wavesurfer.isPlaying()) return;
  if (playing.value) store.dispatch('setPlaying', false);
  wavesurfer.pause();
}
</script>

<template>
  <v-footer>
    <v-row>
      <div id="time">
        {{ currentTime }}
      </div>
      <div id="waveform" class="flex-fill"></div>
      <div id="duration">
        {{ duration }}
      </div>
      <v-icon
        v-if="!playing"
        icon="mdi-play-circle"
        size="50px"
        @click="toggle()"
      ></v-icon>
      <v-icon
        v-else
        icon="mdi-pause-circle"
        size="50px"
        @click="toggle()"
      ></v-icon>
    </v-row>
  </v-footer>
</template>
