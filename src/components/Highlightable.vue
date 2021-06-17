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
        <!-- <github-icon size="1.5x" class="custom-class"></github-icon> -->
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">
          <path fill="#000000" d="M18.5,1.15C17.97,1.15 17.46,1.34 17.07,1.73L11.26,7.55L16.91,13.2L22.73,7.39C23.5,6.61 23.5,5.35 22.73,4.56L19.89,1.73C19.5,1.34 19,1.15 18.5,1.15M10.3,8.5L4.34,14.46C3.56,15.24 3.56,16.5 4.36,17.31C3.14,18.54 1.9,19.77 0.67,21H6.33L7.19,20.14C7.97,20.9 9.22,20.89 10,20.12L15.95,14.16"/>
           <text>COMMENT</text>
        </svg>
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
      this.x = topMid
      this.y = selectedBound.y + window.scrollY - 110
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
  fill: #1199ff;
}

.item:hover {
  color: #1199ff;
}

.item + .item {
  margin-left: 10px;
}
</style>