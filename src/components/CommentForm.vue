<template>
  <v-card class="pa-6 mb-4 comment-card" :dark="isDark">
    <h3 class="text-center">NEAR Tutorials</h3>
    <v-form ref="form" class="demo-form mt-4" v-model="valid" lazy-validation>
      <v-container class="mt-6 mb-14 d-flex pa-2 flex-column">
        <v-text-field
          label="Your Github UserName"
          v-model="userName"
          required
          :rules="userNameRules"
        ></v-text-field>
  
        <v-textarea
          filled
          v-model="comment"
          label="Comment"
          :auto-grow="true"
          clearable
          required
          :rules="commentRules"
          :rows=3
        ></v-textarea>
    
        <div>
          <v-btn
            class="me-2"
            elevation="2"
            @click="postComment"
          >Post Comment</v-btn>
          <v-btn
            class="me-2"
            elevation="2"
            @click="clear"
          >Clear</v-btn>
        </div>
      </v-container>
    </v-form>
    <v-expand-transition>
      <div v-if="success" style="background: #40b883;" class="success-message">
        <h4 class="text-center" style="color: #fff;">Comment Successfully Posted to Github</h4>
        <pre>
          {{commentBody}}
        </pre>
      </div>
    </v-expand-transition>
  </v-card>
</template>



<script>
  import { Octokit } from "@octokit/rest"

  const octokit = new Octokit({
    auth: process.env.GRIDSOME_GITHUB_TOKEN,
  });

  export default {
    props: ['page', 'selected'],
    data: () => ({
      success: false,
      valid: true,
      userName: null,
      userNameRules: [
        v => !!v || 'Name is required',
      ],
      // email: 'test@test.com',
      comment: '',
      commentRules: [
        v => !!v || 'Comment is required'
      ],
    }),
    created() {
      this.userName = this.$store.userName || ''
    },
    computed: {
      isDark() {
        return this.$vuetify.theme.dark
      },
      commentBody() {
        const issue = 
        `Page: ${this.page} 
         -------------------------------------
         ${this.userName}
         -------------------------------------
         SELECTED TEXT: ${this.selected}
         -------------------------------------
         COMMENT: ${this.comment}`

         return issue
      }
    },
    methods: {
      clear() {
        this.$refs.form.reset()
        this.success = false
      },
      postComment() {
        
        this.$refs.form.validate()
        const isValid = this.$refs.form.validate()
        if (isValid) {
          octokit.rest.issues.createComment({
            owner: 'near-mezze',
            repo: 'mezze-tech-tutorial',
            issue_number: '4',
            body: this.commentBody  
          }).then(res => {
            this.success = true
            setTimeout(() => {
              this.success = false
              this.clear()
              this.$parent.$emit('posted')
            }, 3000);
          })
        }
      },
    }
  }

</script>

<style scoped>

  .comment-card {
    margin: auto;
    max-width: 90%;
    /* background: #eee; */
    border-radius: 10px;
    padding: 27px;
    z-index: 2;
  }

  .comment-card button {
    margin-left: .5rem;
    margin-right: .5rem;
  }

  @media screen and (min-width: 650px) {
    .comment-card {
      min-width: 550px;
      max-width: 50%;
    }
  }

  .success-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items:center;
    overflow: auto;
  }

  .success-message h4 {
    line-height: 5rem;
  }
</style>