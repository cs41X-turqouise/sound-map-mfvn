<template>
  <CenterModal :show="show" @close="close">
    <v-card>
      <v-card-title>
        <span class="headline">Report Marker - {{ marker.metadata.title }}</span>
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="reportReason"
          label="Reason for reporting"
          rows="3"
          clearable
          counter
          required
          :rules="[
            (v) => !!v || 'Reason is required',
            (v) => v.length >= 25 || 'Reason must be at least 25 characters',
            (v) => v.length <= 1000 || 'Reason must be less than 1000 characters'
          ]"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">
          Close
        </v-btn>
        <v-btn
          text
          color="blue darken-1"
          @click="report"
          :disabled="!reportReason || reportReason.length < 25 || reportReason.length >= 1000"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </CenterModal>
</template>

<script>
import CenterModal from './CenterModal.vue';

export default {
  name: 'ReportModal',
  props: {
    marker: {
      type: Object,
      default: null,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    CenterModal,
  },
  data () {
    return {
      dialog: false,
      reportReason: '',
    };
  },
  methods: {
    close () {
      this.$emit('close');
    },
    report () {
      this.$emit('report', this.marker, this.reportReason);
    },
  },
};
</script>

<style scoped>
</style>
