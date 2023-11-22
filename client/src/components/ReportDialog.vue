<template>
  <v-dialog v-model="dialog" activator="parent" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Provide a reason</span>
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="reason"
          label="Reason"
          clearable
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
        <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!reason || reason.length < 25 || reason.length >= 1000"
          @click="submitReason"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ReportDialog',
  data () {
    return {
      dialog: false,
      reason: '',
    };
  },
  methods: {
    close () {
      this.dialog = false;
      this.reason = '';
    },
    submitReason () {
      this.$emit('submitReason', this.reason);
      this.close();
    },
  },
};
</script>

<style scoped>
</style>
