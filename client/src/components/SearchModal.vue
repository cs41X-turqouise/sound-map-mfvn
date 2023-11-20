<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Media</h2>
    <!-- TODO - custom error messages and validation -->
    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="title"
        name="title"
        label="Title"
        id="title" clearable
      ></v-text-field>
      <!-- <v-text-field
        v-model="creator"
        name="creator"
        label="Creator"
        id="creator"
        clearable
      ></v-text-field> -->
      <v-text-field
        v-model="description"
        name="description"
        label="Description"
        id="description"
        clearable
      ></v-text-field>
      <v-select
        v-model="tags"
        :items="tagList"
        label="Tags"
        multiple
        chips
        :menu-props="{ zIndex: 9999 }"
      ></v-select>
      <v-text-field
        v-model="dateFrom"
        name="dateFrom"
        label="From"
        id="dateFrom"
        type="date"
        clearable
      ></v-text-field>
      <v-text-field
        v-model="dateTo"
        name="dateTo"
        label="To"
        id="dateTo"
        type="date"
        clearable
      ></v-text-field>
      <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
    </v-form>
  </CenterModal>
</template>

<script>
import { useStore } from 'vuex';
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
  data () {
    return {
      title: '',
      creator: '',
      description: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
    };
  },
  setup () {
    const store = useStore();
    return { store };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    /**
     * @async
     * @param {Event} e
     */
    async submit (e) {
      const filteredFiles = new Map();
      for (const file of this.files.values()) {
        if (this.title && !file.metadata.title.includes(this.title)) {
          continue;
        }
        if (this.creator && !file.metadata.creator.includes(this.creator)) {
          continue;
        }
        // if (this.description && !file.metadata.description.includes(this.description)) {
        //   continue;
        // }
        if (this.dateFrom && (new Date(file.uploadDate) < new Date(this.dateFrom))) {
          continue;
        }
        if (this.dateTo && (new Date(file.uploadDate) > new Date(this.dateTo))) {
          continue;
        }
        if (this.tags.length) {
          let found = false;
          for (const tag of this.tags) {
            if (file.metadata.tags.includes(tag)) {
              found = true;
              break;
            }
          }
          if (!found) {
            continue;
          }
        }
        filteredFiles.set(file._id, file);
      }
      e.target.reset();
      this.$emit('filteredFiles', filteredFiles);
    }
  },
  computed: {
    files () {
      return this.store.state.files;
    },
    tagList () {
      const tags = new Set();
      for (const file of this.files.values()) {
        for (const tag of file.metadata.tags) {
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
