<template>
  <v-container fill-height fluid>
    <v-row justify="center" align-center>
      <v-col cols="6">
        <v-card>
          <v-card-title class="text-center">Register</v-card-title>
          <v-card-text>
            <v-form name="register" autocomplete="off">
              <v-text-field label="Email" v-model="email"></v-text-field>
              <v-text-field
                label="Password"
                type="password"
                v-model="password"
                autocomplete="new-password"
              ></v-text-field>
            </v-form>
            <v-alert
              v-if="error"
              type="error"
              dismissible
              v-html="error"
            ></v-alert>
          </v-card-text>
          <v-card-actions justify-center>
            <v-btn color="primary" @click="register">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AuthService from '../services/AuthService.js'

export default {
  data () {
    return {
      email: '',
      password: '',
      error: null
    }
  },
  methods: {
    async register () {
      try {
        const response = await AuthService.register({
          email: this.email,
          password: this.password
        })
        this.$store.dispatch('setToken', response.data.token)
        this.$store.dispatch('setUser', response.data.user)
        this.$router.push({
          name: 'home'
        })
      } catch (error) {
        this.error = error.response.data.error
      }
    }
  }
}
</script>

<style scoped>
</style>