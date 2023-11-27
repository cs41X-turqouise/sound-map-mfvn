<template>
  <div v-if="store.state.user" class="InboxPage">
    <v-toolbar border>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search in mail"
        single-line
        hide-details
        clearable
        rounded
        variant="outlined"
      ></v-text-field>
      <v-spacer></v-spacer>
      <UserMenu></UserMenu>
    </v-toolbar>
    <v-table>
      <template v-slot:top>
        <v-toolbar density="comfortable" style="padding: 0 16px;">
          <v-toolbar-items>
            <v-checkbox v-model="selectAll" label="Select All">
            </v-checkbox>
            <v-spacer></v-spacer>
            <v-btn
              v-if="!selectedMessages.length"
              icon
              @click="refresh()"
            >
              <v-tooltip
                activator="parent"
                location="bottom"
                style="z-index: 9999;"
              >
                Refresh
              </v-tooltip>
              <v-icon>mdi-refresh</v-icon>
            </v-btn>

            <v-btn
              v-if="selectedMessages.length"
              icon
              @click="toggleReadStatuses(selectedMessages, true)"
            >
              <v-tooltip
                activator="parent"
                location="bottom"
                style="z-index: 9999;"
              >
                Mark as Read
              </v-tooltip>
              <v-icon>mdi-email-open</v-icon>
            </v-btn>

            <v-btn
              v-if="selectedMessages.length"
              icon
              @click="toggleReadStatuses(selectedMessages, false)"
            >
              <v-tooltip
                activator="parent"
                location="bottom"
                style="z-index: 9999;"
              >
                Mark as Unread
              </v-tooltip>
              <v-icon>mdi-email-mark-as-unread</v-icon>
            </v-btn>

            <v-btn
              v-if="selectedMessages.length"
              icon
              @click="deleteMessages(selectedMessages)"
            >
              <v-tooltip
                activator="parent"
                location="bottom"
                style="z-index: 9999;"
              >
                Delete
              </v-tooltip>
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
      </template>
      <thead>
        <tr>
          <th></th>
          <th>Sender</th>
          <th>Title</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in filteredMessages"
          :key="index"
          dark
          :class="{ unread: !item.read }"
          @click="openMessage(item)"
        >
          <td>
            <v-checkbox
              v-model="selectedMessages"
              :value="item"
              :input-value="item"
              hide-details
              @click.stop
            ></v-checkbox>
          </td>
          <td>{{ item.sender.username }}</td>
          <td>{{ item.title }}</td>
          <td>
            {{
              new Date(item.date).toLocaleDateString() === today.toLocaleDateString()
                ? new Date(item.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                : new Date(item.date).toLocaleDateString()
            }}
          </td>
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
    const today = new Date();
    return { store, today };
  },
  data () {
    return {
      dialog: false,
      selectedMessage: null,
      search: '',
      selectAll: false,
      selectedOption: 'all',
      selectedMessages: [],
    };
  },
  computed: {
    /** @returns {Message[]} */
    messages () {
      return this.store.state.user.inbox;
    },
    /** @returns {Message[]} */
    filteredMessages () {
      let messages = (() => {
        switch (this.selectedOption) {
        case 'read':
          return this.messages.filter((message) => message.read);
        case 'unread':
          return this.messages.filter((message) => !message.read);
        case 'all':
        default:
          return this.messages;
        }
      })();
      if (this.search) {
        messages = messages.filter((message) => {
          return message.title.toLowerCase().includes(this.search.toLowerCase())
            || message.message.toLowerCase().includes(this.search.toLowerCase())
            || message.sender.username.toLowerCase().includes(this.search.toLowerCase());
        });
      }
      return [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
  },
  watch: {
    selectAll (newVal) {
      if (newVal) {
        this.selectedMessages = this.store.state.user.inbox.slice();
      } else {
        this.selectedMessages = [];
      }
    },
  },
  methods: {
    refresh () {
      this.store.dispatch('fetchUser');
    },
    /** @param {Message} message */
    openMessage (message) {
      console.log('openMessage', message);
      this.selectedMessage = message;
      this.dialog = true;
      if (!message.read) {
        this.toggleReadStatus(message, true);
      }
    },
    /**
     * @param {Message} message
     * @param {boolean} read
     */
    async toggleReadStatus (message, read) {
      try {
        const userId = this.store.state.user._id;
        const updated = await Api().patch(`users/${userId}/inbox/${message._id}`, { read });
        if (updated) {
          this.store.commit('toggleReadInboxMessage', { message: message, read: read });
        }
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {Message[]} message */
    async toggleReadStatuses (messages, read) {
      try {
        const userId = this.store.state.user._id;
        const ids = messages.map((message) => message._id);
        await Api().patch(`users/${userId}/inbox/toggleAll`, { read, messages: ids });
        for (const message of messages) {
          this.store.commit('toggleReadInboxMessage', { message: message, read: read });
        }
        this.selectedMessages = [];
        this.selectAll = false;
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {Message} message */
    async deleteMessage (message) {
      try {
        const userId = this.store.state.user._id;
        const deleted = await Api().delete(`users/${userId}/inbox/${message._id}`);
        if (deleted) {
          this.store.commit('removeInboxMessage', message);
        }
      } catch (err) {
        console.error(err);
      }
    },
    /** @param {Message[]} message */
    async deleteMessages (messages) {
      try {
        const userId = this.store.state.user._id;
        for (const message of messages) {
          try {
            await Api().delete(`users/${userId}/inbox/${message._id}`);
            this.store.commit('removeInboxMessage', message);
          } catch (err) {
            console.error(err);
          }
        }
        this.selectedMessages = [];
        this.selectAll = false;
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style scoped>
.InboxPage {
  padding: 10px;
  border-radius: 4px;
  width: 99%;
  box-sizing: border-box;
}

table {
  width: 100%;
  table-layout: fixed;
}

th, td {
  width: 25%;
  text-align: left;
  padding: 8px;
}

th:first-child, td:first-child {
  width: 5%;
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

.unread {
  background-color: #f2f2f2;
  /* box-shadow: 0 0 10px rgba(0,0,0,0.2); */
}
</style>
