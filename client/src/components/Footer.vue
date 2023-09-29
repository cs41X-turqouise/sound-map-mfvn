<template>
  <footer>
    <p>
      <span @click="nav()">
        &copy; 2023 Sound Map for a Changing Landscape
      </span>
    </p>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  methods: {
    nav: function () {
      const currentRouteName = this.$route.name;
      const page = currentRouteName === 'home' ? 'about' : 'home';
      this.$router.push({
        name: page,
      });
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
footer {
  position: fixed;
  bottom: 0;
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
