<template>
  <v-card class="pa-6 mb-4">
    <h3 class="text-center">Thanks - Smart Contract</h3>
    <v-form ref="form" class="demo-form mt-4" v-model="valid" lazy-validation>
      <v-container class="mt-6 mb-14 d-flex pa-2 flex-column">
        <v-text-field
          label="Your Name"
          v-model="userName"
          required
          :rules="userNameRules"
        ></v-text-field>
    
        <v-text-field
          v-model="comment"
          label="Comment"
          clearable
          required
          :rules="commentRules"
        ></v-text-field>
    
        <div>
          <v-btn
          class="me-2"
            elevation="2"
            @click="postComment"
          >Post Comment</v-btn>
          <v-btn
            elevation="2"
            @click="clear"
          >Clear</v-btn>
        </div>
      </v-container>
    </v-form>
    <v-expand-transition>
      <div v-if="success" style="background: #40b883;" class="pa-4 mt-2">
        <h4 class="text-center" style="color: #fff;">Comment Successfully Posted to Github</h4>
      </div>
    </v-expand-transition>
  </v-card>
</template>



<script>
  
  export default {
    data: () => ({
      success: false,
      valid: true,
      userName: '',
      userNameRules: [
        v => !!v || 'Name is required',
      ],
      comment: '',
      commentRules: [
        v => !!v || 'Comment is required'
      ],
    }),
    created() {
      this.userName = this.$store.userName
    },
    methods: {
      clear () {
        this.$refs.form.reset()
        this.success = false
      },
      postComment () {
        const fields = {

        }
        fields.fields = {
          name: this.userName,
          message: this.message
        }
        this.$refs.form.validate()
        const isValid = this.$refs.form.validate()
        if (isValid) {
          this.$store.commit('setUserName', this.userName)
          this.axios.post('https://near-mezze.herokuapp.com/v2/entry/github/near-mezze/thanks-tutorial/master', fields).then((response) => {
            console.log(response.data)
          }).then(res => {
            this.success = true
            setTimeout(() => {
              this.success = false
              this.clear()
              this.$emit('posted')
            }, 3000);
          })
        }


      },
    }
  }

</script>
