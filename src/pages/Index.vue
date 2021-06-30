<template>
  <div>
    <nav class="jump-to">
      <v-btn
        class="me-2"
        elevation="2"
        x-small
        @click="scrollMeTo('tutorials')">
        Jump To Tutorials
      </v-btn>
    </nav>
    <Layout :sidebar="false">
      <div class="content">
        <h1>{{ this.description }}</h1>
        <!-- add Getting Started content here -->
        <getting-started></getting-started>
        <h3 class="mb-4">TUTORIALS</h3>
        <hr/>
        <nav ref="tutorials" class="mt-10">
          <Shortcut v-for="{node} in $static.near.edges" :key="node.slug" :link="'/' + node.slug" :title="node.title" :text="node.description" icon="near-logo" />
        </nav>
        <GitLink class="git" size="large" />
      </div>
    </Layout>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
  near: allNear {
    edges {
      node {
        title,
        slug,
        description,
      }
    }
  }
}
</static-query>

<script>
import GitLink from '~/components/GitLink.vue'
import Shortcut from '~/components/Shortcut.vue'
import GettingStarted from '~/components/GettingStarted.vue'

export default {
  components: {
    GitLink,
    Shortcut,
    GettingStarted
  },
  data() {
    return {
      description: 'Amazing tutorials to help you build on the NEAR Protocol'
    }
  },
  methods: {
    scrollMeTo(refName) {
        var element = this.$refs[refName];
        var top = element.offsetTop;

        window.scrollTo(0, top);
    }
  },
  metaInfo() {
    return {
      title: this.description,
      meta: [
        { key: 'description', name: 'description', content: 'A mezze of knowledge for tech enthusiasts.' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>

  .content {
    display: flex;
    flex-direction: column;
    margin-left: 10rem;
  }

  h1 {
    text-align: center;
    max-width: 600px;
    margin: 1.5em auto 1.5em;

    @include respond-above(md) {
      max-width: 1000px;
    }
  }

  h2 {
    font-size: 1.4rem;
    margin: 0;
  }

  nav {
    display: flex;
    justify-content: center;
    flex-direction: column;

    @include respond-above(sm) {
      flex-direction: row-reverse;
    }
  }

  .git {
    margin: 3em 0 0;
    align-self: center;

    @include respond-above(md) {
      margin: 5em 0 0;
    }
  }
  
  .jump-to {
    position: fixed;
    left: 2rem;
    top: 6rem;
    z-index: 100;
  }

</style>
