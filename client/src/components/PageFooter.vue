<template>
  <v-footer app>
    <p>
      <span @click="nav()">
        &copy; 2023 Sound Map for a Changing Landscape
      </span>
    </p>
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
  height: 2.5rem;
  line-height: 2.5rem;
  background-color: #00bcd4;
  text-align: center;
  
}
span {
  cursor: pointer;
}
span:hover {
  color: #fff;
}
</style>
