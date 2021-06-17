// https://medium.com/free-code-camp/how-to-create-a-medium-like-highlight-menu-in-vue-dc515f2dddef
<template>
  <div ref="content" class="highlightable">
    <div
      v-show="showTools"
      class="tools"
      :style="{
        left: `${x}px`,
        top: `${y}px`
      }"
      @mousedown.prevent=""
    >
      <span
        class="item"
        @click.prevent="handleAction('highlight')"
      >
        <github-icon size="1.5x" class="custom-class"></github-icon>
        <strong class="ml-2">COMMENT</strong>
      </span>
    </div>
    <slot/>
  </div>
</template>


<script>
export default {
  data () {
    return {
      x: 0,
      y: 0,
      showTools: false,
      selectedText: '',
    }
  },

  computed: {
    parentBounding() {
      return this.$refs.content.getBoundingClientRect()
    }
  },

  mounted () {
    this.$refs.content.addEventListener('mouseup', this.onMouseup)
  },

  beforeDestroy () {
    this.$refs.content.removeEventListener('mouseup', this.onMouseup)
  },
  methods: {
    onMouseup () {
      const selection = window.getSelection()
      const parentBound = this.parentBounding
      const selectedBound = selection.getRangeAt(0).getBoundingClientRect()
      const relativeBound = {
        x:(selectedBound.x - parentBound.x), 
        y:(selectedBound.y - parentBound.y),
        left:(selectedBound.left - parentBound.left), 
        right:(selectedBound.right - parentBound.right)
      }
      // don't show tools unless meaningful amount of text is selected
      if (!selectedBound.width || selectedBound.width < 20) {
        this.showTools = false
        this.handleAction('dismiss')
        return
      }
      const topMid = relativeBound.x + (selectedBound.width/2)
      console.log(selectedBound)
      console.log(parentBound)
      console.log(relativeBound)

      this.x = topMid
      this.y = selectedBound.y + window.scrollY - 270
      this.showTools = true
      this.selectedText = selection.toString()
    },

    handleAction (action) {
      this.showTools = false
      this.$emit(action, this.selectedText)
    }
  }
}
</script>

<style scoped>

.highlightable {
  position: relative;
}

p {
  line-height: 1.5rem;
}

.tools {
  height: 38px;
  padding: 5px 10px 3px;
  background: #333;
  border-radius: 3px;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  transform: translate(-50%, -100%);
  transition: 0.2s all;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tools:after{
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #333;
}

.item {
  display:flex;
  color: #FFF;
  cursor: pointer;
}

.item path {
  fill: #FFF;
}

.item:hover path {
  fill: #10c186;
}

.item:hover {
  color: #10c186;
}

.item + .item {
  margin-left: 10px;
}
</style>