<template>
  <CenterModal :show="show" @close="close">
    <h2>Upload Media</h2>
    <!-- TODO - better handling of these as tags are technically an array of strings -->
    <v-form @submit.prevent="upload" ref="form">
      <v-text-field
        name="title"
        label="Title"
        id="title"
        maxlength="60"
        clearable
      ></v-text-field>
      <v-text-field name="description" label="Description" id="description" clearable
      ></v-text-field>
      <!-- Hacky - Fixes order in which formdata elements are processed though -->
      <v-text-field name="creator" id="creator" style="display: none;"></v-text-field>
      <v-text-field name="tags" id="tags" style="display: none;"></v-text-field>
      <v-text-field name="latitude" id="latitude" style="display: none;"></v-text-field>
      <v-text-field name="longitude" id="longitude" style="display: none;"></v-text-field>
      <v-text-field name="geodata" id="geodata" style="display: none;"></v-text-field>
      <v-text-field
        label="Tags"
        v-model="tagInput"
        clearable
        hint="Tags are single words, enter a space to create a new tag"
        persistent-hint
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
      const tag = this.tagInput.replace(/\s+/g, '');
      if (tag) {
        this.tags.add(tag);
      }
      this.tagInput = '';
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
      const { lat, lng } = this.$store.state.clicked;
      const geoLocation = fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`)
        .then((response) => response.json())
        .then((result) => {
          return result.features[0].properties;
        })
        .catch((error) => console.log('error', error));
      const geoLocationData = await geoLocation;
      if (this.tagInput) {
        this.addTag();
      }
      const conjunctions = ['and', 'or', 'but', 'nor', 'for', 'yet', 'so'];
      // Auto-capitalizes the first letter of each word in the title excluding conjunctions
      const title = form.title.value.trim().split(' ').map((word, index) => {
        if (index !== 0 && conjunctions.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
      formData.set('creator', this.$store.state.user._id);
      formData.set('title', title);
      formData.set('tags', Array.from(this.tags));
      formData.set('latitude', lat);
      formData.set('longitude', lng);
      if (geoLocationData) {
        formData.set('geodata', JSON.stringify(geoLocationData));
      }
      this.tags.clear();
      this.$emit('upload', form, formData);
    },
  },
};
</script>

<style scoped>
</style>
