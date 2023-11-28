<template>
  <CenterModal :show="show" @close="close">
    <h2>Search Media</h2>
    <!-- TODO - custom error messages and validation -->
    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="title"
        name="title"
        label="Title"
        id="title"
        clearable
      ></v-text-field>
      <v-text-field
        v-model="creator"
        name="creator"
        label="Creator"
        id="creator"
        clearable
      ></v-text-field>
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
      <v-btn type="submit" name="submit" value="Submit">
        Submit
      </v-btn>
    </v-form>
  </CenterModal>
</template>

<script>
import { useStore } from 'vuex';
import CenterModal from './CenterModal.vue';

/** @typedef {import('../App.vue').UploadSchema} UploadSchema */

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
  emits: ['close', 'filtered-files'],
  setup () {
    const store = useStore();
    return { store };
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
  computed: {
    /** @returns {Map<number, UploadSchema>} */
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
  methods: {
    close () {
      this.$emit('close');
    },
    /**
     * @async
     * @param {Event} e
     */
    async submit (e) {
      const fileList = [];
      for (const file of this.files.values()) {
        let hits = 0;
        if (this.title && file.metadata.title.includes(this.title)) {
          hits++;
        }
        if (this.creator && file.metadata.creator.username.includes(this.creator)) {
          hits++;
        }
        if (this.description && file.metadata.description.includes(this.description)) {
          hits++;
        }
        if (this.dateFrom && (new Date(file.uploadDate) >= new Date(this.dateFrom))) {
          hits++;
        }
        if (this.dateTo && (new Date(file.uploadDate) <= new Date(this.dateTo))) {
          hits++;
        }
        if (this.tags.length) {
          for (const tag of this.tags) {
            if (file.metadata.tags.includes(tag)) {
              hits++;
            }
          }
        }
        if (hits == 0) {
          continue;
        }
        fileList.push({ hits, file });
      }
      e.target.reset();
      this.$emit('filtered-files', fileList.sort((a, b) => b.hits - a.hits).map((file) => file.file));
    }
  },
};
</script>

<style scoped>
</style>
