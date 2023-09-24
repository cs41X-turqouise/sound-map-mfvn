<template>
  <div id="sidebar" class="sidebar">
    <button id="sidebar-close" class="sidebar-close">&times;</button>
    <ul id="popup-list" class="popup-list">
      <li v-for="popup in popups" :key="popup.id">
        <b class="name">{{ popup.title }}</b> (<span class="distance">{{ popup.distance.toFixed(2) }}</span> m)<br>
        Date: <span class="date">{{ popup.date.toLocaleDateString() }}</span><br>
        <div class="sound-bar">
          <audio class="audio" controls>
            <source :src="popup.file instanceof File ? URL.createObjectURL(popup.file) : popup.file" :type="`audio/${popup.fileType}`">
          </audio>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    popups: {
      type: Array,
      default: () => [],
    },
    map: {
      type: Object,
      default: null,
    },
  },
  methods: {
    createListItem(list, popup) {
      if (!popup) return;
      const distance = popup?.distance?.toFixed(2) || 0;

      const listItem = document.createElement("li");
      listItem.innerHTML =
        `<b class="name">${popup.title}</b> (<span class="distance">${distance}</span> m)<br>` +
        `Date: <span class="date">${popup.date?.toLocaleDateString()}</span><br>` +
        `Artist: <span class="artist">${popup.artist}</span><br>` +
        `Description:` +
        `<div class="description-container">` +
        `<p class="description">${popup.description}</p>` +
        `</div>` +
        (popup.image
          ? Array.isArray(popup.image)
            ? `<div class="slideshow-container"></div>`
            : `<img class="image" src=${popup.image}><br>`
          : "") +
        `Tags: <span class="tags">${popup.tags}</span><br>` +
        `<div class="sound-bar" data-file="${popup.file}">` +
        `<audio class="audio" controls>` +
        `<source src="" type="audio/*">` +
        `</audio>` +
        `</div>`;
      list.appendChild(listItem);

      if (popup.image && Array.isArray(popup.image)) {
        const slideshowContainer = listItem.querySelector(".slideshow-container");
        let currentSlide = 0;
        const prev = document.createElement("a");
        prev.innerHTML = "&#10094;";
        prev.classList.add("prev");
        prev.onclick = (e) => {
          e.stopPropagation();
          const slides = slideshowContainer.querySelectorAll(".slide");
          currentSlide === 0
            ? (currentSlide = slides.length - 1)
            : currentSlide--;
          slides.forEach((slide, index) => {
            slide.style.display = index === currentSlide ? "block" : "none";
          });
        };
        const next = document.createElement("a");
        next.innerHTML = "&#10095;";
        next.classList.add("next");
        next.onclick = (e) => {
          e.stopPropagation();
          const slides = slideshowContainer.querySelectorAll(".slide");
          currentSlide === slides.length - 1
            ? (currentSlide = 0)
            : currentSlide++;
          slides.forEach((slide, index) => {
            slide.style.display = index === currentSlide ? "block" : "none";
          });
        };
        slideshowContainer.appendChild(prev);
        slideshowContainer.appendChild(next);
        popup.image.forEach((image, index) => {
          const slide = document.createElement("div");
          slide.classList.add("slide");
          slide.id = `slide-${index}`;
          slide.style.display = index === 0 ? "block" : "none";

          const img = document.createElement("img");
          img.classList.add("image");
          img.src = image;
          slide.appendChild(img);
          slideshowContainer.appendChild(slide);
        });
      }

      const soundBar = listItem.querySelector(".sound-bar");
      const audio = new Audio(
        popup.file instanceof File ? URL.createObjectURL(popup.file) : popup.file
      );
      const audioBar = soundBar.querySelector("audio");
      const audioSource = audioBar.querySelector("source");
      audioSource.type = `audio/${popup.fileType}`;
      audioSource.src = audio.src;

      listItem.addEventListener("click", () => {
        this.map.setView(popup.latlng, 10);
        const activeListItem = list.querySelector(".active");
        if (activeListItem) activeListItem.classList.remove("active");
        listItem.classList.add("active");
      });
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  background-color: #f9f9f9;
  width: 100%;
  height: 0;
  overflow: hidden;
  transition: height 0.5s ease;
}

.sidebar-close {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 36px;
  margin-right: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.popup-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.popup-list li {
  padding: 8px 16px;
  text-decoration: none;
  display: block;
}

.popup-list li:hover {
  background-color: #f1f1f1;
}

.sound-bar {
  margin-top: 10px;
}
</style>