<template>
  <div class="about-us">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="page-title">About Us</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class="section-card" v-for="(section, index) in sections" :key="index">
            <v-card-title class="section-title">{{ section.title }}</v-card-title>
            <v-card-text class="section-content">{{ section.content }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sections: [
        {
          title: "Introduction",
          content: "Wecome to the SoundMap for a changing landscape. Here we have a developed a program that will, in time, preserve some of the history of the TideWater region. By collecting uploads of sounds, videos, and files by our registered users, we can not only preserve some of the history of the region, but also document the long-term effects of global climate change"
        },
        {
          title: "Who Are We?",
          content: "We are a group of seniors at Old Dominion University creating a SoundMap for the local TideWater Environment. We are: Prestin B., Patrick M., Thomas R., Kori F., Christian W., Brandon B., Benjamin J., and our lead developer, Evan G. Together we are known as Team Turquiose"
        },
        {
          title: "Our Vision",
          content: "Team Turquoise's primary goal is to combat climate change by creating a sound map to raise awareness about rising sea levels and related challenges in the Chesapeake Bay region. We believe that giving everyone a voice by aloowing those to upload their own images and sounds so that we can influence policy makers, and ultimately, change."
        },
        {
          title: "Description of the Interactive Sound Map",
          content: "The SoundMap is exactly what it sounds like. An interactive map that allows anyone who registers and upload markers on the map. These files may contain audio (sounds)or visuals (images). Using this, we can preserve the history of the region"
        },
        {
          title: "Problem Background",
          content: "In the Chesapeake Bay region, rising sea levels present a range of critical issues, including erosion, flooding, saltwater contamination, and habitat destruction, and more intense storms to name a few. The soundmap will allow us to see these changes over-time."
        }
      ]
    };
  }
};
</script>

<style scoped>
.about-us {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: lightblue;
}

.page-title {
  font-size: 36px;
  color: #007BFF;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  /* Add the underline here */
  border-bottom: 2px solid black;
  /* Adjust the color and thickness as needed */
}

.section-card {
  margin-bottom: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.section-card:hover {
  transform: scale(1.02);
}

.section-title {
  font-size: 24px;
  color: #007BFF;
  font-weight: bold;
  padding: 15px 20px;
  background-color: #fff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.section-content {
  font-size: 20px;
  line-height: 1.5;
  padding: 20px;
  /* background-color: #007BFF; */
}

.v-container {
  max-width: 1200px;
  background-color: lightblue;
}
</style>

