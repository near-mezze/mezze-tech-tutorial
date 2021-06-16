---
title: Lottery
slug: lottery
---

<blockquote class="lesson mt-6">
  <strong>Build the Thanks Smart Contract</span></strong><br><br>

  - time to complete: **80 mins**
  - level of difficulty: **moderate**
  - prerequisites
    - Thanks tutorial
      - basic Javascript
      - basic Bash
      - basic Git
      - NEAR.testnet account

</blockquote>


## Overview

This tutorial assumes you have completed the <a href="/thanks">Thanks Tutorial</a>, so there wont' be as much stuff about local setup, _call_ vs _view_ functions, etc.

What we _will_ take a closer look at using this tutorial is Testing. In _Thanks_, we build Unit Tests. _Lottery_ will also have Unit Tests, but will also have Simulation Tests. 

Whether you build your Smart Contracts in _WebAssembly_ or _Rust_, simulation tests _must_ be written in _Rust_. Learn more about [Rust](https://www.rust-lang.org/) and building [Simulation Tests on NEAR](https://github.com/near-examples/simulation-testing)

Unit Tests are great for checking edge cases when calling your Smart Contract. They don't need you to compile your code into a `wasm`, nor do they need to tap into NEAR _testnet_ or any network for that matter. However, Unit tests are unable to call other contracts (cross-contract calls), so if your contract sends or requests funds from another contract, for instance, you won't be able to use a Unit Test to check that it works. This is where Simulation Testing comes in.

Simulation Tests _do_ require a `wasm` file that are built using the `cargo build` command. The build is then deployed to a simulation chain giving it the ability to simulate cross-contract calls.

## Local Setup




<!-- TODO: omit any simulation/Rust stuff from here and from the repo if not using -->






There is a repo of this project with several branches. The first branch, `getting-started`, is the bare bones project. It will have all of the files we need, but most of them will be empty. The others you will find are:

1. `getting-started`
2. `functions/empty` & `functions/solution`
3. `testing/empty` & `testing/solution`
4. `scripts/empty` & `scripts/solution`

<br/>

<h3>Clone The Repo</h3>

Clone the repository below or run this command:

```bash
$ git clone git clone git@github.com:near-mezze/sample--lottery.git project-name
$ cd project-name
# run scripts in package.json with "yarn <script name>" or "npm run <script name>"
```

<h3 class="mt-10 mb-4">Rust</h3>

Simulation tests must be written in _Rust_, but you can still use _Rust_ even if your code is already written in _AssemblyScript_. 

You simply need to add it to your project.

Check if _Rust_ is installed with `rustc --version`.

To install _Rust_:

```bash
  $ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Now you can use the _Rust_ command `cargo` to run your simulation tests.


Now switch to the `getting-started` branch.

<h3>File Structure</h3>

```
  sample--lottery
  ┣ simulation/
  ┃ ┣ src/
  ┃ ┣ Cargo.toml
  ┃ ┗ README.md
  ┣ src/
  ┃ ┣ lottery/
  ┃ ┣ as-pect.d.ts
  ┃ ┣ as_types.d.ts
  ┃ ┣ tsconfig.json
  ┃ ┗ utils.ts
  ┣ target/
  ┃ ┣ debug/
  ┃ ┣ .rustc_info.json
  ┃ ┗ CACHEDIR.TAG
  ┣ .gitignore
  ┣ Cargo.lock
  ┣ Cargo.toml
  ┣ README.md
  ┣ as-pect.config.js
  ┣ asconfig.json
  ┣ package.json
  ┗ yarn.lock
```

This is pretty much what your folder structure will look like if you used the
 <nobr><span class="code-emphasis inline-block">create-near-app</span></nobr> command.

The main folders we will be using is:

`/lottery/`

This is where we will be writing all our contract code and Unit Tests. If you are in the <nobr><span class="code-emphasis inline-block">getting-started</span></nobr> branch, you should see that a few of the `.ts` files are empty. Don't worry. We will be filling these files back up with code in no time.

## Let's Start Coding!

Open your `src/lottery/assembly/index.ts` file, and paste the following at the top of the page:

<h3 class="mt-10 mb-4">Class Contract</h3>

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>src/lottery/assembly/index.ts</code></v-expansion-panel-header>
<v-expansion-panel-content class="language-typescript">

```typescript{numberLines: true}{noInlineHighlight:true}
import { logging, Context, u128, ContractPromiseBatch, PersistentSet } from "near-sdk-as";

import { AccountId, ONE_NEAR, asNEAR, XCC_GAS } from "../../utils";

import { FeeStrategy, StrategyType } from "./fee-strategies";
import { Lottery } from "./lottery";

@nearBindgen
export class Contract {

  private owner: AccountId;
  private winner: AccountId;
  private last_played: AccountId;
  private active: bool = true;
  private pot: u128 = ONE_NEAR;
  private fee_strategy: FeeStrategy = new FeeStrategy();
  private lottery: Lottery = new Lottery();
  private players: PersistentSet<AccountId> = new PersistentSet<AccountId>("p");

  constructor(owner: AccountId) {
    this.owner = owner;
  };

   // --------------------------------------------------------------------------
   // Public VIEW methods
   // --------------------------------------------------------------------------

  get_owner(): AccountId {
    return this.owner;
  }

  get_winner(): AccountId {
    return this.winner;
  }

  get_pot(): string {
    return asNEAR(this.pot) + " NEAR";
  }

  get_fee(): string {
    return asNEAR(this.fee()) + " NEAR";
  }

  get_fee_strategy(): StrategyType {
    return this.fee_strategy.strategy
  }

  get_has_played(player: AccountId): bool {
    return this.players.has(player);
  }

  get_last_played(): AccountId {
    return this.last_played;
  }

  get_active(): bool {
    return this.active;
  }

  explain_fees(): string {
    return FeeStrategy.explain()
  }

  explain_lottery(): string {
    return this.lottery.explain()
  }

  // --------------------------------------------------------------------------
  // Public CHANGE methods
  // --------------------------------------------------------------------------

  /**
   * "Pay to play"
   *
   * First time is free to play and you may win!
   *
   * If you've already played once then any other play costs you a fee.
   * This fee is calculated as 1 NEAR X the square of the total number of unique players
   */
  @mutateState()
  play(): void {
    assert(this.active, this.winner + " won " + this.pot.toString() + ". Please reset the game.");
    const signer = Context.sender;

    // if you've played before then you have to pay extra
    if (this.players.has(signer)) {
      const fee = this.fee();
      assert(Context.attachedDeposit >= fee, this.generate_fee_message(fee));
      this.increase_pot();

      // if it's your first time then you may win for the price of gas
    } else {
      this.players.add(signer);
    }

    this.last_played = signer;

    if (this.won()) {
      this.winner = signer;
      this.payout();
    } else {
      this.lose();
    }
  }

  @mutateState()
  configure_lottery(chance: string): bool {
    this.assert_self();
    this.lottery.configure(<f32>parseFloat(chance));
    return true;
  }

  @mutateState()
  configure_fee(strategy: StrategyType): bool {
    this.assert_self();
    this.fee_strategy = new FeeStrategy(strategy);
    return true;
  }

  @mutateState()
  reset(): void {
    this.assert_self();
    this.players.clear();
    this.winner = "";
    this.last_played = "";
    this.pot = ONE_NEAR;
    this.active = true;
  }

  // this method is only here for the promise callback,
  // it should never be called directly
  @mutateState()
  on_payout_complete(): void {
    this.assert_self();
    this.active = false;
    logging.log("game over.");
  }

  // --------------------------------------------------------------------------
  // Private methods
  // --------------------------------------------------------------------------

  private fee(): u128 {
    return this.fee_strategy.calculate_fee(this.players.size, ONE_NEAR);
  }

  private increase_pot(): void {
    this.pot = u128.add(this.pot, Context.attachedDeposit);
  }

  private won(): bool {
    return this.lottery.play()
  }

  private lose(): void {
    logging.log(this.last_played + " did not win.  The pot is currently " + this.get_pot());
  }

  private payout(): void {
    logging.log(this.winner + " won " + this.get_pot() + "!");

    if (this.winner.length > 0) {
      const to_winner = ContractPromiseBatch.create(this.winner);
      const self = Context.contractName

      // transfer payout to winner
      to_winner.transfer(this.pot);

      // receive confirmation of payout before setting game to inactive
      to_winner.then(self).function_call("on_payout_complete", "{}", u128.Zero, XCC_GAS);
    }
  }

  private generate_fee_message(fee: u128): string {
    return ("There are " + this.players.size.toString()
      + " players. Playing more than once now costs " + asNEAR(fee)
      + " NEAR");
  }

  private assert_self(): void {
    const caller = Context.predecessor
    const self = Context.contractName
    assert(caller == self, "Only this contract may call itself");
  }
}

```

</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

Take a few minutes to review the code. 

Although it's almost 200 lines of code, there are only 4 _call_ functions we need to worry about:

- `play()`
- `configure_lottery()`
- `configure_fee()`
- `reset()`

The `play()` method evaluated whether the current player has played before, checks what the fee strategy with `fee`, which calls `FeeStrategies.calculate_fee()`, and runs the game with `won()`, which calls `Lottery.play()`:

```typescript{87, 98}{numberLines:80}
  @mutateState()
  play(): void {
    assert(this.active, this.winner + " won " + this.pot.toString() + ". Please reset the game.");
    const signer = Context.sender;

    // if you've played before then you have to pay extra
    if (this.players.has(signer)) {
      const fee = this.fee();
      assert(Context.attachedDeposit >= fee, this.generate_fee_message(fee));
      this.increase_pot();

      // if it's your first time then you may win for the price of gas
    } else {
      this.players.add(signer);
    }

    this.last_played = signer;

    if (this.won()) {
      this.winner = signer;
      this.payout();
    } else {
      this.lose();
    }
  }
  ```

So, we have our main Class calling two _other_ classes, `FeeStrategies` and `Lottery`, in order to run the lottery and check for winners.

Let's take a look at those classes.

<h3 class="mt-10 mb-4">Class Lottery</h3>

Paste the following into `src/lottery/assembly/lottery.ts`:

```typescript{numberLines:true}
import { logging, RNG } from "near-sdk-as";

@nearBindgen
export class Lottery {
  private chance: f64 = 0.20

  explain(): string {
    return "Players have a " + (this.chance * 100).toString() + "% chance of winning.";
  }

  play(): bool {
    const rng = new RNG<u32>(1, u32.MAX_VALUE);
    const roll = rng.next();
    logging.log("roll: " + roll.toString());
    return roll <= <u32>(<f64>u32.MAX_VALUE * this.chance);
  }

  configure(chance: f64): void {
    assert(chance >= 0.000000001 && chance <= 1, "Chance must be within range (0..1]");
    this.chance = chance;
    logging.log(this.explain());
  }
}
```

There's that `play()` method on line 11. It simply returns a random `u32` type integer between `1` and  `u32.MAX_VALUE` using the Random Number Generator, _RNG_, macro imported from `near-sdk-as`. 
 
The probability of winning is set to 20% (.20) on line 5.

Line 15 checks that the value returned by `rng` is within the lowest 20% of the set. If it is, then the player has won.

If you aren't to sure about `u32` or `f64`, let's imagine the lottery picks a random number between 1 and 100. This would mean that according to line 15, if our roll is less than or equal to 20, we win. 

<h3 class="mt-10 mb-4">Class FeeStrategy</h3>

Moving on to the `FeeStrategies`, paste the following into `fee-strategies.ts`

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>src/lottery/assembly/fee-strategies.ts</code></v-expansion-panel-header>
<v-expansion-panel-content class="language-typescript">

```typescript{numberLines: true}{noInlineHighlight:true}
import { env, logging, u128 } from "near-sdk-as";

export const enum StrategyType {
  Free = 0,
  Constant,
  Linear,
  Exponential,
}

@nearBindgen
export class FeeStrategy {
  constructor(
    public strategy: StrategyType = StrategyType.Exponential
  ) {
    this.assert_valid_fee_strategy(strategy);
  }

  static explain(): string {
    return "one of [ Free | Constant | Linear | Exponential ]";
  }

  // TODO: handle possible overflow for each strategy
  calculate_fee(scalar: u32, base: u128): u128 {
    let fee: u128 = u128.Zero;

    switch (this.strategy) {
      case StrategyType.Free:
        // fee is already zero
        break;
      case StrategyType.Constant:
        fee = this.calculate_constant(base);
        break;
      case StrategyType.Linear:
        fee = this.calculate_linear(scalar, base);
        break;
      case StrategyType.Exponential:
        fee = this.calculate_exponential(scalar, base);
        break;
      default:
        logging.log("Unexpected StrategyType encountered");
        env.panic();
    }
    return fee;
  }

  //---------------------------------------------------------------------------
  // FeeStrategy helper methods
  //---------------------------------------------------------------------------

  private calculate_constant(base: u128): u128 {
    return base;
  }

  private calculate_linear(scalar: number, base: u128): u128 {
    return u128.mul(base, u128.from(scalar));
  }

  private calculate_exponential(scalar: u32, base: u128): u128 {
    return u128.mul(base, u128.pow(u128.from(scalar), 2));
  }

  private assert_valid_fee_strategy(strategy: StrategyType): void {
    assert(this.isValidFeeStrategy(strategy), "Invalid FeeStrategy: " + strategy.toString());
  }

  private isValidFeeStrategy(s: i32): bool {
    switch (s) {
      case StrategyType.Free:
      case StrategyType.Constant:
      case StrategyType.Linear:
      case StrategyType.Exponential: return true;
      default: return false;
    }
  }
}
```
</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

`FeeStrategy` is a bit more complicated than the other classes we've seen so far. This class basically decides how much it will cost returning players to play. It can be, free, a set amount, or it can increase linearly or exponentially - yikes!

Hopefully, that has demystified this contract a bit. There's a lot going on, but the core logic is pretty simple once we break it down.

## Calling Functions

We are now ready to compile our code, and call our `play()` function from the terminal.

Run the following command:

```bash
$ yarn build:release
```

If you see an error, run `$ yarn` to make sure the project's dependencies have been installed locally.

Otherwise, you should see a new folder in your root directory called `build`. This contains a `wasm` file called `lottery.wasm`, which is how _AssemblyScript_ compiles all your code into a _WebAssembly_ binary format that is run in web browsers. It's unreadable, but you can create a readable `wat` file if you want to nerd out.  Learn more about [_WebAssembly_](https://webassembly.org/) and _AssemblyScript_'s [ asbuild](https://github.com/AssemblyScript/asbuild) CLI.

Now that we have our code compiled, we can use the NEAR CLI to deploy it. 

<pre class="language-bash">
  $ <span class="token function">near</span> dev-deploy ./build/release/lottery.wasm
</pre>

Note: if you do not specify the `./build/release/lottery.wasm` path in the above command, NEAR defaults to checking for `out/main.wasm` 

You should see another newly generated folder called `neardev`. This is a really cool feature of NEAR, where you can quickly create and use a _testnet_ account for your contract.  

<pre class="language-text">
  sample--lottery $ <span class="token function">near</span> dev-deploy ./build/release/lottery.wasm
  Starting deployment. <span class="code-emphasis">Account id: dev-1622755101091-2932922</span>, 
  node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org,
  file: ./build/release/lottery.wasm
  Transaction Id EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  To see the transaction in the transaction explorer, please open this url in your browser
  https://explorer.testnet.near.org/transactions/EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  Done deploying to dev-1622755101091-2932922
</pre>

The account for the contract above is `dev-1622755101091-2932922`, which NEAR generated and placed in a newly created `neardev` folder in your root folder. Yours will be slightly different as it's created with a random number and a timestamp. We will be referencing the account above in some of the examples coming up, but simply replace with the one _you_ were given. 

It's a bit confusing at first, but your contract is seen by NEAR as just another account; no different than your own _testnet_ account, except that this account has methods you can call on it. So let's call it!

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 play --accountId YOUR_OWN_TESTNET_ACCOUNT --amount $1                                
</pre>

You should see an `ExecutionError` about how the contract isn't initialized. If you try to initialize the contract more than once, you'll see a similar error thrown about that too. So, don't worry, NEAR CLI has got your back.

<h3 class="mt-10 mb-4">Calling Singleton Style Contracts</h3>

There are two patterns for writing Smart Contract code. We can write a bunch of functions and use `export` on the ones we want to use as _call_ or _view_ methods. 

The other option is creating Classes to wrap our methods. This "singleton" style allows us to better organize our code in a reusable, easy-to-read way. Who doesn't want that??  

The one caveat about using Classes for your Smart Contracts is that you need to initialize them once they are deployed. NEAR CLI will remind you if you don't.

Go ahead and run the following initialize the contract:

<pre class="language-bash">
  $ <span class="token function">near</span> call $CONTRACT_ACCOUNT init '{\"owner\":\"'$OWNER_ACCOUNT'\"}' --accountId $CONTRACT_ACCOUNT            
</pre>

If you're still seeing errors, try running `yarn clean` then run the following:

<pre class="language-bash">
  $ <span class="token function">near</span> login                 
</pre>

The above command should open a browser window to NEAR Explorer where you will be prompted to authorize this Contract.

Go ahead and try calling the `play()` command again. 

<pre class="language-bash">
  Scheduling a call: dev-1622755101091-2932922.play()
  Receipts: 3HuByfdNnoR7qQS8dnGJd2c3HbCFTd1rWwttzoJpHiyx, 2vvjf3HKvk1B5LfBhmzgUTr2AZ6zY5hMm5RdM7iz9C7B, 2Qc84FwbrhZJHCqd7ukPsfBeJH5P5aPTs451RG5HGPxA
          Log [dev-1622755101091-2932922]: roll: 627470933
          Log [dev-1622755101091-2932922]: near-mezze-player.testnet won 1 NEAR!
  Receipt: 5hqffsGSARcpaaa8kMzjWh4ohbfGWS3m9UKqY1h8EvXE
          Log [dev-1622755101091-2932922]: game over.
  Transaction Id 75SacpyqzKKpqhNjKaTbKrsoEM8KTWn05i43xWNp5oNi
  To see the transaction in the transaction explorer, please open this url in your browser
  https://explorer.testnet.near.org/transactions/  Transaction Id 75SacpyqzKKpqhNjKaTbKrsoEM8KTWn05i43xWNp5oNi
 <span class="code-emphasis inline-block>">''</span>
</pre>

So the player, `near-mezze-player.testnet` won 1 NEAR! That's great! I'm getting blockchain fever and the only prescription is more `play()` calls. Let's play again!

<pre class="language-bash">
  type: <span class="code-green">'FunctionCallError'</span>,
  context: undefined,
  index: 0,
  kind: {
    ExecutionError: <span class="code-green">'Smart contract panicked: near-mezze-player.testnet won 1000000000000000000000000. Please reset the game., filename: "src/lottery/assembly/index.ts" line: 66 col: 5'</span>
  },
</pre>

Wait wut?

Ok, So let's review how a lottery works. People buy tickets hoping the numbers they pick match those from the drawing. The drawing happens and either no one wins the pot, or someone wins the pot, or a few people win the pot. Then what?

Well, if one or more people win the pot then there is no pot to win. So, the drawing needs to be reset. That's what that error message is saying: 

```bash
'Smart contract panicked: near-mezze-player.testnet won 1000000000000000000000000. Please reset the game...`
```

Well, I guess we should reset it:

<pre class="language-bash">
  $ <span class="token function">near</span> $CONTRACT_ACCOUNT reset --account_id $CONTRACT_ACCOUNT                
</pre>

You shouldn't see a similar output as you did when you called `init`

Now let's try playing again! Did you win? I didn't :/

<pre class="language-bash">
  Scheduling a call: dev-1622755101091-2932922.play()
  Receipt: 3HuByfdNnoR7qQS8dnGJd2c3HbCFTd1rWwttzoJpHiyx
          Log [dev-1622755101091-2932922]: roll: 2213884438
          Log [dev-1622755101091-2932922]: near-mezze-player.testnet did not win. The pot is currently 1 NEAR
  Transaction Id BzZQav2dXQSEVbTzxZUZQsj2APSoGfEzHVgkBBCtqzoe
  To see the transaction in the transaction explorer, please open this url in your browser
  https://explorer.testnet.near.org/transactions/  Transaction Id BzZQav2dXQSEVbTzxZUZQsj2APSoGfEzHVgkBBCtqzoe
 <span class="code-emphasis inline-block>">''</span>
</pre>

Big Money! Big MOney! Big Money! Let's play again!!!

<pre class="language-bash">
  type: <span class="code-green">'FunctionCallError'</span>,
  context: undefined,
  index: 0,
  kind: {
    ExecutionError: <span class="code-green">'Smart contract panicked: There are 1 players. Playing more than once now costs 1 NEAR, filename: "src/lottery/assembly/index.ts" line: 70 col: 7'</span>
  },
</pre>

Aha! There's that `FeeStrategy` Class kicking in. Looks like playing the first time is free, and any subsequent plays costs 1 NEAR. This sounds like default behavior. Let's take a look at `FeeStrategy`

```ts
@nearBindgen
export class FeeStrategy {
  constructor(
    public strategy: StrategyType = StrategyType.Exponential
  ) {
    this.assert_valid_fee_strategy(strategy);
  }
```
Ah. There it is `public strategy: StrategyType = StrategyType.Exponential`

So we default to `Exponential` fee strategy. So, that means every subsequent play should cost the player exponentially more than before. But that doesn't make sense, because subsequent plays have all been 1 NEAR. Hmmm....

Let's take another look at `index.ts` where all this code is running.

```ts{numberLines:72}
  /**
   * "Pay to play"
   *
   * First time is free to play and you may win!
   *
   * If you've already played once then any other play costs you a fee.
   * This fee is calculated as 1 NEAR X the square of the total number of unique players
   */
```

There is in on line 78. Blessed be the Comments!

So the fee is based in part on the number of players. Let's add one!

Adding a new player is as simple as calling `play()` with a different _testnet_ account than the one you've been using. Since the first play is free, you can make one up. However, you will need this account to have some gas money if they continue playing.

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 play --accountId ANOTHER_TESTNET_ACCOUNT                                
</pre>

If you won then you should now have 1 NEAR to play with. Reset the game, and play with both accounts. At some point that `Exponential` fee strategy should rear its ugly neck:

<pre class="language-bash">
  type: <span class="code-green">'FunctionCallError'</span>,
  context: undefined,
  index: 0,
  kind: {
    ExecutionError: <span class="code-green">'Smart contract panicked: There are 2 players. Playing more than once now costs 4 NEAR, filename: "src/lottery/assembly/index.ts" line: 70 col: 7'</span>
  },
</pre>

Wow! Now _that's_ what I call Exponential!

Review the main Contract methods again. What are ways we can change how this game runs?

What if we wanted to increase our odds of winning? What method would fulfill that?

What if we wanted to keep it simple with the fee strategies? Go ahead and run that `configure_fee` method on your own. It might not be obvious, but to set the fee strategy, you will run:

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 configure_fee '{"strategy": 3}' --account_id dev-1622755101091-2932922
</pre>

As you can see, `strategy` takes an integer value of 0, 1, 2, or 3. These are mapped to the fee strategy types, `Free`, `Constant`, `Linear`, and `Exponential` respectively.


## Testing

There is a lot we can do from the terminal. We can play, reset, play again, and again, reset - forever. 

However we can be waaayyyy more efficient if we take all our imagined scenarios, and wrap them in Unit Tests. 

Switch to the `tests/unit/solution` branch of your repo. You should see all of the files in `_lottery/__tests__/` populated. Take a few moments to review the code.

Seems pretty similar to the files in the `assembly/` directory. We have files for each main class we use.

 - `index.unit.spec.ts` : _all of the main Contract methods we've been using so far_
 - `lottery.unit.spec.ts` : _those methods specific to the Lottery class_
 - `fee-strategies.unit.spec.ts` : _those methods specific to the Fee Strategy class_

You may wonder if the `Lottery` and `FeeStrategy` classes can be "called" like we've been doing thus far. 

Well, yes and no. When we compile, we tell _AssemblyScript_ to check the `assembly` folder for our contract. It first looks for an `index.ts` file (which we have), and uses that for the contract code while compiling everything else in the `assembly/` directory so as to make it available to the code in `index.ts`. 

There are several files where you can configure how _AssemblyScript_ compiles your code, and you can look at your `asconfig.json` files for clues about where it should look. [Learn more about how _AssemblyScript_ compiles your code](https://www.assemblyscript.org/compiler.html).

So that's the "No" part of the answer. The "Yes" part refers to Unit Testing. You can test anything you want, any function, any block of code, any file. You simply need to be specific when you call your tests.

This is in part due to how `as-pect` the _AssemblyScript_ testing library works. When you Unit Test your NEAR Smart Contracts, you don't need to connect to any network, you don't need the auto-generated _testnet_ account created by the `near dev-deploy` command. You don't even need to compile your code into a `wasm` file. 

To configure account `$OWNER`, etc., you import and use `VMContext` from `near-sdk-as`. That's how `Context` is set in the scope of each test you write. Take a look at where and how `VMContext` is being used in the `__tests__/` files.

You can run all the tests in `__tests__/` or individually.

To run them all use the command 

```bash
$ yarn test:unit
```

To run an individual file:

```bash
$ yarn asp -f index.unit

```

The terminal should output something like this:

<pre class="language-bash">
[Describe]: Contract

 <span class="code-green">[Success]</span>: ✔ can be initialized with owner
 <span class="code-green">[Success]</span>: ✔ is active when initialized

[Describe]: Contract interface for Lottery

 <span class="code-green">[Success]</span>: ✔ provides an explanation of the lottery
 <span class="code-green">[Success]</span>: ✔ provides a value for what a player may win
 <span class="code-green">[Success]</span>: ✔ allows a player to play
 <span class="code-green">[Success]</span>: ✔ provides access to most recent player
 <span class="code-green">[Success]</span>: ✔ confirms whether a player has played
 <span class="code-green">[Success]</span>: ✔ reports the winner of the lottery

[Describe]: Contract interface for Lottery Fees

 <span class="code-green">[Success]</span>: ✔ reports the current fee to play the lottery
 <span class="code-green">[Success]</span>: ✔ reports the fee strategy
 <span class="code-green">[Success]</span>: ✔ explains possible fee strategies
 <span class="code-green">[Success]</span>: ✔ adjusts the fee after 1 player

[Describe]: Contract interface for Lottery Management

 <span class="code-green">[Success]</span>: ✔ allows ONLY the owner to change the terms of the lottery
 <span class="code-green">[Success]</span>: ✔ adjusts the fee based on FeeStrategy
 <span class="code-green">[Success]</span>: ✔ allows ONLY the owner to reset the lottery

    [File]: src/lottery/__tests__/index.unit.spec.ts
  [Groups]: 5 pass, 5 total
  [Result]: ✔ PASS
[Snapshot]: 0 total, 0 added, 0 removed, 0 different
 [Summary]: 15 pass,  0 fail, 15 total
    [Time]: 133.988ms
</pre>

Now you can get really creative with the scenarios around this Smart Contract. Work from the existing code. 

Unit Tests are very semantic; almost pseudo-code. If you aren't inspired yet, simply check some of the `assert` methods found in the various functions in the `assembly/` directory. Just write some tests that trigger those. You can also refer to the the `__tests__/README.md` file.  [Learn more about writing Unit Tests in _AssemblyScript_](https://dev.to/jtenner/testing-with-assemblyscript-and-the-usefulness-of-value-3egn).


## Adding Scripts

We can automate our Smart Contract even more with some scripts. So, instead of running each _call_ or _view_ method from the terminal, we can place all of our executables in their own script files with as much commentary as we need. 

Switch to the  `scripts/solution` branch. If you completed the _Thanks_ tutorial (which you should have at this point) then you'll recall a neat demonstration using the terminal to call and "watch" how this Smart Contract executes. Let's jump into that now.

You will be monitoring your _testnet_ accounts used in this project by cloning this project:

```bash
$ git clone https://github.com/near-examples/near-account-utils
```

Navigate to the directory where your local copy of the repo exists. Follow the `README.md` to get familiar with the project. You will find it useful as you build more Smart Contracts.

This will just be a regurgitation of the `scripts/README.md` directions, so feel free to peace out and run the demonstration using that. 


In this demonstration, you will open five terminals; two in `near-account-utils/` directory, and three in `lottery/` directory. 


 - Terminal A (lottery directory): _controls and deploys the contract_
 - Terminal B (near-account-utils directory): _renders contract account storage_
 - Terminal C (near-account-utils directory): _renders contract state and keys_
 - Terminal D (lottery directory): _handles account state of Player 1_
 - Terminal E (lottery directory): _handles account state of Player 2_

So the way this works, is that you run the contract commands like before, but this time you set environmental variables, and run script files from the `scripts/` directory like so:

```bash
  # Terminal A
  lottery-directory: $ ./scripts/2.play.sh
```
The terminal will likely throw a few errors about undefined variables. You do so with this command:

```bash
  # Terminal A
  lottery-directory: $ export NAME_OF_VARIABLE=value
```
These are the variables we will be using:

- OWNER: _you_
- CONTRACT: _whatever the dev-deploy command generated_
- PLAYER: _update to player 1 or player 2 when switching players_
- FEE: _your wager_

Now open two new terminal windows in the `near-account-utils/`  directory and set your $CONTRACT env variable to the one generated by `near dev-deploy`:

```bash
  # Terminal B
  near-account-utils: $ export CONTRACT=dev-....
```

Now run this command:

```bash
  # Terminal B
  near-account-utils: $ watch -d -n 1 yarn storage $CONTRACT
```

Your Terminal B window should start going a little nuts and create a ascii table with information about the state of your Smart Contract.

Move to the other terminal window you opened, and set the `$CONTRACT` env variable the same way you just did in Terminal B.

<blockquote class="tip mb-4">
<h3><info-icon size="1. mr-45x" class="custom-class pt-2"></info-icon></info-icon>
What is a Terminal??</h3><br/>

<hr/>

Just in case you're a bit confused about some terminology, "terminal", is synonymous with "bash", "shell", or any program presenting the Command Line Interface (CLI). 

Bash is the language used in the CLI.

Files with the extension <span class="code-emphasis inline-block">.sh</span> tell your Command Line Interface to run them like any other command. 

<a href="https://tldp.org/LDP/Bash-Beginners-Guide/html/sect_02_01.html" target="_blank">Learn more about creating and running scripts in the Command Line Interface</a>.

</blockquote>

Now run this command:

```bash
  # Terminal C
  near-account-utils: $  watch -d -n 1 "near state $CONTRACT && echo && near keys $CONTRACT"
```

Terminal C should become ablaze with information regarding your Smart Contract's account id.

You now have 2 windows monitoring your Smart Contract's state.

Each terminal window has its own scope regardless if its running in the same directory as other termainals/shells. So, you can open 2 terminals and set $PLAYER to different values in each of those terminals, and each terminal window will only recognize the $PLAYER you set within it.

With that in mind, let's open two more terminals in our `lottery/` directory.

Set `$PLAYER` to player 1 in one terminal, and player 2 in the other terminal. 

```bash
  # Terminal D
  lottery-directory: $ export PLAYER=player-one.testnet
```

```bash
  # Terminal E
  lottery-directory: $ export PLAYER=player-two.testnet
```

Now run the following command in each of the new terminal windows:

```bash
  #Terminal D & Terminal E
  lottery-directory: $ watch -d -n 1 near state $PLAYER
```

I think we are ready! Run each of the scripts in `scripts/` directory just like you did with `2.play.sh`:

```bash
  # Terminal A
  lottery-directory: $ ./scripts/<script file>.sh
```

Look at each terminal window you have opened to see how the information changes in each one. 

## Summary

If you have made it this far, CONGRATULATIONS!!!

You have built a really simple (once you get to know it) Smart Contract that offers players a decent chance of winning some money!  

- You built multiple classes that feed into your Smart Contract to set rules for the game, like fee strategies and odds of winning.
- You wrote Unit Tests to handle edge cases and other scenarios.
- You dove into monitoring the state of contracts using scripts and env variables.
- You installed `near-account-utils` and learned how to use it to check state and storage use of your Smart Contract.
  
## What Next?

Definitely take some time to further explore the [Adding Scripts](#adding-scripts) section some more. Blockchain is not an easy concept to grasp, but tools like `near-account-utils` surface some of the inner workings for us. 

Time to delve into UI territory if you're feeling frisky. You can find the code for the _Lottery_ UI in the `components/conracts-ui/` folder.




