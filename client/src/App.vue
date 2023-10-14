<template>
  <v-app fullscreen>
    <v-main style="height: 100vh; width: 100vw; overflow-y: hidden;">
      <v-container fluid style="padding: 0;">
        <router-view></router-view>
      </v-container>
    </v-main>
    <PageFooter></PageFooter>
  </v-app>
</template>

<script>
import PageFooter from './components/PageFooter.vue';
export default {
  name: 'App',
  components: {
    PageFooter,
  },
};
</script>

<style>
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.v-container {
  background-color: cyan;
}
</style>
