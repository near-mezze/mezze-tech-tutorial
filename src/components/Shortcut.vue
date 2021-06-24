<template>
  <article>
    <h2>
      <g-link :to="link">
        <component :is="icon"></component>
        {{ text }}
      </g-link>
    </h2>
  </article>
</template>

<script>
import { PlayIcon, SlidersIcon, EyeIcon, CodeIcon } from 'vue-feather-icons'
import NearLogo from './NearLogo.vue'

export default {
  components: {
    PlayIcon,
    SlidersIcon,
    EyeIcon,
    CodeIcon,
    NearLogo
  },
  props: {
    link: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
article {
    flex: 1 0;
    max-width: 50%;
    border: 1px solid shade($sidebarBright, 10%);
    margin: 0 0 1em;
    background: $sidebarBright;
    padding: 2rem;
    border-radius: 3px;
    transition: background .15s ease-in-out, border-color .15s ease-in-out;

    @include respond-above(sm) {
      margin: 0 1em 0;
    }

    .dark & {
      border: 1px solid shade($sidebarDark, 10%);
      background: $sidebarDark;
    }
  }

a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .bright & {
    color: $textBright;
  }

  .dark & {
    color: $textDark;
  }

}

svg {
  width: 2em;
  height: 2em;
  margin-bottom: 1em;

  @include respond-above(md) {
    width: 3em;
    height: 3em;
  }

  .bright & {
    fill: $textBright;
  }

  .dark & {
    fill: $textDark;
  }
}
</style>