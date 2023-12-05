<template>
  <v-footer app class="bg-deep-orange-accent-1">
    <div v-if="store.state.user && store.state.user.role !== 'user'">
      <v-tooltip
        activator="parent"
        location="start"
        style="z-index: 9999;"
      >
        {{ store.state.user.role }}
      </v-tooltip>
      <v-icon>
        {{ roleIcon }}
      </v-icon>
    </div>
    <v-spacer></v-spacer>
    <div>
      <p>
        <span id="copyright" @click="nav()">
          &copy; 2023 Sound Map for a Changing Landscape
        </span>
      </p>
    </div>
    <v-spacer></v-spacer>
    <div>
      <v-btn icon flat density="comfortable" @click="openGithub">
        <v-tooltip
          activator="parent"
          location="start"
          style="z-index: 9999;"
        >
          View on Github
        </v-tooltip>
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </div>
  </v-footer>
</template>

<script>
import { useStore } from 'vuex';

export default {
  name: 'PageFooter',
  setup () {
    const store = useStore();
    return { store };
  },
  methods: {
    nav: function () {
      const currentRouteName = this.$route.name;
      const page = currentRouteName === 'HomePage' ? 'AboutPage' : 'HomePage';
      this.$router.push({
        name: page,
      });
    },
    openGithub: function () {
      window.open('https://github.com/cs41X-turqouise/sound-map-mfvn/tree/master', '_blank');
    },
  },
  computed: {
    roleIcon () {
      switch (this.store.state.user.role) {
      case 'moderator':
        return 'mdi-account-star';
      case 'admin':
        return 'mdi-shield-account';
      case 'superadmin':
        return 'mdi-shield-crown';
      default:
        return 'mdi-account';
      }
    }
  },
};
</script>

<style scoped>
.v-footer {
  width: 100%;
  height: 2.5rem;
  line-height: 2.5rem;
  /* background-color: gainsboro; */
  background-color: #00bcd4;
  text-align: center;
  justify-content: center;
}
@media (max-width: 420px) {
  .v-footer p {
    font-size: 12px;
  }
}
span {
  cursor: pointer;
}
span:hover {
  color: #fff;
}
</style>
