<template>
  <div class="d-flex justify-space-around">
    <v-btn
      v-if="!store.state.user"
      flat
      @click="loginWithGoogle">
      Sign in with Google
    </v-btn>
    <v-menu
      v-if="store.state.user"
      persistent>
      <template v-slot:activator="{ props }">
        <v-btn
          color= "Black"
          v-bind="props"
          @click="store.dispatch('userMenuClicked', !store.state.userMenuClicked)"
        >
          User Menu
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-if="['admin', 'moderator'].includes(store.state.user?.role)"
          @click="nav('/admin')">
          <v-list-item-title>Admin</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="nav('/profile')">
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import Api from '../services/Api';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'UserMenu',
  setup () {
    const router = useRouter();
    const store = useStore();
    return { router, store };
  },
  methods: {
    nav (path) {
      this.router.push({ path });
    },
    loginWithGoogle () {
      window.location.href = 'http://localhost:3000/auth/google';
    },
    async logout () {
      this.store.dispatch('setToken', null);
      this.store.dispatch('setUser', null);
      await Api().post('auth/logout').catch((error) => {
        if (error.message == 'User not logged in') {
          return;
        }
        console.log(error);
      });
    },
  }
};
</script>

<style scoped>
</style>
