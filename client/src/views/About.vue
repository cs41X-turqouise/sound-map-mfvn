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
          title: "Welcome and Introduction",
          content: "Welcome to Sound Map For Changing Landscape about page, where we are happy to present our creative solution aimed at focus on the critical issue of climate change in the Tidewater Region."
        },
        {
          title: "Our Goals",
          content: "Team Turquoise's primary goal is to combat climate change by creating a sound map to raise awareness about rising sea levels and related challenges in the Chesapeake Bay region, engaging affected communities and policymakers in the fight against climate change"
        },
        {
          title: "Description of the Interactive Sound Map",
          content: "The Interactive Sound Map is a crucial tool for addressing global sea-level rise, especially in the Chesapeake Bay region. It raises awareness of changing soundscapes due to rising sea levels and encourages community involvement by allowing users to listen to and share sound recordings."
        },
        {
          title: "Problem Background",
          content: "In the Chesapeake Bay region, rising sea levels present a range of critical issues, including erosion, flooding,saltwater contamination, and habitat destruction. These interconnected challenges demand a coordinated and timely response to protect both the environment and local communities."
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
