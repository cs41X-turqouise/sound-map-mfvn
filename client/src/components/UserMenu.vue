<template>
  <div class="d-flex justify-space-around">
    <v-btn
          v-if="!$store.state.user"
          flat
          @click="loginWithGoogle">
          Sign in with Google
        </v-btn>
    <v-menu
        v-if="$store.state.user">
        <template v-slot:activator="{ props }">
          <v-btn
            color= "Black"
            v-bind="props"
          >
            User Menu
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :value="index"
            @click="handleItemClick(item)"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>


    </div>
  </template>

<script>
import Api from '../services/Api';

export default {
  name: 'DropDownMenu',
  data: () => ({
    items: [
      { title: 'Profile', path: '/profile', action: 'goToProfilePage' },
      { title: 'Admin', path: '/admin', action: 'goToAdminPage' },
      { title: 'Logout', path: 'auth/logout', action: 'logout' },
    ],
  }),
  methods: {
    handleItemClick (item) {
      if (typeof this[item.action] === 'function') {
        this[item.action]();
      }
    },
    loginWithGoogle () {
      window.location.href = 'http://localhost:3000/auth/google';
    },
    logout () {
      console.log('Logging out');
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      Api().post('auth/logout').catch((error) => {
        if (error.message == 'User not logged in') {
          return;
        }
        console.log(error);
      });
    },
    goToAdminPage () {
      window.location.href = 'http://localhost:5173/admin';
    },
  }
};


</script>

<!-- <template>
  <div class="user-menu" v-if="show">
    <ul class="popup-list">
      <span>Hello {{ user || "Guest" }}</span>
      <template v-if="user">
        <button type="button" id="logout">Logout</button>
        <button type="button" id="upload">Upload</button>
        <button type="button" id="profile">Profile</button>
      </template>
      <template v-else>
        <button type="button" id="login">
          Login with Google
        </button>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'UserMenu',
  props: {
    user: {
      type: String,
      default: 'Guest',
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
  },
};
</script>

<style scoped>
.user-menu {
  position: absolute;
  top: 60px;
  right: 0;
  z-index: 9999;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
}

.user-menu button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  background-color: transparent;
  text-align: left;
  cursor: pointer;
}

.user-menu button:hover {
  background-color: #f5f5f5;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popup-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.popup-list li {
  padding: 8px 16px;
  text-decoration: none;
  display: block;
}

.popup-list li:hover {
  background-color: #f1f1f1;
}
</style> -->
