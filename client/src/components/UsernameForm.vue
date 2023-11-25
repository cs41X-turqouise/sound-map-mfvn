<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Username</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="username"
            label="Username"
            clearable
            required
            :rules="formRules"
            aria-describedby="usernameRules">
          </v-text-field>
          <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- <v-btn color="blue darken-1" flat @click="close">Close</v-btn> -->
          <v-btn
            color="blue darken-1"
            flat
            :disabled="!validate()"
            @click="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';

export default {
  name: 'UsernameForm',
  setup () {
    const store = useStore();
    const formRules = [
      (v) => !!v || 'Username is required',
      (v) => v.length >= 3 || 'Username must be at least 3 characters',
      (v) => (v && /^[a-zA-Z0-9_]+$/.test(v))
        || 'Username can only contain alphanumeric characters and underscores',
      (v) => v.length <= 20 || 'Username must be less than 20 characters',
    ];
    return { store, formRules };
  },
  data () {
    return {
      dialog: true,
      loading: false,
      username: '',
      errorMessage: '',
    };
  },
  methods: {
    validate () {
      return this.formRules.every((rule) => rule(this.username) === true);
    },
    close () {
      this.dialog = false;
      this.loading = false;
      this.username = '';
      this.errorMessage = '';
    },
    async submit () {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await Api().patch(`/users/${this.store.state.user._id}`, {
          username: this.username,
        });
        console.log(response);
        if (response.status === 200) {
          this.store.commit('setUser', response.data);
          this.close();
        }
      } catch (error) {
        this.errorMessage = 'Username is already taken. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
</style>
