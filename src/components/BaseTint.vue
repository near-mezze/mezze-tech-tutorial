<template>
  <div class="tint" @click.self="close">
    <slot />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        open: true
      }
    },
    methods: {
      close() {
        this.$emit('close')
      }
    },
    mounted() {
      this.open = true
    }
  };
</script>

<style scoped>
  .tint {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9;
    background: rgba(0,0,0,.7);
  }
</style>