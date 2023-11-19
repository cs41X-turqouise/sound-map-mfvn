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
          @click="menuClicked"
        >
          User Menu
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-if="['admin', 'moderator'].includes(store.state.user?.role)"
          @click="nav($route.path === '/admin' ? '/' : '/admin')">
          <template v-slot:prepend>
            <v-icon :icon="$route.path === '/admin' ? 'mdi-home' : 'mdi-shield-crown'"></v-icon>
          </template>
          <v-list-item-title>{{ $route.path === '/admin' ? 'Home' : 'Admin' }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="nav('/profile')">
          <template v-slot:prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="logout">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>
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
    menuClicked () {
      // only do this from the home page - as this is to fix the menu covering the dropdown menu
      if (this.$route.path !== '/') {
        if (this.store.state.userMenuClicked) {
          // incase the value hadn't been updated when we left the home page
          this.store.dispatch('userMenuClicked', false);
        }
        return;
      }
      this.store.dispatch('userMenuClicked', !this.store.state.userMenuClicked);
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
      this.router.push({ path: '/' });
    },
  }
};
</script>

<style scoped>
</style>
