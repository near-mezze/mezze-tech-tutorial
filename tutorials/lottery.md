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

<strong>Rust</strong>

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

<strong>Class Contract</strong>

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

<strong>Class Lottery</strong>

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

If you aren't to sure about `u32` or `f64`, let's imagine the lottery picks a random number between 1 and 100. This would mean that according to line 15, if our roll is less than or equal to 20 we win. 

<strong>Class FeeStrategy</strong>

Moving ont to the `FeeStrategies`, paste the following into `fee-strategies.ts`

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












