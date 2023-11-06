<template>
  <v-app fullscreen style="width:100vw">
    <v-main no-gutters>
      <v-container fluid style="padding: 0; height: 100%">
        <router-view></router-view>
      </v-container>
      <PageFooter></PageFooter>
    </v-main>
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
<style scoped>
.v-main{
  display: flex;
  flex-direction: column;
}
</style>
