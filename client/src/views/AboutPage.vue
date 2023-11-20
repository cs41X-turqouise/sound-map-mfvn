<template>
  <div class="about-page">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="page-title">About</h1>
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
      <v-row>
        <v-col cols="6">
          <!-- Click to pull up FAQs page -->
          <v-btn class="link-btn" text @click="navigateTo('/faqs')">FAQs</v-btn>
        </v-col>
        <v-col cols="6">
          <!-- Click to pull up Contact Us Page -->
          <v-btn class="link-btn" text @click="navigateTo('/contact')">Contact Us</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      sections: [
        {
          title: 'Background: What is it?',
          content: 'Sound Map For A Changing Landscape is a socially engaged art project combining a digital archive with an art exhibition. This creates a community socially engaged art and artists'
        },
        {
          title: 'What is a sound map?',
          content: 'Sound maps are digital geographical maps that highlights on representation of a specific location (the Tidewater Region in this case), typically focused on qualitative data and evoking a sense of a place.'
        },
        {
          title: 'Who Are We?',
          content: 'We are a group of seniors at Old Dominion University creating a SoundMap for the local TideWater Environment. We are: Prestin B., Patrick M., Thomas R., Kori F., Christian W., Brandon B., Benjamin J., and our lead developer, Evan G. Together we are known as Team Turquiose. A team of collaborators along with Team Turquiose are Professor Morse, Professor Baylor, and Tim Delrosario (designer)'
        },
        {
          title: 'Our Plan',
          content: 'The plan of the project is to create an interactive sound map, with location data of both sounds and images uploaded by its users. This creates a digital archive of the region for years to come.'
        },
        {
          title: 'Goals for the Sound Map',
          content: 'The main goal of this is to create a platform for the everyday person and use this to make seen the visible (or audible) changes in the location region due to climate change. Providing a voice for everyone'
        },
        {
          title: 'Our Reason',
          content: 'In the Chesapeake Bay region, rising sea levels present a range of critical issues, including erosion, flooding, saltwater contamination, and habitat destruction, and more intense storms to name a few. The soundmap will allow us to see these changes over-time.'
        },
        {
          title: 'Want To Know More?',
          content: 'Below you can see the tabs for our FAQs page and our contact us page if you want to know more directly from us'
        }
      ]
    };
  },
  methods: {
    // Allows the user to pull up a page
    navigateTo (route) {
      this.$router.push(route);
    },
  },
  components: {
    // FAQs,
    // ContactUs,
  },
  router: new VueRouter({
    routes: [
      { path: '/', component: AboutUs },
      { path: '/faqs', component: FAQs }, // Route for FAQs page
      { path: '/contact', component: ContactUs }, // Route for Contact Us page
    ],
  }),
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

