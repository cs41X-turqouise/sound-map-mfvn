<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Media</h2>
    <!-- TODO - custom error messages and validation -->
    <v-form @submit.prevent>
      <v-text-field name="title" label="Title" id="title" clearable
      ></v-text-field>
      <v-text-field name="creator" label="Creator" id="creator" clearable
      ></v-text-field>
      <v-text-field name="description" label="Description" id="description" clearable
      ></v-text-field>
      <v-select
        :items="tagList"
        label="Tags"
        multiple
        chips
        :menu-props="{ zIndex: 9999 }"
      ></v-select>
      <v-text-field name="dateFrom" label="From" id="dateFrom" type="date" clearable
      ></v-text-field>
      <v-text-field name="dateTo" label="To" id="dateTo" type="date" clearable
      ></v-text-field>
      <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
    </v-form>
  </CenterModal>
</template>

<script>
import CenterModal from './CenterModal.vue';

export default {
  name: 'SearchModal',
  components: {
    CenterModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    files: {
      type: Map,
      default: () => new Map(),
    },
  },
  methods: {
    close () {
      this.$emit('close');
    },
  },
  computed: {
    tagList () {
      const tags = new Set();
      for (const file of this.files.values()) {
        for (const tag of file.metadata.tags) {
          console.log(tag);
          tags.add(tag);
        }
      }
      return [...tags];
    },
  },
};
</script>

<style scoped>
</style>
