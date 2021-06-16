---
title: Thanks
slug: thanks
---

<blockquote class="lesson mt-6">
  <h3>Build the Thanks Smart Contract</span></h3><br><br>

  - time to complete: **80 mins**
  - level of difficulty: **moderate**
  - prerequisites
    - basic Javascript
    - basic Bash
    - basic Git
    - NEAR.testnet account

</blockquote>

## Overview

No. Seriously. Thanks! 

Actually, that's the name of the Smart Contract we will be building today, [Thanks](https://github.com/Learn-NEAR/sample--thanks), which allows users to say "thanks" to other users by calling _their_ instance of this contract. 

You can optionally attach tokens to your message, or even leave your message anonymously.

Of course keep in mind that your signing account will be visible on the blockchain via NEAR Explorer even if you send an anonymous message; It just will be omitted when the receiver calls certain _other_ functions on the contract. 

This is a simple demonstration of how smart contracts work, and how to call them.

We are going to use a mixture of functions and classes, then we will refactor everything into classes. Initially, the classes you will see basically allow us to organize data as if it was wrapped in an object literal. _TypeScript_ and _AssemblyScript_ are soooo hyper aware of how you organize your data structures, and they start to turn rabid if you want to simply assign an object to a variable:

```typescript
const myObject: object = {prop: "val"}
```

That looks simple, right? We declared a variable, signed a type `object` to it, and assigned an object literal as its value. NOOOO! Instead, you have to do this number:

```typescript
@nearBindgen
export class LongWindedWayOfCreatingASimpleObject {
  prop: string
  constructor(quest: string) {
    this.prop = val
  }
}
```

Then you can _finally_ use it similarly as before:

```typescript
const myObject = new LongWindedWayOfCreatingASimpleObject({val: "Geesh! All this for an object?!"});
```

Furthermore, you will have to continue to reference that class if you have an array that you intend to push it to. So, maybe use shorter names not born out of frustration.

Instead you must create a named class and assign it as the type you are using when declaring a variable. 

Throughout this tutorial, you will have the opportunity to engage with this contract as we build it together. 

Our calls to the contract will be through a command line interface like _Bash_ or _Terminal_.

However, if you desire to add a UI layer on top of this Smart Contract, you can see how that might work by navigation to the <a href="what-next">What Next?</a> section of this tutorial. The code for the UI below can be found in this tutorial's repo in 
`components/contract-ui/`. You can find more examples of Smart Contracts with UIs at [examples.near.org](https://examples.near.org/)

By the end of this tutorial, you will have a deeper understanding of how NEAR smart contracts are built, tested, deployed, and used. With that knowledge, you will be able to build your own decentralized applications, which you can share with the NEAR community!


## Local Setup

There is a repo of this project with several branches. The first branch, `getting-started`, is the bare bones project. It will have all of the files we need, but most of them will be empty. The others you will find are:

1. `getting-started`
2. `functions/empty` & `functions/solution`
3. `refactoring/empty` & `refactoring/solution`
4. `testing/empty` & `testing/solution`
5. `scripts/empty` & `scripts/solution`

<br/>

Do you see a pattern? The idea here is that each major section in this tutorial has a corresponding branch of the `sample--thanks` repo. We will be working with the `/solution` branches, and review the code in there, but you are always encouraged to use the `/empty` branches to build some of this logic on your own. 


Both `main` and `scripts/solution` will have the complete code. 

Alternatively, you can build everything from scratch using the terminal command:

<pre class="language-bash">
$ <span class="token function">near</span> create-near-app your-awesome-project
</pre>

and just use the file tree below for reference.

Otherwise, let's get started!

<h3>Clone The Repo</h3>

Clone the repository below or run this command:

```bash
$ git clone git clone git@github.com:near-mezze/sample--thanks.git project-name
$ cd project-name
# run scripts in package.json with "yarn <script name>" or "npm run <script name>"
```

>  <div class="tip"> <info-icon size="1.5x" class="custom-class mr-2 pt-1"></info-icon>If you're like me, and need a visual for what this Contract might look like with a UI, scroll down to the <a href="#what-next">What Next?</a> section to see a demo of Thanks with a simple UI layer. Code is in the repo of this tutorial in the 
> <span class="code-emphasis inline-block">contract-ui/</span> directory.
> </div>
<br/>

Now switch to the `getting-started` branch.


<h3>File Structure</h3>

```
sample--thanks/
┣ src/
┃ ┣ thanks/
┃ ┃ ┣ __tests__/
┃ ┃ ┃ ┣ README.md
┃ ┃ ┃ ┗ index.unit.spec.ts
┃ ┃ ┣ assembly/
┃ ┃ ┃ ┣ index.ts
┃ ┃ ┃ ┗ models.ts
┃ ┃ ┗ asconfig.json
┃ ┣ as-pect.d.ts
┃ ┣ as_types.d.ts
┃ ┣ tsconfig.json
┃ ┗ utils.ts
┣ .gitignore
┣ README.md
┣ as-pect.config.js
┣ asconfig.json
┣ package.json
┗ yarn.lock
```

This is pretty much what your folder structure will look like if you used the
 <nobr><span class="code-emphasis inline-block">create-near-app</span></nobr> command.

The main folders we will be using are:

`/thanks/__tests__/`

`/thanks/assembly/`

This is where we will be writing all our contract code and tests. If you are in the <nobr><span class="code-emphasis inline-block">getting-started</span></nobr> branch, you should see that a few of the `.ts` files are empty. Don't worry. We will be filling these files back up with code in no time.

Furthermore, we will be using a few constants we will set up in `src/utils.ts`.

That's pretty much it for a bird's eye view. Many of the files you see in the tree above like `asconfig.json` are used to declare how _AssemblyScript_ will be used, how _TypeScript_ will use _AssemblyScript_, and how _As-pect_ will fit into it all for testing. These config files will allow you to run simple commands like `$ asp` to run all our unit tests without having to tell it where to look.

## Let's Start Coding!

Open your `src/assembly/index.ts` file, and paste the following at the top of the page:

```typescript{numberLines:true}
// assembly/index.ts
import { Context, ContractPromiseBatch, logging, u128, PersistentVector } from "near-sdk-core"
```


Let's review what we are importing from `near-sdk-core`:

- Context: _Provides context for contract execution, including information about transaction sender, etc._

-  ContractPromiseBatch: _Batches ContractPromise, which make asynchronous calls to other contracts and receives callbacks._

-  logging: _Logs a string message._

-  u128: _unsigned 128-bit integer type_ 

Next, let's add some constants and type declarations to `index.ts`:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>index.ts (continued)</code></v-expansion-panel-header>
<v-expansion-panel-content>

```typescript{numberLines:3}
/**
 * == TYPES ====================================================================
 */

/**
 * Account IDs in NEAR are just strings.
 */
type AccountId = string;

/**
 * Gas is u64
 */
type Gas = u64;

/**
 * Amounts, Balances, and Money in NEAR is are u128.
 */

type Amount = u128;

type Balance = Amount;

type Money = Amount;

/**
 * Timestamp in NEAR is a number.
 */
type Timestamp = u64;

/**
 * == CONSTANTS ================================================================
 *
 * ONE_NEAR = unit of NEAR token in yocto Ⓝ (1e24)
 * XCC_GAS = gas for cross-contract calls, ~5 Tgas (teragas = 1e12) per "hop"
 * MIN_ACCOUNT_BALANCE = 3 NEAR min to keep account alive via storage staking
 */

const ONE_NEAR = u128.from("1000000000000000000000000");
const XCC_GAS: Gas = 20_000_000_000_000;
const MIN_ACCOUNT_BALANCE: u128 = u128.mul(ONE_NEAR, u128.from(3));
// import { Message, ContributionTracker, Vector } from "./models"

// max 5 NEAR accepted to this contract before it forces a transfer to the owner
const CONTRIBUTION_SAFETY_LIMIT: u128 = u128.mul(ONE_NEAR, u128.from(5));
const owner: AccountId = 'YOUR_OWN_TESTNET_ACCOUNT'
const contributions: ContributionTracker = new ContributionTracker()
const messages: Vector<Message> = new Vector<Message>("m")

@nearBindgen
export class ContributionTracker {
  public count: u32 = 0;
  public total: u128 = u128.Zero;
  public average: f64;
  public received: u128 = u128.Zero
  public transferred: u128 = u128.Zero

  update(value: u128): void {
    // track money received separately
    this.received = u128.add(this.received, value);

    // update tracking data
    this.count += 1;
    this.total = u128.add(this.total, value);
    this.average = u128.div(this.total, u128.from(this.count)).toF64();
  }

  record_transfer(): void {
    this.transferred = u128.add(this.transferred, this.received)
    this.received = u128.Zero
  }
}

/**
 * A message left by someone saying thanks
 */
@nearBindgen
export class Message {
  public static max_length(): i32 { return 100 as i32 };

  public sender: AccountId

  constructor(
    public text: string,
    anonymous: bool = false,
    public contribution: u128 = u128.Zero
  ) {
    this.sender = anonymous ? '' : Context.sender
  }
}

/**
 * setup a generic subclass instead of duplicating the get_last method
 */
@nearBindgen
export class Vector<T> extends PersistentVector<T> {
  /**
   * this method isn't normally available on a PersistentVector
   * so we add it here to make our lives easier when returning the
   * last `n` items for comments, votes and donations
   * @param count
   */
  get_last(count: i32): Array<T> {
    const n = min(count, this.length);
    const startIndex = this.length - n;
    const result = new Array<T>();
    for (let i = startIndex; i < this.length; i++) {
      const entry = this[i];
      result.push(entry);
    }
    return result;
  }
}
```

</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

Hopefully, the comments in the code above will give you some clues as to what each variable and type does. Basically, we are declaring that `AccountId` will always be a string. `Gas` will be type _u64_. `Amount` will be type _u128_, and so on. 

As for our constants, we mostly define budgetary restrictions, e.g,`CONTRIBUTION_SAFETY_LIMIT` sets the max value accepted to 5 NEAR.

You'll also notice several classes defined: `ContributionTracker`, `Message`, and `Vector`. These classes basically give some of our variables turbo power. We will dive deeper into some of them, but the important part to note for now is that each class you write in _AssemblyScript_ intended for NEAR to understand will require a decorator. That's what `@nearBindgen` (pronounced Near `Bind Gen) is. It marks the class as serializable. Serializable is a marker interface used to “mark” classes so that the objects of these classes may get a certain capability.

Let's put this code to work. Paste the following code into `index.ts`:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>index.ts (continued)</code></v-expansion-panel-header>
<v-expansion-panel-content>

```typescript{numberLines:115}
// assembly/index.ts
function _assert_financial_safety_limits(deposit: u128): void {
  const new_total = u128.add(deposit, this.contributions.received)
  assert(u128.le(deposit, CONTRIBUTION_SAFETY_LIMIT), "You are trying to attach too many NEAR Tokens to this call.  There is a safe limit while in beta of 5 NEAR")
  assert(u128.le(new_total, CONTRIBUTION_SAFETY_LIMIT), "Maximum contributions reached.  Please call transfer() to continue receiving funds.")
}

export function say(message: string, anonymous: bool = false): bool {
  // guard against too much money being deposited to this account in beta
  const deposit = Context.attachedDeposit
  _assert_financial_safety_limits(deposit)

  // guard against invalid message size
  assert(message.length > 0, "Message length cannot be 0")
  assert(message.length < Message.max_length(), "Message length is too long, must be less than " + Message.max_length().toString() + " characters.")

  if (!anonymous) {
    assert(!anonymous, "Anonymous messages are not allowed by this contract")
  }

  if (deposit > u128.Zero) {
    contributions.update(deposit)
  }

  messages.pushBack(new Message(message, anonymous, deposit))
  return true
}
```

</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

Ok! So we have a helper function, `_assert_financial_safety_limits`(love the name!), and immediately use it in our main contract function, `say`. Can you guess whether `say` is a _view_ or _call_ functions? 

Starting with the arguments, it looks like we are expecting a `message` (makes sense), and a boolean value for `anonymous`, which defaults to `false`. Cool, so this method allows you to `say` something anonymously if you want. This is most likely a _call_ function since _view_ functions don't typically require a string argument, but let's dive deeper to make sure.

Let's look at some of the property methods in there. `Context` is being used, and pretty much anytime you need to dig into `Context`, you're going to use gas. It may not be obvious at first, but the fact that it needs gas to run makes it a _call_ function. 

Next, we see property methods like `update` and `pushBack`. With `update`, we definitely know we are mutating state somehow, which means it's a _call_ function. The same goes with `pushBack`, which is a method on `Vector`, which in turn extends the class, `PersistentVector`, a _storage_ collection you will often find being used in NEAR contracts to persist data. You can read all about data storage collections in the [NEAR docs](https://docs.near.org/docs/concepts/data-storage).

## Calling Functions

Notice we are exporting `say`. If we don't export our contract functions then NEAR will throw a `MethodNotFound` error when we try to call them. 

For now, let's fire this contract up and call our one and only method. 

Open terminal, navigate to your project directory, and run the following command: 

```bash
$ yarn build:release
```

If you see an error, run `$ yarn` to make sure the project's dependencies have been installed locally.

Otherwise, you should see a new folder in your root directory called `build`. This contains a `wasm` file called `thanks.wasm`, which is how _AssemblyScript_ compiles all your code into a _WebAssembly_ binary format that is run in web browsers. It's unreadable, but you can create a readable `wat` file if you want to nerd out.  Learn more about [_WebAssembly_](https://webassembly.org/) and _AssemblyScript_'s [ asbuild](https://github.com/AssemblyScript/asbuild) CLI.

Now that we have our code compiled, we can use the NEAR CLI to deploy it. 

<pre class="language-bash">
  $ <span class="token function">near</span> dev-deploy ./build/release/thanks.wasm
</pre>

Note: if you do not specify the `./build/release/thanks.wasm` path in the above command, NEAR defaults to checking for `out/main.wasm` 

You should see another newly generated folder called `neardev`. This is a really cool feature of NEAR, where you can quickly create and use a _testnet_ account for your contract.  

<pre class="language-text">
  sample--thanks $ <span class="token function">near</span> dev-deploy ./build/release/thanks.wasm
  Starting deployment. <span class="code-emphasis">Account id: dev-1622755101091-2932922</span>, 
  node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org,
  file: ./build/release/thanks.wasm
  Transaction Id EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  To see the transaction in the transaction explorer, please open this url in your browser
  https://explorer.testnet.near.org/transactions/EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  Done deploying to dev-1622755101091-2932922
</pre>

The account for the contract above is `dev-1622755101091-2932922`. It's a bit confusing at first, but your contract is seen by NEAR as just another account; no different than your own _testnet_ account, except that this account has methods you can call on it. So let's call it! 

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 say '{"message":"Hello "}' --accountId YOUR_OWN_TESTNET_ACCOUNT.testnet
</pre>

<blockquote class="tip mb-4">

  <h3><info-icon size="1. mr-45x" class="custom-class pt-2"></info-icon>Do you have a testnet account yet?</h3><br/>

  <hr/>

  If you haven't created a NEAR testnet account of your own, navigate to https://wallet.testnet.near.org and click on "Create Account".

  If you _do_, but NEAR CLI doesn't believe you, try typing <span class="code-emphasis inline-block">$ near login</span> in your terminal. It should open a browser window, which will allow you to connect your NEAR _testnet_ account to your local version of NEAR CLI. [Learn more about NEAR CLI](https://docs.near.org/docs/tools/near-cli).
</blockquote>

You should see something like this in your terminal:

<pre class="language-bash">
  Scheduling a call: dev-1622755101091-2932922.say({"message":"Hello"})
  Transaction Id 2ZJcMeNb9rkeJuXojAdWFU9wQFkUhy3EU7DLz4sis292
  To see the transaction in the transaction explorer, 
  please open this url in your browser
  https://explorer.testnet.near.org/transactions/2ZJcMeNb9rkeJuXojAdWFU9wQFkUhy3EU7DLz4sis292
  <span class="token function">true</span> 
</pre>

Our call function, `say`, returns true just like it's supposed to. You can follow the link your terminal generates to view the transaction in the _testnet_ explorer. However, we pretty much just called our own contract, and sent a message to ourselves. This might work for daily affirmations, but the point of this contract is to call _other_ contracts, but that is simply a case of knowing the contract name of the other person's `accountId` they gave to _their_ copy of _Thanks_. In fact, you can call _my_ copy of this contract I'm using in the demo at the end of this tutorial using  `thanks.humanman.testnet`:

<pre class="language-bash">
  $ <span class="token function">near</span> call thanks.humanman.testnet say '{"message":"You are the BEST. TAKE MY MONEY!"}' --accountId YOUR_OWN_TESTNET_ACCOUNT.testnet  --amount $SO_MUCH_$$$$NEAR
</pre>

If you ran the call command from earlier as it is (with your own testnet account as `accountId`) then I would get a lovely message, and the contract would be working as intended. 

Does that make sense? Contracts have their own accountIds. People have their own accountIds. People can call other people's contracts. _Contracts_ can call other people's contracts too! As far as NEAR is concerned, an `accountId` is and `accountId` is an `accountId`. That's what we call a _cross-contract-call_, but that's for another tutorial.

The next thing we want to do is add the rest of our methods. We have a `list` method, which allows the owner of the contract to list the messages they received. So, that lovely complimentary message will be available to see by running a nifty _view_ function. However, I need to make sure that I, and I alone, the _owner_ of the contract, am allowed to view my messages. That means we will need an owner check. 

That's where _Context_ comes to play. Paste the following method in `index.ts`:

```typescript{numberLines: 142}
  export function list(): Array<Message> {
    _assert_owner()
    return messages.get_last(10)
  }

  function _assert_owner(): void {
    const caller = Context.predecessor
    assert(owner == caller, "Only the owner of this contract may call this method")
  }
```

What is going on here?? 

Well _Context_ has three major properties:

1. signer - _account that signed the initial transaction._

2. predecessor - _the last account who made the current contract call._

3. current - _the account of the contract._


So `_assert_owner()` checks that the last account to call this method is also the `owner` as defined in the `index.ts` file. 

Secondly, the `messages.get_last(10)` spits out the last 10 messages from the  `Messages` instance. Listing any more will get you into "Gas Exceeded" territory.

We can call our `list()` method like so:

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 list '{}' --accountId ACCOUNT_THAT_MATCHES_OWNER_VARIABLE.testnet
</pre>

If you are calling `list()` and you're seeing that assertion error that `_assert_owner()` throws then check that `const owner` matches the `--acountId` you used to call it. If not, change it, rebuild the `wasm`, redeploy the contract, and try calling it again.

Remember, any function we export in `assembly/index.ts` will be interpreted as a contract function when compiled to a `wasm`, and we can call it just like we did with `say`. It is perfectly fine to write your contracts this way, but did you see how clean some of those helper classes were? The simplicity and elegance of `Message` is quite inspired. Wouldn't if be cool to have a class for our contract so we can be hip to the singleton style all the kids are doing these days?  The answer is, Yes. Yes it would.

## Refactoring


Refactoring contract functions into a singleton pattern isn't that hard, but there are a few things to keep in mind. _AssemblyScript_ requires the `@nearBindgen` decorator on every class you write. Furthermore, every _call_ function requires (or at least, used to require) its own decorator, `@mutateState()` on the line above it. 

One last thing to remember, unlike the function pattern, the singleton style requires you to initialize the contract when you _first_ deploy or call it with a simple flag, `--initFunction new --initArgs '{}'` where `{}` contains the arguments your Class' constructor requires to instantiate, if any. Just remember to remove the flag from subsequent deployments or you will get an error complaining that you already initialized it. 

Switch to the `refactoring/solution` branch, and take a few minutes to review the code. 

It should be complete with all necessary contract methods nicely put together in easy-to-read classes. Your constants have been moved to `utils.ts`. Your helper classes have been moved to `model.ts`, and other helper methods have been converted to private class methods. Pretty nifty, huh?

If you want to refactor what we've done so far yourself then go nuts! You can work in the branch, `functions/solution`, which looks like spaghetti, but will run. 

Our smart contracts are singleton and ready to mingleton!

Let's take a closer look at the refactored code:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>index.ts</code></v-expansion-panel-header>
<v-expansion-panel-content>

```typescript
// index.ts
  //...
@nearBindgen
export class Contract {
  private owner: AccountId
  private allow_anonymous: bool
  // private messages: Vector<Message> = new Vector<Message>("m")
  private contributions: ContributionTracker = new ContributionTracker()

  constructor(owner: AccountId, allow_anonymous: bool = true) {
    this.owner = owner
    this.allow_anonymous = allow_anonymous
  }

  @mutateState()
  say(message: string, anonymous: bool = false): bool {
    // guard against too much money being deposited to this account in beta
    const deposit = Context.attachedDeposit
    this.assert_financial_safety_limits(deposit)

    // guard against invalid message size
    assert(message.length > 0, "Message length cannot be 0")
    assert(message.length < Message.max_length(), "Message length is too long, must be less than " + Message.max_length().toString() + " characters.")

    if (!this.allow_anonymous) {
      assert(!anonymous, "Anonymous messages are not allowed by this contract")
    }

    if (deposit > u128.Zero) {
      this.contributions.update(deposit)
    }

    messages.pushBack(new Message(message, anonymous, deposit))
    return true
  }

  //...
```
</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

This is the first section of our `Contract` class. Our main call function, `say`, is now housed in the `Contract` class, and has its `@mutateState` decorator signifying what type of function it is.

The constructor method on `Contract` takes two arguments: `owner` and `allow_anonymous`. 

The `owner` argument allows you and only you, the person who deployed the contract to call your _view_ methods. 

The `allow_anonymous` argument sets permission on whether people sending you a message can do so anonymously.

One more interesting bit of code to look at is: 

```typescript
assert(message.length > 0, "Message length cannot be 0")
```

I love `assert`. It's so intuitive, and simply allows you to place guards with error messages wherever you want. It saves you lines of `if/else` statements to do the same job, and it seamlessly ties in to your unit tests. If you're not already using it, start today!

## Testing

Speaking of unit tests, let's write a few, and I encourage you to write some more of your own. Use the `assert` methods as clues for what to write.

Navigate to `thanks/__tests__/index.unit.spec.ts` and paste the following in there:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header><code>thanks/__tests__/index.unit.spec.ts</code></v-expansion-panel-header>
<v-expansion-panel-content>

```typescript
import { Context} from "near-sdk-core"
import { VMContext } from "near-sdk-as"
import { Contract } from "../assembly/index"
import { AccountId } from "../../utils"

const contractAccount: AccountId = 'THE DEV ACCOUNT NEAR GENERATED FOR YOU IN NEARDEV/'
const owner = 'you'

let contract: Contract;
beforeEach(() => {
  contract = new Contract(owner);
})

describe('Send Message', () => {

  it('Throws AssertionError if string is empty', () => {
    expect(() => {
      contract.say("");
    }).toThrow();
  });

  it('Throws if message is too long', () => {
    const longMessage: string = "This is a really long message that should throw an error for being longer than 100 characters as is set by the max_length property on the Message class.";
    expect(() => {
      contract.say(longMessage);
    }).toThrow();
  });

});

describe('List Messages', () => {
  // seed messages for list() method

  it('Lists the last 10 messages', () => {
    contract.say("first message")
    contract.say("second message")
    contract.say("third message")
    contract.say("fourth message")
    contract.say("fifth message")
    contract.say("sixth message")
    contract.say("seventh message")
    contract.say("eighth message")
    contract.say("ninth message")
    contract.say("tenth message")
    contract.say("eleventh message")
    // from https://github.com/near/near-sdk-as/blob/master/near-mock-vm/assembly/context.ts
    VMContext.setPredecessor_account_id(owner)
    const last10 = contract.list()
    log(last10)
    expect(last10.length).toBe(10);
  });

});
 
```
</v-expansion-panel-content>
</v-expansion-panel>
</v-expansion-panels>
</v-row>

These are really simple tests that are solely informed by various `assert` methods. 

Now run:

<pre class="language-bash">
  $ <span class="token function">yarn</span> test:unit
</pre>

If all goes well, you should see something like this:

<pre class="language-bash">
    [Describe]: Send Message
  <br/>
    <span style="color: green;">[Success]</span>: ✔ Throws AssertionError if string is empty
    <span style="color: green;">[Success]</span>: ✔ Throws if message is too long
  <br/>
    [Describe]: List Messages

    <span style="color: green;">[Success]</span>:  ✔ Lists the last 10 messages
  <br/>
  [File]: src/thanks/__tests__/index.unit.spec.ts
  [Groups]: <span style="color: green;">3 pass</span>, 3 total
  [Result]: <span style="color: green;">✔ PASS</span>
  [Snapshot]: 0 total, 0 added, 0 removed, 0 different
  [Summary]: <span style="color: green;">3 pass</span>,  0 fail, 3 total
  [Time]: 7.091ms
  <br/>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  <br/>
  [Result]: <span style="color: green;">✔ PASS</span>
  [Files]: 1 total
  [Groups]: 3 count, 3 pass
  [Tests]: 3 pass, 0 fail, 3 total
  [Time]: 12537.468ms
  ✨  Done in 13.02s.
</pre>

Unit Tests can be a bit frustrating to work with at first, but they will quickly become very simple to set up.

There are a few things to note about testing your contracts:

1. Unit Tests do not require a build or `wasm` in order to run. Nor do you need to be connected to the NEAR testnet while testing.
<br/>

2. Unit Tests have no concern with the dev account generated by the NEAR CLI <nobr><span class="code-emphasis inline-block">dev deploy</span></nobr> command, so ignore the `neardev/` folder while testing.
<br/>

3. Unit Tests ignore logging unless using `log()`, which is a global `_as-pect_ function
<br/>

Caveats aside, Unit Tests will save you loads of debugging time, and help you handle edge cases, so make sure to use them.

Unit Tests use many of the modules provided by `near-sdk-as` package, including _VMContext_, to leverage info about your Smart Contract while testing. 

You can see it in use in the code above. You don't always need to use _VMContext_ , but if you have checks, like _Thanks_ does, on your functions, which check the owner of the contract, then _VMContext_ will be a real help. It has a bunch of methods allowing you to get the most out of your tests. <a href="https://github.com/near/near-sdk-as/blob/master/near-mock-vm/assembly/context.ts" target="_blank">Learn more about <em>VMContext</em></a>.

<blockquote class="tip">
<h3><info-icon size="1 mr-4.5x" class="custom-class pt-2"></info-icon>Troubleshooting Bash Errors</h3><br/>
<hr/> 

You run into some weird issues in the terminal when running tests. Make sure you haven't added any unnecessary dependencies. [Learn more about writing Unit Tests in _AssemblyScript_](https://dev.to/jtenner/testing-with-assemblyscript-and-the-usefulness-of-value-3egn).

Also, you may have been tempted to run `npm audit fix` at some point during installation. Despite all the bright, red, urgent warnings your terminal may have thrown at you, "fixing" the dependencies may prevent you from properly compiling your code, which will in turn prevent pretty much anything else you want to do with your program. 

Bleeding edge technology like blockchain development is a bit of a double edge sword. It's exciting, and there's lots of opportunity to contribute, but the source code is constantly updating and improving. What was stable last week, may be outdated this week. So, stay up to date by [joining the community!](https://near.org/community/)

</blockquote>

## Adding Scripts

Let's make our lives a bit easier and gather our CLI commands.

Switch to the `scripts/solution` branch, and review the contents of the `scripts/` directory. 

Scripts like these are great organizational tools to help you and others interact with your code. 

Take a few minutes to read through `scripts/README.md`. It will lay out a cool demonstration of the contract at work using the terminal. Here is a video of that demonstration:


<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/13269fbf5c8c463d9955bc5ef0051387" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

## Summary

Amazing work! Hopefully, you know a little bit more about Smart Contracts like:


- The difference between a _call_ function and a _view_ function.
- Dependencies and libraries specific to NEAR and _AssemblyScript_.
- Setting up an account Id for your contract.
- Calling a contract method from the command line.
- Writing Smart Contracts as functions and as Classes.
- Unit testing your Smart Contract.
- Using scripts to run code.
  
<br/>

You also have some new packages installed globally that you can use like NEAR CLI. Now you can write your own Smart Contracts, deploy them, and call them; all from the command line! 

## What Next?

<h3 class="mt-10 mb-4">Simulation Testing</h3>

If you want to dive deeper into testing, head over to the [Near Docs](https://docs.near.org/docs/develop/contracts/rust/testing-rust-contracts#simulation-tests), and look into Simulation Tests. Although, we wrote our contract code in _AssemblyScript_, all Simulation Tests are written in _Rust_, which can be a very challenging language to learn, but well worth it if you continue developing Smart Contracts. 

<h3 class="mt-10 mb-4">Adding a Front End</h3>

We've built and tested a remarkable backend. If we were building an API, the Smart Contracts methods would be how we make requests to our api. 

More specifically, Smart Contracts operate like an ORM, but instead of communicating directly with a database (ORM), Smart Contracts communicate directly with the blockchain, or rather, the blockchain's own api, called the RPC.

If that's confusing, then let's back up a bit - we're done building our backend.

But can Grandma open up her terminal and use it? No. Grandma thinks Bash is some sort of side dish with beans. 

In order for her to send us a message (and maybe a NEAR token or two!), we need to spin up a front end that calls the contract the same way we've been doing in the terminal.  

Take a moment to think about what this contract would look like. What would _any_ "thank you message" application _look_ like? We know that `say` requires a _message_, right? Maybe a form of some kind would fit the bill. Et Voil&agrave; !

Before using the form below, please make sure you have a _testnet_ account. You will be redirected to NEAR explorer for authorization.

<thanks-form></thanks-form>

Refer to the `contract-ui/` folder in this repo to see the code for the above form. See if you can transplant it into your local copy of `sample--thanks` using Vue.





