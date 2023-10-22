<template>
  <CenterModal :show="show" @close="close">
    <h2>Upload Media</h2>
    <!-- TODO - better handling of these as tags are technically an array of strings -->
      <v-form @submit.prevent="upload" ref="form">
        <v-text-field name="title" label="Title" id="title" clearable
        ></v-text-field>
        <v-text-field name="description" label="Description" id="description" clearable
        ></v-text-field>
        <v-text-field name="tags" label="Tags" id="tags" clearable
        ></v-text-field>
        <div>
          <v-row>
            <v-col cols="6">
              <v-text-field
                label="Your Latitude Coordinates: " setClicked
                :setClicked="Latitude"
                clearable
                :rules="latitudeRules"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Your Longitude Coordinates: " setclicked
                :setClicked="Longitude"
                clearable
                :rules="longitudeRules"
              ></v-text-field>
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
      latitudeRules: [
        (v) => {
          if (v) return true;
          return 'Latitude is required.';
        },
        (v) => {
          if (v >= -90 && v <= 90) return true;
          return 'Must be between -90 and 90.';
        },
      ],
      longitudeRules: [
        (v) => {
          if (v) return true;
          return 'Longitude is required.';
        },
        (v) => {
          if (v >= -180 && v <= 180) return true;
          return 'Must be between -180 and 180.';
        },
      ],
    };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    /**
     * @async
     * @param {Event} e
     */
    async upload (e) {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      const form = e.target;
      this.$emit('upload', form);
    },
  },
};
</script>

<style scoped>
</style>
