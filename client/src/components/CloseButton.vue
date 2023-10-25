<template>
  <span class="close" @click="close">&times;</span>
</template>

<script>
export default {
  name: 'CloseButton',
  methods: {
    close () {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.close {
  color: #aaa;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0 10px;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
