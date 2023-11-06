<template>
  <v-footer color="blue" inset app absolute padless>
    <span @click="nav()">
      &copy; 2023 Sound Map for a Changing Landscape
    </span>
  </v-footer>
</template>

<script>
export default {
  name: 'PageFooter',
  methods: {
    nav: function () {
      const currentRouteName = this.$route.name;
      const page = currentRouteName === 'HomePage' ? 'AboutPage' : 'HomePage';
      this.$router.push({
        name: page,
      });
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-footer {
  width: 100%;
  height: fit-content;
  text-align: center;
  justify-content: center;
}
span {
  cursor: pointer;
}
span:hover {
  color: #fff;
}
</style>
