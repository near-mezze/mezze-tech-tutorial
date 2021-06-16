<template>
  <div>
    <v-card class="pt-3">
      <h2 class="text-center my-6">Lottery - Smart Contract</h2>
  
    <div v-if="near.contract">
   
      <v-card class="d-flex flex-column align-center">
        <p class="v-text-field"><strong>Directions: <span class="txt-green">{{odds}}</span></strong></p>

        <p class="v-text-field"><strong>Winner: <span class="txt-green">{{winnerInfo}}</span></strong></p>

        <p class="v-text-field"><strong>Current Fee: <span class="txt-green">{{currentFee}}</span></strong></p>

        <p class="v-text-field"><strong>Current Pot: <span class="txt-green">{{currentPot}}</span></strong></p>

        <p class="v-text-field"><strong>Current Player: <span class="txt-green">{{players[0].value.accountId}}</span></strong></p> 
      </v-card>
    </div>

      <v-card class="pa-6 mb-4">
        <v-btn class="me-2 mb-6" v-if="!near.currentUser" elevation="3" @click="nearLogin">Login to NEAR to Play</v-btn>

        <v-form ref="form" class="demo-form mt-4" v-model="valid" lazy-validation>
          <v-container class="mt-6 mb-14 d-flex pa-2 flex-column">
      
            <v-slider
              class="mt-8 wager"
              v-model="wager"
              max="5"
              min="0"
              label="Wager"
              :track-color="'blue'"
              thumb-label="always"
            ></v-slider>

            <div class="mx-auto">
              <v-btn
                v-if="isActive"
                class="me-2"
                elevation="2"
                @click="playLottery"
              >Play Lottery</v-btn>
              <v-btn
                v-if="isOwner"
                class="me-2"
                elevation="2"
                @click="resetDrawing"
              >Reset Drawing</v-btn>
            </div>
          </v-container>
        </v-form>
        <v-card>
          <div style="background: #40b883;" class="pa-4 mt-2">
            <h4 class="text-center" style="color: #fff;">Winner:<span class="ml-4">{{currentWinner}}</span></h4>
          </div>
        </v-card>
      </v-card>
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
        currentBalance: null,
        config: null,
        wallet: null
      },
      playerNameRules: [
        v => !!v || 'Player required',
        // v => v.indexOf('testnet') == -1 || 'Must be a testnet account',
      ],
      isActive: false,
      feeStrategies: ['Free', 'Constant', 'Linear', 'Exponential'],
      winNumber: null,
      lotteryState: 'Play Lottery', // Play Again
      success: false,
      valid: true,
      wager: 0,
      odds: null,
      winnerInfo: null,
      currentFee: null,
      currentPot: null,
      contractOwner: null
    }),
    computed: {
      isOwner() {
        return this.near.currentUser === this.contractOwner
      },
      getPlayer1() {
        return this.near.currentUser
      },
      currentWinner() {
        if (this.winnerInfo === this.currentUser)  return 'YOU WON!!!'
        return this.winnerInfo
      }
    },
    watch: {
      currentFee() {
        if (this.currentFee === '0 NEAR') this.currentFee = 'FREE'
      }
    },
    async created() {
      if(process.isClient) {
        window.nearInitPromise = await initContract()
          .then(({ contract, currentUser, nearConfig, walletConnection }) => {
            this.near.contract = contract
            this.near.currentUser = currentUser.accountId
            this.near.currentBalance = currentUser.balance
            this.near.config = nearConfig
            this.near.wallet = walletConnection
            this.players = [{value: currentUser}]
    
          }).then(async () =>{
            this.isActive = await this.near.contract.get_active({})
            this.winnerInfo = await this.near.contract.get_winner({}) || 'No Winner Yet!'
            // const fee = await this.near.contract.get_fee({}) 
            // fee == '0 NEAR' ? 'FREE!' : fee
            this.currentFee = await this.near.contract.get_fee({}) 
            // this.currentFee = fee
            this.currentPot = await this.near.contract.get_pot({})
            this.contractOwner = await this.near.contract.get_owner({})
            this.odds = await this.near.contract.explain_lottery({})
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
      clear() {
        this.$refs.form.reset()
        this.success = false
      },
      async resetDrawing() {
        const reset = await this.near.contract.reset()
        console.log('reset ', reset)
      },
      async playLottery(player = this.currentUser) {
        this.$refs.form.validate()
        const isValid = this.$refs.form.validate()
        if (isValid) {
          const lotteryDrawResult = await this.near.contract.play(
            {}, 
            300000000000000, 
            this.wager)
          console.log('lotteryDrawResult ',lotteryDrawResult)
        }
        this.success = true
        const success = this.success
        setTimeout(() => {
          this.success = false
          // this.clear()
        }, 3000);

      },
    }
  }

</script>

<style scoped>

  .playerBtn {
    width: 38%;
  }

  .txt-green {
    color: #40b883;
  }

  .wager {
    width: 60%;
    margin: auto;
  }

</style>