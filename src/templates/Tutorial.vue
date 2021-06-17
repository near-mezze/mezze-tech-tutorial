<template>
<div>
  <Layout>
    <h1>
      {{ $page.tutorial.title }}
    </h1>
    <div ref="content">
      <highlightable
        @highlight="onHighlight"
        @dismiss="onDismiss"
      >
        <VueRemarkContent/>
      </highlightable>
    </div>
  </Layout>
    <BaseTint v-if="showComment" @close="onDismiss">
      <comment-form :page="$page.tutorial.title" :selected="selected"></comment-form>
    </BaseTint>
    </div>
</template>

<page-query>
  query tutorial ($path: String!) {
    tutorial: tutorial (path: $path) {
      title
      path
      slug
      content
    }
  }
</page-query> 

<script>
import BaseTint from '~/components/BaseTint.vue'
import CommentForm from '~/components/CommentForm.vue'
export default {
  data() {
    return {
      showComment: false,
      selected: ''
    }
  },
  methods: {
    onHighlight(text) {
      this.showComment = true
      this.selected = text
    },
    onDismiss() {
      this.showComment = false
    }
  },
  components: {
    BaseTint,
    CommentForm
  },
  metaInfo() {
    return {
      title: this.$page.tutorial.title,
      meta: [
        {
          key: "description",
          name: "description",
          content: this.$page.tutorial.description,
        },
      ],
    };
  },
};
</script>


<style lang="scss" scoped>
/deep/ > p {
  opacity: 0.8;
}

/deep/ > h2 {
  margin-top: 5rem;
  margin-bottom: 1.5rem;

  @include respond-above(md) {
    font-size: 2rem;
  }
}

/deep/ > h3 {
  margin-top: 3rem;
  margin-bottom: 1.5rem;

  @include respond-above(md) {
    font-size: 1.5rem;
  }
}

/deep/ > p > img {
  max-width: 100%;
}

.markdown {
  padding-bottom: 50vh;
}

</style>
