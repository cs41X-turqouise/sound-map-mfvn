<template>
  <div class="modal" v-if="show">
    <div class="modal-content" :style="modalStyle">
      <CloseButton @close="close" />
      <slot></slot>
    </div>
  </div>
</template>

<script>
import CloseButton from './CloseButton.vue';
export default {
  name: 'CenterModal',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    modalStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    CloseButton,
  },
  emits: ['close'],
  methods: {
    close () {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: auto;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
}

.modal-content {
  background-color: #fefefe;
  margin: 1% 1%;
  padding: 20px;
  border: 1px solid #888;
  width: 50vw;
  max-width: 600px;
  max-height: 90vh;
}

@media screen and (max-width: 900px) {
  .modal-content {
    font-size: x-small;
  }
}
</style>
