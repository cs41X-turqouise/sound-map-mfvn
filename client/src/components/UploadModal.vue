<template>
  <CenterModal :show="show" @close="close">
    <h2>Upload Media</h2>
    <!-- TODO - better handling of these as tags are technically an array of strings -->
      <v-form @submit.prevent="upload" ref="form">
        <v-text-field name="title" label="Title" id="title" clearable
        ></v-text-field>
        <v-text-field name="description" label="Description" id="description" clearable
        ></v-text-field>
        <!-- Hacky - Fixes order in which formdata elements are processed though -->
        <v-text-field name="tags" label="Tags" id="tags" style="display: none;"></v-text-field>
        <v-text-field name="latitude" id="latitude" style="display: none;"></v-text-field>
        <v-text-field name="longitude" id="longitude" style="display: none;"></v-text-field>
        <v-text-field
          label="Tags"
          v-model="tagInput"
          clearable
          @keyup.space="addTag"
          @keyup.enter="addTag"
        ></v-text-field>
        <v-chip
          v-for="tag in tags"
          :key="tag"
          closable
          @click:close="removeTag(tag)"
        >
          {{ tag }}
        </v-chip>
        <div>
          <v-row>
            <v-col cols="6">
              <v-text-field disabled>
                Selected Lattitude: {{ this.$store.state.clicked.lat.toFixed(4) }}
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field disabled>
                Selected Longitude: {{ this.$store.state.clicked.lng.toFixed(4) }}
              </v-text-field>
            </v-col>
          </v-row>
        </div>
        <v-file-input
          label="Select a Sound File"
          id="sound"
          name="sound"
          accept="audio/*"
          required
          :rules="soundRules"
        ></v-file-input>
        <v-file-input
          label="Select Image File(s)"
          id="images"
          name="images"
          accept="image/*"
          multiple
          clearable
        ></v-file-input>
        <v-btn type="submit" name="submit" value="Submit">Submit</v-btn>
      </v-form>
  </CenterModal>
</template>

<script>
import CenterModal from './CenterModal.vue';

export default {
  name: 'UploadModal',
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
      soundRules: [
        (v) => {
          if (v?.length) {
            return true;
          }
          return 'Choose a file';
        }
      ],
      tagInput: '',
      tags: new Set(),
    };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    addTag () {
      const tag = this.tagInput.trim();
      if (tag) {
        this.tags.add(tag);
        this.tagInput = '';
      }
    },
    removeTag (tag) {
      this.tags.delete(tag);
    },
    /**
     * @async
     * @param {Event} e
     */
    async upload (e) {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const form = e.target;
      const formData = new FormData(form);
      formData.set('tags', Array.from(this.tags));
      formData.set('latitude', this.$store.state.clicked.lat);
      formData.set('longitude', this.$store.state.clicked.lng);
      this.tags.clear();
      this.$emit('upload', form, formData);
    },
  },
};
</script>

<style scoped>
</style>
