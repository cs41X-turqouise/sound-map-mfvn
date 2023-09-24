<template>
  <div>
    <header>
      <h1 id="page-title">Sound Map for a Changing Landscape</h1>
      <figure>
        <router-link to="/">
          <img src="../assets/globe-icon.png" height="50" width="50">
          <figcaption>Home</figcaption>
        </router-link>
      </figure>
    </header>
    <main>
      <div id="profile">
        <div id="profile-header">
          <img id="profile-avatar" src="../assets/default-avatar.png" alt="Profile Avatar">
          <h2 id="profile-username">Username</h2>
        </div>
        <div id="profile-content">
          <h3>Uploaded Content</h3>
          <ul id="uploaded-content-list">
            <li v-for="(item, index) in uploadedContent" :key="index">{{ item }}</li>
          </ul>
          <h3>Bookmarked Content</h3>
          <ul id="bookmarked-content-list">
            <li v-for="(item, index) in bookmarkedContent" :key="index">{{ item }}</li>
          </ul>
        </div>
        <form @submit.prevent="uploadSound">
          <input type="text" name="sound-file" placeholder="Sound File" v-model="soundFile">
          <input type="submit" value="Upload">
        </form>
        <audio controls ref="audio">
          <source :src="audioSrc" type="audio/mpeg">
        </audio>
      </div>
    </main>
    <footer>
      <p>&copy; 2023 Sound Map for a Changing Landscape</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      uploadedContent: ["Item 1", "Item 2", "Item 3"],
      bookmarkedContent: ["Item 1", "Item 2", "Item 3"],
      soundFile: "",
      audioSrc: "",
    };
  },
  methods: {
    uploadSound() {
      fetch(`/api/file/${this.soundFile}`)
        .then((response) => response.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.audioSrc = objectUrl;
          this.$refs.audio.play();
        });
    },
  },
};
</script>

<style scoped>
header a {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 10px;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
  text-decoration: none;
  color: black;
}

header a:hover {
  background-color: black;
  color: white;
}

#profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
}

#profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
}

#profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

#profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#uploaded-content-list,
#bookmarked-content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#uploaded-content-list li,
#bookmarked-content-list li {
  margin-bottom: 10px;
}
</style>