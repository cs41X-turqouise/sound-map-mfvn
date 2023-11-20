<template>
  <div>
    <v-toolbar>
      <v-text-field
        append-icon="mdi-magnify"
        label="Search in mail"
        single-line
        hide-details
        rounded
        variant="outlined"
      ></v-text-field>
      <v-spacer></v-spacer>
      <UserMenu></UserMenu>
    </v-toolbar>
    <v-table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>Sender</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in store.state.user.inbox" :key="index" @click="openMessage(item)">
          <td>{{ new Date(item.date).toLocaleDateString() }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.sender }}</td>
          <td>
            <v-btn icon flat density="comfortable" @click.stop="deleteMessage(item)">
              <v-tooltip
                activator="parent"
                location="bottom"
                style="z-index: 9999;"
              >
                Delete
              </v-tooltip>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ selectedMessage.title }}</v-card-title>
        <v-card-text>{{ selectedMessage.message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Api from '../services/Api';
import UserMenu from '../components/UserMenu.vue';

/**
 * @typedef {Object} Message
 * @property {string} _id
 * @property {Date} date
 * @property {string} title
 * @property {string} message
 * @property {string} sender
 * @property {boolean} read
 */

export default {
  name: 'InboxPage',
  components: {
    UserMenu,
  },
  setup () {
    const store = useStore();
    return { store };
  },
  data () {
    return {
      dialog: false,
      selectedMessage: null,
    };
  },
  methods: {
    /** @param {Message} message */
    async deleteMessage (message) {
      try {
        const deleted = await Api().delete(`users/${this.store.state.user._id}/inbox/${message._id}`);
        if (deleted) {
          this.store.commit('removeInboxMessage', message);
        }
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {Message} message */
    openMessage (message) {
      console.log('openMessage', message);
      this.selectedMessage = message;
      this.dialog = true;
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  table-layout: fixed;
}

th, td {
  width: 25%;
  text-align: left;
  padding: 8px;
}

/* tr:nth-child(even) {
  background-color: #f2f2f2;
} */

tr:hover {
  background-color: #ddd;
  cursor: pointer;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}
</style>
