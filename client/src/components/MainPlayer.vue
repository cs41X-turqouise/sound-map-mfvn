<script setup>
import { useStore } from 'vuex';

import { computed } from 'vue';
const store = useStore();

const file = computed(() => {
  return store.state.files.get(store.state.fileId);
});

</script>

<template>
    <v-footer>
        <v-row>
            <v-icon icon="mdi-play-circle" size="50px"></v-icon>
            {{ file }}
        </v-row>
    </v-footer>
</template>
