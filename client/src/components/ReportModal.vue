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
          required
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        <v-btn color="blue darken-1" text @click="report">Save</v-btn>
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
    sanitizeInput (input) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#039;'
      };
      return input.replace(/[&<>"']/g, function (m) {
        return map[m];
      });
    },
    report () {
      const sanitizedReportReason = this.sanitizeInput(this.reportReason);
      if (sanitizedReportReason === '') {
        return;
      }
      this.$emit('report', this.marker, sanitizedReportReason);
    },
  },
};
</script>

<style scoped>
</style>
