<template>
  <div class="about">
    <h1>This is an about page</h1>

    <iframe
      src="https://cs41x-turqouise.github.io/team-website/"
      frameborder="1"
      style="width: 100vw; height: 90vh;">
    </iframe>  <section class="project-description">
      <h2>Project Overview</h2>
      <p>
        The Sound Map Prototype is an innovative project that combines the beauty of maps with the magic of sound. Our mission is to create an immersive experience that allows users to explore the world through soundscapes.
      </p>
    </section>

    <section class="goals">
      <h2>Our Goals</h2>
      <ul>
        <li>Create a captivating and educational tool for exploring the world's acoustic diversity.</li>
        <li>Empower users to discover unique sounds and their geographical origins.</li>
        <li>Highlight the importance of preserving acoustic environments and biodiversity.</li>
      </ul>
    </section>

    <section class="how-it-works">
      <h2>How It Works</h2>
      <p>
        Our sound map prototype is designed to provide an interactive and user-friendly interface. Users can navigate a map, click on markers, and listen to sound recordings from various locations around the globe. Each sound is accompanied by information about its source, including its cultural and ecological significance.
      </p>
    </section>

    <section class="team">
      <h2>Meet the Team</h2>
      <p>
        We are a passionate team of developers, sound enthusiasts, and environmentalists dedicated to bringing this project to life. Our diverse backgrounds and shared commitment to environmental awareness drive our efforts to make the world's sonic tapestry accessible to all.
      </p>
    </section>

    <section class="contact">
      <h2>Contact Us</h2>
      <p>
        If you have questions, suggestions, or would like to collaborate with us, we'd love to hear from you! Feel free to reach out to us via email or social media.
      </p>
  </div>
</template>

<script>
export default {
  name: "About",
};
</script>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
} 
</style>
