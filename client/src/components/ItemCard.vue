<template>
  <v-card>
    <v-card-item align="left" justify="center">
      <v-card-title class="wrap-text">
        {{ item.metadata.title }}
      </v-card-title>
      <v-card-subtitle>
        <div v-if="item.metadata.geodata" class="wrap-text">
          <p>{{ JSON.parse(item.metadata.geodata).formatted }}</p>
        </div>
        <span>
          Lat: {{ Number(item.metadata.latitude).toFixed(4) }}
          Lng: {{ Number(item.metadata.longitude).toFixed(4) }}
          <br>
        </span>
        <span class="date">
          Date: {{ new Date(item.uploadDate).toLocaleDateString() }}
        </span><br>
        <span class="wrap-text" v-if="item.metadata.description">
          Description: <p>{{ item.metadata.description }}</p>
        </span><br>
        <v-chip v-for="(tag, index) of item.metadata.tags" :key="index">
          {{ tag }}
        </v-chip>
      </v-card-subtitle>
      <v-carousel
        v-if="!!item.images && item.images.length"
        :hide-delimiters="item.images.length > 1 ? false : true"
        :show-arrows="item.images.length > 1 ? 'hover' : false"
        :style="{ width: '350px', height: '150px' }">
        <v-carousel-item
          v-for="(image, index) in item.images"
          :key="index"
          :src="urls.get(image) || fetchImage(image)"
          cover>
        </v-carousel-item>
      </v-carousel>
    </v-card-item>
    <v-card-actions>
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script>
import Api from '../services/Api';

export default {
  name: 'ItemCard',
  props: {
    item: {
      type: Object,
      required: true,
    },
    urls: {
      type: Map,
      required: true,
    },
  },
  methods: {
    async fetchImage (id) {
      await Api().get(`uploads/image/${id}`, { responseType: 'blob' })
        .then((response) => {
          const objectUrl = URL.createObjectURL(response.data);
          this.$emit('addUrl', { id, objectUrl });
          return objectUrl;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.wrap-text {
  white-space: normal;
  word-wrap: break-word;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
