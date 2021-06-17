<template>
  <div class="tint" @click.self="close">
    <slot @posted="close"/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        open: true
      }
    },
    created() {
      this.$on('posted', () =>{
        this.close()
      })
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
    display: flex;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9;
    background: rgba(0,0,0,.7);
  }
</style>