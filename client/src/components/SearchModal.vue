<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Media</h2>
    <!-- TODO - custom error messages and validation -->
    <v-form @submit.prevent>
      <v-text-field name="title" label="Title" id="title" clearable
      ></v-text-field>
      <v-text-field name="artist" label="Artist" id="artist" clearable
      ></v-text-field>
      <v-text-field name="description" label="Description" id="description" clearable
      ></v-text-field>
      <v-text-field name="tags" label="Tags" id="tags" clearable
      ></v-text-field>
      <v-text-field name="fileType" label="File Type" id="fileType" clearable
      ></v-text-field>
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
  },
  methods: {
    close () {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
</style>
