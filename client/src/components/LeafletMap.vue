<template>
  <div :id="mapId">
    <!-- <Sidebar :popups="popups" :map="mapInstance"/> -->
  </div>
</template>

<script>
import L from 'leaflet';
import Api from '../services/Api';
// import Sidebar from './Sidebar.vue';

const CoordinatesControl = L.Control.extend({
  onAdd: function (map) {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
    container.style.backgroundColor = 'white';
    container.style.padding = '5px';
    container.style.marginRight = '10px';
    container.innerHTML = 'Center: ' + map.getCenter().lat.toFixed(4) + ', ' + map.getCenter().lng.toFixed(4);
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
    // Sidebar,
  },
  data() {
    return {
      mapId: 'leaflet-map',
      mapOptions: {
        center: L.latLng(36.88546327183475, -76.30592151771837),
        zoom: 10,
        zoomControl: true,
        zoomAnimation: true,
        maxBounds: L.latLngBounds(
          L.latLng(-90, -180), L.latLng(90, 180)
        ),
        layers: [],
      },
      markers: [],
      geojsonData: null,
      mapInstance: null,
      layerControlInstance: null,
      coordinatesControl: null,
      centerMarker: null,
    };
  },
  methods: {
    // Initialize map function:
    initMap() {
      // Create the leaflet map
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
      // set inital view
      views.OpenStreetMap.addTo(leafletMap);
      // Create the layer control and add it to the map:
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
        // Add event listeners to the map:
      leafletMap.on('move', () => {
        const center = leafletMap.getCenter();
        this.centerMarker.setLatLng(center);
        this.coordinatesControl.getContainer().innerHTML = 'Center: ' + center.lat.toFixed(4) + ', ' + center.lng.toFixed(4);
      });

      /**
       * @typedef {Object} FileData
       * @property {string} _id
       * @property {string} filename
       * @property {string} contentType
       * @property {Date} uploadDate
       * @property {number} length
       * @property {number} chunkSize
       * @property {Object} metadata
       * @property {string} metadata.title
       * @property {string} metadata.description
       * @property {string} metadata.latitude
       * @property {string} metadata.longitude
       * @property {string} metadata.tags
       */

      Api().get('uploads/filedata/all')
        .then((response) => {
          /** @type {FileData[]} */
          const data = response.data;
          this.markers = data.map((item) => {
            const { latitude, longitude, title, description } = item.metadata;
            const marker = L.marker([Number(latitude), Number(longitude)]).addTo(leafletMap);
            marker.bindPopup(`
              <h2>Upload Info</h2><br>
              <span>Title: ${title}</span><br>
              <span>Description: ${description}</span><br>
            `);
            return marker;
          });
        });
      this.mapInstance = leafletMap;
    },
  },
  mounted() {
    this.initMap();
  },
  destroyed() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  },
  watch: {
  },
};
</script>

<style>
@import "leaflet/dist/leaflet.css";
#leaflet-map {
  height: 86vh;
  width: 100%;
  overflow: hidden;
}
.leaflet-control-layers-list {
  text-align: left;
}
</style>