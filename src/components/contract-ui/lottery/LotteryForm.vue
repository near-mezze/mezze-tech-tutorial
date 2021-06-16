<template>
  <div>
    <v-card>
      <strong>Directions: {{explainLottery}}</strong>
    </v-card>
    <div>
      <v-card>
        <strong>Winning Number: {{winNumber}}</strong>
      </v-card>
      
      <v-card>
        <strong>Winner: {{getWinner}}</strong>
      </v-card>

      <v-card>
        <strong>Current Fee: {{getFee}}</strong>
      </v-card>

      <v-card>
        <strong>Current Pot: {{getPot}}</strong>
      </v-card>

      <v-card>
        <strong>Player 1: {{players[0].value}}</strong> 
      </v-card>

      <v-card v-for="(player, idx) in players" v-if="idx > 0" :key="idx">
         <strong>Player {{idx + 1}}: {{player.value}}</strong> 
      </v-card>
    </div>

    <v-card class="pa-6 mb-4">
      <v-btn class="me-2 mb-6" elevation="3" @click="nearLogin">Login to NEAR to Play</v-btn>
      <h3 class="text-center">Lottery - Smart Contract</h3>
      <v-form ref="form" class="demo-form mt-4" v-model="valid" lazy-validation>
        <v-container class="mt-6 mb-14 d-flex pa-2 flex-column">
          <div>
            <v-text-field
              label="Add Player"
              v-model.lazy="players"
              :rules="playerNameRules"
            ></v-text-field>
          </div>
    

          <v-slider
            class="mt-8"
            v-model="wager"
            max="5"
            min="0"
            label="Wager"
            :track-color="'blue'"
            thumb-label="always"
          ></v-slider>

        <!-- set fee strategy -->
          <div v-if="isOwner">
            <v-select
              :value="strategies[3]"
              :items="strategies"
              label="Fee Strategy"
            ></v-select>
          
            <!-- set odds -->
            <v-text-field
              label="Set Odds"
              v-model.number="setOdds"
              max="100"
              min="0"
            ></v-text-field>
          </div>

          <div>
            <v-btn
            class="me-2"
              elevation="2"
              @click="playLottery"
            >{{lotteryState}}</v-btn>
            <v-btn
              elevation="2"
              @click="clear"
            >Clear</v-btn>
          </div>
        </v-container>
      </v-form>
      <!-- <v-expand-transition>
        <div v-if="success" style="background: #40b883;" class="pa-4 mt-2">
          <h4 class="text-center" style="color: #fff;">Message Sent Successfully</h4>
        </div>
      </v-expand-transition> -->
    </v-card>

  </div>
</template>

<script>
  import initContract from './near-lottery-connect.js'

  export default {
    data: () => ({
      near: {
        contract: null,
        currentUser: null,
        config: null,
        wallet: null
      },
      players: []
      feeStrategies: ['Free', 'Constant', 'Linear', 'Exponential']
      winNumber: null,
      lotteryState: 'Play Lottery', // Play Again
      success: false,
      valid: true,
      wager: 0,
    }),
    computed: {
      isOwner() {
        return this.near.currentUser === this.near.contract.get_owner()
      },
      getWinner() {
        return this.near.contract.get_winner() || No Winner yet!
      },
      getFee() {
        return this.near.contract.get_fee()
      },
      getFeeStrategy() {
        return this.near.contract.get_fee_strategy()

      },
      getPot() {
        return this.near.contract.get_pot()
      },
      explainLottery() {
        return this.near.contract.explain_lottery()
      },
      getPlayer1() {
        return this.near.currentUser
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
          this.players = [{value: currentUser}]
          // this.senderName = this.near.currentUser.accountId
        })
      }
    },
    methods: {
      nearLogin() {
        this.near.wallet.requestSignIn(
          this.near.config.contractName,
          'Lottery'
        );

      },
      setOdds() {
        // Contract.configure_lottery({chance: string})
      },
      setFee() {
        // Contract.configure_fee({strategy: Number})
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
