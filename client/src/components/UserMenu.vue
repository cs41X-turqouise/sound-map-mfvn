<template>
  <div class="d-flex justify-space-around">
    <v-btn
      v-if="!store.state.user"
      flat
      @click="loginWithGoogle"
    >
      Sign in with Google
    </v-btn>
    <v-menu
      v-if="store.state.user"
      persistent
    >
      <template v-slot:activator="{ props }">
        <v-btn
          color="Black"
          v-bind="props"
          text
          @click="menuClicked"
        >
          User Menu
        </v-btn>
      </template>
      <v-list density="compact">
        <v-list-item
          v-if="$route.path !== '/inbox'"
          @click="nav('/inbox')"
        >
          <template v-slot:prepend>
            <v-badge
              left
              color="primary"
              :content="store.state.user?.inbox.filter((m) => !m.read).length || 0"
            >
              <v-icon icon="mdi-inbox"></v-icon>
            </v-badge>
          </template>
          <v-list-item-title>Inbox</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="roles[store.state.user.role] > roles['user'] && $route.path !== '/admin'"
          @click="nav('/admin')"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-shield-crown"></v-icon>
          </template>
          <v-list-item-title>Admin</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="$route.path !== '/'"
          @click="nav('/')"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-home"></v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="$route.path !== '/profile'"
          @click="nav('/profile')"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
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
    const roles = Object.freeze({
      user: 1,
      moderator: 2,
      admin: 3,
      superadmin: 4,
    });
    return { router, store, roles };
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
      await Api().post('auth/logout').catch((error) => {
        if (error.message == 'User not logged in') {
          return;
        }
        console.log(error);
      });
      this.store.dispatch('setToken', null);
      this.store.dispatch('setUser', null);
      this.router.push({ path: '/' });
    },
  }
};
</script>

<style scoped>
</style>
