<template>
  <v-app fullscreen style="width:100vw">
    <v-main>
      <v-container fluid style="padding: 0; height: 100%">
        <router-view></router-view>
      </v-container>
    </v-main>
    <PageFooter></PageFooter>
  </v-app>
</template>

<script>
import PageFooter from './components/PageFooter.vue';

/**
 * @typedef {Object} MetadataSchema
 * @property {{ _id: string, username: string }} [creator] - The user who uploaded the file.
 * @property {string} [title]
 * @property {string} [description]
 * @property {string[]} [tags]
 * @property {string} [latitude]
 * @property {string} [longitude]
 * @property {string} [geodata]
 */

/**
 * @typedef {Object} UploadSchema
 * @property {string} _id - MongoDB ObjectId
 * @property {number} length
 * @property {number} chunkSize
 * @property {string} uploadDate - date-time format
 * @property {string} filename
 * @property {string} contentType
 * @property {MetadataSchema} metadata
 * @property {string[]} images - Array of MongoDB ObjectId
 * @property {boolean} visible - Whether the upload is visible to other users.
 * @property {string} approvedBy - UserID as a MongoDB ObjectId
 */

/**
 * @typedef {Object} UserSchema
 * @property {string} _id - MongoDB ObjectId
 * @property {string} username
 * @property {string} fullname
 * @property {string} email - Email format
 * @property {string} gid - Google ID
 * @property {string[] | UploadSchema[]} uploads - Array of MongoDB ObjectId or UploadSchema
 * @property {string[]} bookmarks - Array of MongoDB ObjectId
 * @property {string} role - 'user' | 'moderator' | 'admin'
 * @property {boolean} banned
 */

/**
 * @typedef {Object} ReportSchema
 * @property {string} _id - The MongoDB ObjectId of the document.
 * @property {string} reporter - The MongoDB ObjectId of the user who created the report.
 * @property {string} fileId - The MongoDB ObjectId of the upload being reported.
 * @property {string} reason - The reason for the report.
 * @property {Date} date - The date the report was created.
 */

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
  /* background-color: cyan; */
  /* background-color: lightblue; */
  background-color: lightsteelblue;
}
</style>
<style scoped>
.v-main{
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  * {
    font-size: small;
  }
}
@media (max-width: 970px) {
  * {
    font-size: x-small;
  }
}
@media (max-width: 800px) {
  * {
    font-size: xx-small;
  }
}
</style>
