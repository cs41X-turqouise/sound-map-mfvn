<template>
  <div :id="mapId">
    <SidePanel
      v-if="showPanel"
      :markers="markers"
      :map="mapInstance"
      :clicked="clicked"
      @focusMarker="focusMarker"
      @close="showPanel = false">
    </SidePanel>
    <Transition name="fade">
      <div
        v-if="showModal"
        :class="{ 'click-modal': true, highlight: highlight }"
        @click.stop>
        <CloseButton @close="showModal = false"/>
        <span>Latitude: {{ clicked.lat.toFixed(4) }}</span><br>
        <span>Longitude: {{ clicked.lng.toFixed(4) }}</span><br>
        <v-row style="justify-content: space-evenly; align-items: center;">
          <v-col cols="auto" @click.stop>
            <v-btn
              color="info"
              size="small"
              density="comfortable"
              @click.stop="togglePinPanel">
              {{ showPanel ? 'Hide' : 'Show'}} Panel
            </v-btn>
            <v-btn
              v-if="$store.state.user"
              color="info"
              size="small"
              density="comfortable"
              @click.stop="openUploadModal">
              Upload
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </Transition>
  </div>
</template>

<script>
// TODO: Redo using Vue 3 Composition API
import { useStore } from 'vuex';
import L from 'leaflet';
import SidePanel from './SidePanel.vue';
import CloseButton from './CloseButton.vue';

const CoordinatesControl = L.Control.extend({
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = 'white';
    container.style.padding = '5px';
    container.style.marginRight = '10px';
    const center = map.getCenter();
    container.innerHTML = `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | Zoom: ${map.getZoom()}`;
    return container;
  }
});
const myIcon = L.icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});
export default {
  name: 'LeafletMap',
  components: {
    SidePanel,
    CloseButton,
  },
  data () {
    return {
      mapId: 'leaflet-map',
      /** @type {import("leaflet").MapOptions} */
      mapOptions: {
        center: L.latLng(36.88546327183475, -76.30592151771837),
        zoom: 10,
        minZoom: 2,
        zoomControl: true,
        zoomAnimation: true,
        doubleClickZoom: false,
        trackResize: true,
        worldCopyJump: true,
        maxBounds: L.latLngBounds(
          L.latLng(-90, -180), L.latLng(90, 180)
        ),
        layers: [],
      },
      markers: [],
      mapInstance: null,
      layerControlInstance: null,
      coordinatesControl: null,
      centerMarker: null,
      currentPopup: null,
      clicked: null,
      showPanel: false,
      showModal: false,
      highlight: false,
    };
  },
  setup () {
    const store = useStore();
    return { store };
  },
  methods: {
    initMap () {
      const leafletMap = L.map(this.mapId, this.mapOptions);
      leafletMap.zoomControl.setPosition('bottomright');
      // L.control.locate({ position: 'bottomright' }).addTo(leafletMap);
      /** @type {Record<string, L.TileLayer>}*/
      const views = {
        OpenStreetMap: (new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })),
        MapBox: (new L.TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: 'pk.eyJ1IjoidGhlYmd1eSIsImEiOiJjbGpmNnpiZ3QyZDR5M2luNXU2anJsbXp3In0.UP5wSUCUx2mm9j_A2ganfQ'
        })),
        GISSatellite: (new L.TileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18,
        })),
        Wikipedia: (new L.TileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
          attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
          minZoom: 1,
          maxZoom: 19,
        })),
        GoogleSatellite: (new L.TileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })),
        GoogleTerrain: (new L.TileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })),
        GoogleHybrid: (new L.TileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        })),
      };
      views.OpenStreetMap.addTo(leafletMap);
      this.layerControlInstance = L.control
        .layers(views, null, { position: 'bottomleft' })
        .addTo(leafletMap);
      this.coordinatesControl = new CoordinatesControl()
        .setPosition('topleft')
        .addTo(leafletMap);
      this.centerMarker = new L.Marker(
        leafletMap.getCenter(),
        { icon: myIcon }
      ).addTo(leafletMap);

      // Add event listeners
      leafletMap.on('move', () => {
        const center = leafletMap.getCenter();
        this.centerMarker.setLatLng(center);
        this.coordinatesControl.getContainer().innerHTML = `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | Zoom: ${leafletMap.getZoom()}`;
      });
      leafletMap.on('zoomstart', () => {
        if (this.currentPopup) {
          this.currentPopup.remove();
        }
        this.currentPopup = null;
      });
      leafletMap.on('click', (event) => {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        this.clicked = { lat, lng, latlng: event.latlng };
        this.store.dispatch('setClicked', { lat, lng });
        if (this.showModal) {
          this.highlight = true;
          setTimeout(() => {
            this.highlight = false;
          }, 1000);
        }
        this.showModal = true;
      });
      this.mapInstance = leafletMap;

      // Add markers
      if (this.store.state.files.size) {
        for (const file of this.store.state.files.values()) {
          try {
            const marker = this.createMarker(file);
            this.markers.push(marker);
          } catch (error) {
            console.log('Failed to create marker for ', file);
            console.error(error);
          }
        }
      }
    },
    openUploadModal () {
      this.showPanel = false;
      this.$emit('openUploadModal');
    },
    togglePinPanel () {
      this.showPanel = !this.showPanel;
      if (this.showPanel) {
        this.$emit('closeUploadModal');
      }
    },
    focusMarker (marker) {
      this.mapInstance.flyTo(marker.getLatLng(), 15);
      marker.openPopup();
    },
    createMarker (file) {
      const { latitude, longitude, title, description } = file.metadata;
      const marker = L.marker([latitude, longitude]).addTo(this.mapInstance);
      marker.bindPopup(`
        <h2>Upload Info</h2><br>
        <span>Title: ${title}</span><br>
        <span>Description: ${description}</span><br>
      `);
      marker.data = file;
      return marker;
    },
  },
  created () {
    this.$watch(() => this.store.state.files, (newValue, oldValue) => {
      for (const file of newValue.values()) {
        if (this.markers.some((marker) => marker.data._id === file._id)) {
          continue;
        }
        const marker = this.createMarker(file);
        this.markers.push(marker);
      }
    });
  },
  mounted () {
    this.initMap();
  },
  unmounted () {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  },
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
#leaflet-map {
  height: 100%;
  width: 100%;
  right: 5px;
}
.leaflet-control-layers-list {
  text-align: left;
  flex: 1;
}
.leaflet-control-attribution, .leaflet-control-scale-line {
  padding: 0px 15px 0px 0px;
}
.click-modal {
  position: absolute;
  top: 1em;
  right: 2em;
  min-width: 150px;
  padding: 0.5em;
  text-align: left;
  z-index: 9999;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
@keyframes highlight {
  0% { background-color: white; }
  50% { background-color: yellow; }
  100% { background-color: white; }
}

.highlight {
  animation: highlight 0.5s;
}
</style>
