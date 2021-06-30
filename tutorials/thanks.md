---
title: Thanks
slug: thanks
section: Contracts
---

<blockquote class="lesson mt-6">
  <h3>Build the Thanks contract</span></h3><br><br>

  - time to complete: **80 mins**
  - level of difficulty: **moderate**
  - prerequisites
    - NEAR TestNet account
    - basic Javascript
    - basic Bash
    - basic Git

</blockquote>



## Overview


No. Seriously. Thanks! 

Actually, that's the name of the contract we will be building today, [Thanks](https://github.com/Learn-NEAR/thanks), which allows users to say "thanks" to other users by calling _their_ instance of this contract. 

You can optionally attach tokens to your message, or even leave your message anonymously.

Of course keep in mind that your signing account will be visible on the blockchain via NEAR Explorer even if you send an anonymous message; It just will be omitted when the receiver calls certain _other_ functions on the contract. 

This is a simple demonstration of how contracts work, and how to call them.  We're going to use _AssemblyScript_ to write our code.


<h3>Notes on AssemblyScript</h3>


Classes are very important in AssemblyScript. If you want to create an object, for instance, you would do so by constructing a class first.

```typescript
  // in this version we create a new MyClass definition
  // with a constructor function and a single instance member
  @nearBindgen
  export class MyClass {
    public val: string
    constructor(val: string) {
      this.val = val
    }
  }

  // this is the shorthand version supported by AssemblyScript
  // of the same thing above
  @nearBindgen
  export class MyClass {
    constructor(public val: string) {
    }
  }
```

Use this class as follows:

```typescript
  const myObject = new MyClass({val: "some value"});
```

And like that you created an object assigned to type `MyClass`. 


<h3>Command Line Interface (CLI)</h3>


Throughout this tutorial, you will have the opportunity to engage with this contract as we build it together through various commands.

These commands will be executed through a Command Line Interface like _Bash_ or _Terminal_.

<blockquote class="tip mb-4">
<h3><info-icon size="1. mr-45x" class="custom-class tip-icon"></info-icon></info-icon>
What is CLI?? Why do you call it Terminal?? </h3><br/>

<hr/>

Terms like "terminal", "bash", and "shell" simply refer to programs presenting the Command Line Interface (CLI).

Bash is a Unix shell and command language, which is used as the default login shell for most Linux distributions. Bash can also read and execute commands from a file, called a shell script.

Shell scripts with the extension <span class="code-emphasis inline-block">.sh</span> tell your Command Line Interface to read and execute the commands written in those files.

<a href="https://tldp.org/LDP/Bash-Beginners-Guide/html/sect_02_01.html" target="_blank">Learn more about creating and running scripts in the Command Line Interface</a>.

</blockquote>

However, If you're like me, and need a visual for what this contract might look like with a UI, scroll down to the <a href="what-next">What Next?</a> section to see a demo of _Thanks_ with a simple UI layer. The code for this UI layer is in the repo of this tutorial in the `components/contract-ui/thanks/` directory. 

You can find more examples of contracts with UIs at [examples.near.org](https://examples.near.org/)

By the end of this tutorial, you will have a deeper understanding of how NEAR contracts are built, tested, deployed, and used. With that knowledge, you will be able to build your own decentralized applications, which you can share with the NEAR community!



## Local Setup


The `thanks` repo has several branches we will be using. The first branch, `getting-started`, is the bare bones project. It will have all of the files we need, but most of them will be empty. 

The other branches you will find (including `getting-started`) are:

1. `getting-started`
2. `functions/empty` & `functions/solution`
3. `refactoring/empty` & `refactoring/solution`
4. `testing/empty` & `testing/solution`
5. `scripts/empty` & `scripts/solution`

<br/>

Do you see a pattern? Several of the "major" sections of this tutorial have corresponding branches in the `thanks` repo. 

We will be reviewing the completed code in the `/solution` branches, but you are encouraged to use the `/empty` branches to build the logic for this project on your own. 

The branches `main` and `scripts/solution` will have the complete code from every section in case you get stuck putting it all together. 

As always, you can build everything from scratch using the below terminal command:

<pre class="language-bash">
$ <span class="token function">near</span> create-near-app your-awesome-project
</pre>

and just use the file tree in the following section for reference.

Let's get started!


<h3>Clone The Repo</h3>


Clone the repository with this command:

```bash 
     
   $ git clone git clone git@github.com:near-mezze/thanks.git thanks
   $ cd thanks
  #
  # run scripts in package.json with "yarn <script name>" or "npm run <script name>"
  #
```


Now switch to the `getting-started` branch.


<h3>File Structure</h3>


```

  thanks/
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

This is similar to what your file tree looks like if you use the
 <nobr><span class="code-emphasis inline-block">create-near-app</span></nobr> command.

We will write all our contract code and tests in these folders:

`/thanks/__tests__/`

`/thanks/assembly/`

If you are in the <nobr><span class="code-emphasis inline-block">getting-started</span></nobr> branch, you should see that a few of the `.ts` files are empty. Don't worry. We will be filling them back up with code soon.

Additionally, we will set up a few constants in `src/utils.ts`.

That's pretty much it for a bird's eye view. Files like `asconfig.json` are entry files that inform _AssemblyScript_ the options to use when compiling your code to _WebAssembly_. Some simply tell _AssemblyScript_ where to look for your files. Others may deal with optimizing compilation. More on entry files can be found in [The AssemblyScript Book](https://www.assemblyscript.org/compiler.html#command-line-options).



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
<v-expansion-panel-header>index.ts (continued)</v-expansion-panel-header>
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

Read the comments in the code! They will tell you a little about each variable and type. 

For example, `AccountId` will always be a string. `Gas` will be type _u64_. `Amount` will be type _u128_, and so on. 

As for our constants, we mostly define budgetary restrictions, e.g. `CONTRIBUTION_SAFETY_LIMIT` sets the max value accepted to `5 NEAR`.

You'll also notice several classes defined: `ContributionTracker`, `Message`, and `Vector`. 

These classes basically give some of our variables turbo power. We will take a closer look at some of them, but the important takeaway right now is that each class you write for a NEAR app in _AssemblyScript_ may require a decorator of some sort to inform how it will behave. 

That's what `@nearBindgen` (pronounced Near `Bind Gen) is. It's a decorator that must be added to all classes if they will be used in one of 2 ways:

1. Instances of the class will be written to / read from blockchain storage.
2. Instances of the class will move across the contract boundary, ie. received as arguments to a contract function from a client or returned as values from a contract function to a client.

<br/>

You can't move the concept of "an instance of a class" across the wire to your Vue or React app, but you can move JSON. 

So, how do you convert "an instance of a class" to JSON?  you decorate it with `@nearBindgen`.
The same goes for writing to / reading from _storage_. 

Learn more about the [Near Bindings Generator](https://www.npmjs.com/package/near-bindgen-as).

Let's put these classes, types, and constants to work. Paste the following code into `index.ts`:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header>index.ts (continued)</v-expansion-panel-header>
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

Ok! So we have a helper function, `_assert_financial_safety_limits`(love the name!). It's used in our main _call_ function, `say`. Can you guess why `say` is a _call_ function rather than a _view_ function? 

Starting with the arguments, it looks like `message` takes a string, and `anonymous` takes a boolean, which defaults to `false`. 

Cool, so this method allows you to `say` something anonymously if you want. This is most likely a _call_ function since _view_ functions don't typically require arguments, but let's dive deeper to make sure.

We see property methods like `update` and `pushBack`. With `update`, we know we are mutating state somehow, which means it's a _call_ function. 

The same goes with `pushBack`, which is a method on `Vector`. It extends the class, `PersistentVector`, a _storage_ collection you will often find being used in NEAR contracts to persist data. 

You can read all about data storage collections in the [NEAR docs](https://docs.near.org/docs/concepts/data-storage).

One other clue is the use of `Context`.  When you access `Context`, you will spend gas. It may not be obvious at first, but if your method needs to spend gas on a transaction, then it is most likely a _call_ function since _view_ functions are free.



## Calling Functions


Notice we are exporting `say`. If we don't export our contract functions then NEAR will throw a `MethodNotFound` error when we try to call them. 

In fact, let's fire this contract up and call our one and only method we have so far. 

Open terminal, navigate to your project directory, and run the following command: 

```bash
   $ yarn build:release
```

If you see an error, run `$ yarn` to make sure the project's dependencies have been installed locally.

Otherwise, you should see a new folder in your root directory called `build`. This contains a WASM file called `thanks.wasm`, which is how _AssemblyScript_ compiles all your code into a _WebAssembly_ binary format that is run in web browsers. 

It's unreadable, but you can create a readable `wat` file if you want to nerd out.  Learn more about [_WebAssembly_](https://webassembly.org/) and _AssemblyScript_'s [ asbuild](https://github.com/AssemblyScript/asbuild) CLI.

Now that we have our code compiled, we can use the NEAR CLI to deploy it to a DEV environment. 

<pre class="language-bash">
  $ <span class="token function">near</span> dev-deploy ./build/release/thanks.wasm
</pre>

Note: if you do not specify the `./build/release/thanks.wasm` path in the above command, NEAR defaults to checking for `out/main.wasm` 

You should see another newly generated folder called `neardev`. This is a really cool feature of NEAR where you can quickly create and use a _TestNet_ account for your contract.  

<pre class="language-text">
  thanks $ <span class="token function">near</span> dev-deploy ./build/release/thanks.wasm
  Starting deployment. <span class="code-emphasis">Account id: dev-1622755101091-2932922</span>, 
  node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org,
  file: ./build/release/thanks.wasm
  Transaction Id EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  To see the transaction in the transaction explorer, please open this url in your browser
  https://explorer.testnet.near.org/transactions/EXRwdkcY8iNE1xyowRvc1xvvYYR4YbXNZTCchSFxryrN
  Done deploying to dev-1622755101091-2932922
</pre>

The account NEAR generated for the contract above is `dev-1622755101091-2932922`. 

Your contract is seen by NEAR as just another account; no different than your own _TestNet_ account, except that this contract account has methods you can call on it like so: 

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 say '{"message":"Hello "}' --accountId YOUR_OWN_TESTNET_ACCOUNT.testnet
</pre>

You should see something like this in your terminal:

<pre class="language-bash">
  Scheduling a call: dev-1622755101091-2932922.say({"message":"Hello"})
  Transaction Id 2ZJcMeNb9rkeJuXojAdWFU9wQFkUhy3EU7DLz4sis292
  To see the transaction in the transaction explorer, 
  please open this url in your browser
  https://explorer.testnet.near.org/transactions/2ZJcMeNb9rkeJuXojAdWFU9wQFkUhy3EU7DLz4sis292
  <span class="token function">true</span> 
</pre>

Our _call_ function, `say`, returns true as intended. You can follow the link your terminal generates to view the transaction in the _TestNet_ explorer. 

We pretty much just called our own contract, and sent a message to ourselves. This might work for daily affirmations, but the point of this contract is to call _other_ contracts.  

That is simply a case of knowing the contract name of the other person's `accountId` associated with _their_ copy of _Thanks_. For instance, you can call _my_ copy of this contract, `thanks.humanman.testnet`, in the [what-next](#what-next) section of this tutorial:

<pre class="language-bash">
  $ <span class="token function">near</span> call thanks.humanman.testnet say '{"message":"You are the BEST. TAKE MY MONEY!"}' --accountId YOUR_OWN_TESTNET_ACCOUNT.testnet  --amount $SO_MUCH_$$$$NEAR
</pre>

If you run the call command above using your own testnet account as `--accountId` then I would get a lovely message when I call one of the _view_ functions available to me, the contract owner. 

Does that make sense? 

 - Contracts have their own `accountIds`. 

 - People have their own `accountIds`. 

 - People can call other people's contracts. 

 - _Contracts_ can call other people's contracts too! Those are called _cross-contract-calls_.

As far as NEAR is concerned, an `accountId` is and `accountId` is an `accountId`. 


<h3 class="mt-10 mb-4">Adding More Methods</h3>


The next thing we want to do is add the rest of our methods to our contract. We have a `list()` method, which allows the owner of the contract to list the messages they received. So, that lovely complimentary message will be available to see by running the nifty `list()` _view_ function. 

However, I need to make sure that I, and I alone, the _owner_ of the contract, am allowed to view my messages. 

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

What is going on here? 

Well, _Context_ has three major properties:

1. signer - _account that signed the initial transaction._

2. predecessor - _the last account who made the current contract call._

3. current - _the account of the contract._


So `_assert_owner()` checks that the last account to call this method is also the `owner` as defined in the `index.ts` file. 

Secondly, the `messages.get_last(10)` spits out the last 10 messages from the  `Messages` instance. Why only 10? Listing any more will get you into "Gas Exceeded" territory.

Now we call our `list()` method like so:

<pre class="language-bash">
  $ <span class="token function">near</span> call dev-1622755101091-2932922 list '{}' --accountId ACCOUNT_THAT_MATCHES_OWNER_VARIABLE.testnet
</pre>

If you are calling `list()` and you're seeing that assertion error thrown by `_assert_owner()` then check that `const owner` matches the `--acountId` you used to call it using `logging.log()`. 

If they don't match, change the values so they _do_ match, rebuild the contract, redeploy the contract with `dev-deploy`, and try calling it again.

Remember, any function we export in `assembly/index.ts` will be interpreted as a contract function when compiled to a WASM file allowing us to call it just like we did with `say`. 

It is perfectly fine to write your contracts this way, but did you see how clean some of those helper classes were? The simplicity and elegance of `Message` is quite inspired. 

Wouldn't if be cool to have a class for our contract so we can be hip to the singleton style all the kids are doing these days?  The answer is, Yes. Yes it would.



## Refactoring


Refactoring contract functions into a singleton pattern isn't that hard, but there are a few things to keep in mind. _AssemblyScript_ requires the `@nearBindgen` decorator on every class you write. 

Furthermore, every _call_ function may have its own decorator, `@mutateState()`, which signifies that the _instance_ of the contract be written back to storage after the _call_ function is invoked. But don't worry about that right now, because it's simply out of scope for this tutorial. 

Feel free to experiment with decorators. They are more or less annotations to help _AssemblyScript_ properly compile and run your code.

Switch to the `refactoring/solution` branch, and take a few minutes to review the code. 

It should be complete with all necessary contract methods nicely put together in easy-to-read classes. Your constants have been moved to `utils.ts`. Your helper classes have been moved to `model.ts`, and other helper methods have been converted to private class methods. Pretty nifty, huh?

If you want to refactor what we've done so far yourself then go nuts! You can work in the branch, `functions/solution`, which looks like spaghetti, but will run. Or you can start with `refactoring/empty` if you want to start with something cleaner.

Our contracts are singleton and ready to mingleton!

Let's take a closer look at the refactored code:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header>index.ts</v-expansion-panel-header>
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


<h3>Initialize your Contract</h3>


One last thing to remember, unlike the function pattern ( also known as "Bag of Functions"), the singleton style requires you to initialize the contract, when you _first_ deploy or call it, with a couple of simple flags, `--initFunction new --initArgs '{}'` where `{}` contains the arguments your Class' constructor requires for instantiation, if any. 

Just remember to remove the flags from subsequent deployments / calls or you will get an error complaining that you already initialized it. 



## Testing


We've been mentioning Unit Tests, now it's time to run some, and I encourage you to write a few of your own. If you're lost, look at methods that use `assert()`, and write tests based on those.

Navigate to `thanks/__tests__/index.unit.spec.ts` and paste the following in there:

<v-row justify="center" class="mb-4">
<v-expansion-panels accordion>
<v-expansion-panel>
<v-expansion-panel-header>thanks/__tests__/index.unit.spec.ts</v-expansion-panel-header>
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
    <span class="code-green">[Success]</span>: ✔ Throws AssertionError if string is empty
    <span class="code-green">[Success]</span>: ✔ Throws if message is too long
  <br/>
    [Describe]: List Messages

    <span class="code-green">[Success]</span>:  ✔ Lists the last 10 messages
  <br/>
  [File]: src/thanks/__tests__/index.unit.spec.ts
  [Groups]: <span class="code-green">3 pass</span>, 3 total
  [Result]: <span class="code-green">✔ PASS</span>
  [Snapshot]: 0 total, 0 added, 0 removed, 0 different
  [Summary]: <span class="code-green">3 pass</span>,  0 fail, 3 total
  [Time]: 7.091ms
  <br/>
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  <br/>
  [Result]: <span class="code-green">✔ PASS</span>
  [Files]: 1 total
  [Groups]: 3 count, 3 pass
  [Tests]: 3 pass, 0 fail, 3 total
  [Time]: 12537.468ms
  ✨  Done in 13.02s.
</pre>


There are a few things to note about testing your contracts:

1. Unit Tests do not require a build or WASM file in order to run. Nor do you need to be connected to a NEAR network, like TestNet, for testing.
<br/>

2. Unit Tests have no concern with the dev account generated by the NEAR CLI <nobr><span class="code-emphasis inline-block">dev deploy</span></nobr> command, so ignore the `neardev/` folder while testing.
<br/>

3. Unit Tests ignore logging unless using `log()`, which is a global _as-pect_ function.
<br/>

Caveats aside, Unit Tests will save you loads of debugging time, and help you handle edge cases, so make sure to use them.

Unit Tests use many of the modules provided by `near-sdk-as` package, including _VMContext_, to leverage info about your contract while testing. 

You can see it in use in the code above. You don't always need to use it, but if need to check the owner of a contract like _Thanks_ does, then _VMContext_ will be a real help. 

_VMContext_ has a bunch of methods allowing you to get the most out of your tests. <a href="https://github.com/near/near-sdk-as/blob/master/near-mock-vm/assembly/context.ts" target="_blank">Learn more about <em>VMContext</em></a>.

<blockquote class="tip">
   <h3><info-icon size="1 mr-4.5x" class="custom-class tip-icon pt-2"></info-icon>Troubleshooting Bash Errors</h3><br/>
   <hr/> 

   You may run into some unexpected issues in the terminal when running tests. Make sure you haven't added any unnecessary dependencies. [Learn more about writing Unit Tests in _AssemblyScript_](https://dev.to/jtenner/testing-with-assemblyscript-and-the-usefulness-of-value-3egn).

   Also, you may have been tempted to run `npm audit fix` at some point during installation. Despite all the bright, red, urgent warnings your terminal may have thrown at you, "fixing" the dependencies may prevent you from properly compiling your code, which will in turn prevent pretty much anything else you want to do with your program. So, it's advisable to ignore those warnings unless you know exactly what you're doing.

   Bleeding edge technology like blockchain development is a bit of a double edge sword. It's exciting, and there's lots of opportunity to contribute, but the source code is constantly updating and improving. What was stable last week, may be outdated this week. So, stay up to date by [joining the community!](https://near.org/community/)

</blockquote>



## Deployment


We can now publish our polished contract to NEAR TestNet so others can call it. In order to do that, though, we will need a TestNet `AccountId` for our contract.

When you're ready to switch over from a dev contract account to a permanent one for your contract, here's how:


**Step 1:** Create an account for the contract.

  - Visit <a href="https://wallet.nearprotocol.com" target="_blank">NEAR Wallet</a> and make a new account. You'll be deploying these smart contracts to this new account.
  Now authorize NEAR CLI for this new account:
  
  <span class="code-emphasis inline-block" style="font-size: smaller;">$ near login</span>
  

<br/>

**Step 2:** Set contract name in code.
  - Modify the line in your <span class="code-emphasis inline-block">src/config.js</span> that sets the account name of the contract. Set it to the account id you used above. If you don't have a config file set up, take a few minutes to see how the config file is wired up in this <a href="https://github.com/near-examples/guest-book/blob/master/src/config.js" target="_blank">example project</a>.


<br/>

**Step 3:** Deploy!
   - Add this to the "scripts" section of your <span class="code-emphasis inline-block">package.json</span> file:     
  
  ```json
    "deploy": "yarn build:release && near deploy ./build/release/thanks.wasm"
  ```

  One command: <span class="code-emphasis inline-block">yarn deploy</span>.<br/><br/>
  As you can see in <span class="code-emphasis inline-block">package.json</span>, this does two things:

  <ol style="margin-left: 1rem;">
    <li>Builds our WASM.</li>
    <li>Deploys contract to NEAR TestNet.</li>
  </ol>

  <br/>
  

<em>more details at <a href="https://learn.figment.io/network-documentation/near/tutorials" target="_blank">figment.io</a>.</em>
<br/>



## Adding Scripts


Let's make our lives a bit easier and gather our CLI commands.

Switch to the `scripts/solution` branch, and review the contents of the `scripts/` directory. 

Scripts like these are great organizational tools to help you and others interact with your code. 

Take a few minutes to read through `scripts/README.md`. It will lay out a cool demonstration of the contract at work using the terminal. Here is a video of that demonstration:


<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="https://www.loom.com/embed/13269fbf5c8c463d9955bc5ef0051387" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>



## Summary


Amazing work! Hopefully, you know a little bit more about contracts like:


- The difference between a _call_ function and a _view_ function.
- Dependencies and libraries specific to NEAR and _AssemblyScript_.
- Setting up an account Id for your contract.
- Calling a contract method from the command line.
- Writing contracts as functions and as Classes.
- Unit testing your contract.
- Using scripts to run code.
  
<br/>

You also have some new packages installed globally that you can use like NEAR CLI. Now you can write your own contracts, deploy them, and call them; all from the command line! 



## What Next?


<h3 class="mt-10 mb-4">Simulation Testing</h3>


If you want to dive deeper into testing, head over to the [Near Docs](https://docs.near.org/docs/develop/contracts/rust/testing-rust-contracts#simulation-tests), and look into Simulation Tests. Although, we wrote our contract code in _AssemblyScript_, all Simulation Tests are written in _Rust_, which can be a very challenging language to learn, but well worth it if you continue developing contracts. 


<h3 class="mt-10 mb-4">Adding a Front End</h3>


We've built and tested a remarkable backend. If we were building an API, the contract methods would be how our api connects to our database to read and write data similar to an ORM. 

However, instead of communicating directly with a database, our contract communicates directly with the blockchain, or rather, the blockchain's own api, called the _RPC_.  It's still operating a backend that we can wire up to a front end in a variety of ways.

If that's confusing, then let's back up a bit - we're done building our backend.

But in order for our Grandmas to use our program to send us a message (and maybe a NEAR token or two!), we need to spin up a front end that calls the contract the same way we've been doing in the CLI. 

Otherwise, our dear Grandmas will need to learn Bash commands, and they all think "bash" is something you eat with a side of beans. So, take a moment to think about what this contract would look like on a web page. 

What would _any_ "thank you message" application _look_ like? We know that `say` requires a _message_, right? Maybe a submission form of some kind would fit the bill... 

Et Voil&agrave; !

Before using the form below, please make sure you have a _testnet_ account. It is required to use this form, and you will be redirected to NEAR explorer for authorization.

<thanks-form></thanks-form>

Refer to the `contract-ui/thanks` folder in this repo to see the code for the above form. See if you can transplant it into your local copy of `thanks`, and get it up and running. One hint: it's built in Vue.







