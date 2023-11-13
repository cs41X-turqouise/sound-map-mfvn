<script setup>
import { inject } from 'vue';

const currentMarkerId = inject('currentMarkerId');
</script>

<template>
    <v-footer>
        <v-row>
            <v-icon icon="mdi-play-circle" size="50px"></v-icon>
            {{ currentMarkerId }}
        </v-row>
    </v-footer>
</template>
