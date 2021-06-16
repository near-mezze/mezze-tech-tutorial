<template>
  <v-card class="pa-6 mb-4">
    <v-btn class="me-2 mb-6" elevation="3" @click="nearLogin">Login to Call Contract</v-btn>
    <h3 class="text-center">Thanks - Smart Contract</h3>
    <v-form ref="form" class="demo-form mt-4" v-model="valid" lazy-validation>
      <v-container class="mt-6 mb-14 d-flex pa-2 flex-column">
        <v-text-field
          label="Contract Account Id"
          v-model="contractName"
          required
          :rules="contractNameRules"
        ></v-text-field>

        <v-switch
          v-model="isAnon"
          :label="`Send Anonymously: ${isAnon}`"
        ></v-switch>
        <v-expand-transition>
          <v-text-field
            v-if="!isAnon"
            label="Your Account Id"
            v-model="senderName"
            :rules="senderNameRules"
          ></v-text-field>
        </v-expand-transition>
    
        <v-text-field
          v-model="message"
          label="Message"
          clearable
          required
          :rules="messageRules"
        ></v-text-field>

        <v-slider
          class="mt-8"
          v-model="donation"
          max="5"
          min="0"
          label="Donation"
          :track-color="'blue'"
          thumb-label="always"
        ></v-slider>
    
        <div>
          <v-btn
          class="me-2"
            elevation="2"
            @click="submitForm"
          >Send Thank You Message</v-btn>
          <v-btn
            elevation="2"
            @click="clear"
          >Clear</v-btn>
        </div>
      </v-container>
    </v-form>
    <v-expand-transition>
      <div v-if="success" style="background: #40b883;" class="pa-4 mt-2">
        <h4 class="text-center" style="color: #fff;">Message Sent Successfully</h4>
      </div>
    </v-expand-transition>
  </v-card>
</template>



<script>
  import initContract from './near-thanks-connect.js'

  export default {
    data: () => ({
      near: {
        contract: null,
        currentUser: null,
        config: null,
        wallet: null
      },
      success: false,
      valid: true,
      contractName: '',
      contractNameRules: [
        v => !!v || 'Contract Name is required',
      ],
      isAnon: false,
      senderName: '',
      senderNameRules: [
        v => !!v || 'Sender Name is required',
      ],
      message: '',
      messageRules: [
        v => !!v || 'Message is required',
        v => (v && v.length <= 100) || 'Message must be fewer than 100 characters'
      ],
      donation: 0,
    }),
    computed: {
      isVisible() {
        return this.isAnon
      }
    },
    created() {
      if(process.isClient) {
        window.nearInitPromise = initContract()
        .then(({ contract, currentUser, nearConfig, walletConnection }) => {
          this.near.contract = contract
          this.near.currentUser = currentUser
          this.near.config = nearConfig
          this.near.wallet = walletConnection
          this.contractName = this.near.config.contractName
          // this.senderName = this.near.currentUser.accountId
        })
      }
    },
    methods: {
      nearLogin() {
        this.near.wallet.requestSignIn(
          this.near.config.contractName,
          'Thanks'
        );

      },
      clear () {
        this.$refs.form.reset()
        this.success = false
      },
      submitForm () {
        this.$refs.form.validate()
        const isValid = this.$refs.form.validate()
        if (isValid) {
          this.near.contract.say({
            message: this.message,
            anonymous: (this.isAnon ? true : false)
          },
          300000000000000,
          this.donation
          )
        }
        this.success = true
        const success = this.success
        setTimeout(() => {
          this.success = false
          this.clear()
        }, 3000);

      },
    }
  }

</script>
