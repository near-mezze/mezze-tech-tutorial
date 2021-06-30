<template>
<div class="landing-wrapper">
  <h2>What is NEAR?</h2>


    <p><a target="_blank" href="https://near.org">NEAR</a> is an open source platform that accelerates the development of decentralized applications. I could go on and on. Ok, I will.</p>

    <p class="ml-16"><em>From near.org</em></p>
    <blockquote class="mb-4 quote">
      <span class="left-quote">&ldquo;</span><em>So what is NEAR (aka “the NEAR Platform”)? NEAR is a decentralized development platform built on top of the NEAR Protocol, which is a public, sharded, developer-friendly, proof-of-stake blockchain. Put another way, NEAR is like a public community-run cloud platform.  That means it is a highly scalable, low cost platform for developers to create decentralized apps on top of. While it’s built on top of the NEAR Protocol blockchain, the NEAR Platform also contains a wide range of tooling from explorers to CLI tools to wallet apps to interoperability components which help developers build much more easily and the ecosystem to scale more widely.</em>
      <br/>
      <br/>
      <em>Whereas most other “scalable” blockchains use approaches that centralize processing on high-end hardware to provide a temporary boost in throughput, NEAR Protocol’s approach allows the platform’s capacity to scale nearly linearly up to billions of transactions in a fully decentralized way.</em>
    </blockquote>

    <p class="ml-14">Join the <a href="https://airtable.com/shrkb3VSkDRf3BKjv)" target="_blank">NEAR ecosystem</a>!</p>


    <h3 class="mt-10 mb-6">PLEASE NOTE!</h3>

    <p>Any content produced by NEAR, or developer resources that NEAR provides, are for educational and inspiration purposes only. NEAR does not encourage, induce or sanction the deployment of any such applications in violation of applicable laws or regulations.</p>

    <h2>What are Contracts?</h2>

    <p>Sometimes called "smart" contracts, they are the back-end of your application.  Contracts control the code and data that run on the blockchain. </p>

    <p>All contracts on NEAR must be compiled to <a target="_blank" href="https://webassembly.org"><em>WebAssembly</em></a> or simply <em>WASM</em>. Currently, NEAR supports two languages <a target="_blank" href="https://www.assemblyscript.org"><em>AssemblyScript</em></a> and <a target="_blank" href="https://www.rust.org"><em>Rust</em></a> with custom software development kits (SDKs) to assist in their creation.</p>

    <p>Developers write contracts, deploy them to the network (actually, we could say "they deploy the contract to a specific account that they control"), and then invoke methods on the contract interface.  Once a method (aka function) is called, the contract "wakes up", runs the method code and then "shuts down" (like a serverless function).</p>

    <p> Functions are grouped into two types: <code>view</code> functions and <code>change</code> functions.</p>

    <p><code>Change Functions</code> mutate state. They change something in your storage regarding the contract. They basically add or remove data.</p>

    <p><code>View Functions</code> simply read the data. You may have a method that returns a list of recent transactions. That's a <code>view</code> function.</p>

    <p>If you are familiar with the terms "setter" and "getter", or http GET and POST requests, or read/write access, you may assume that view/call functions share this same relationship. It's important to be aware what your functions are doing so you can use the correct syntax when writing and calling them.</p>

    <blockquote class="tip"><info-icon size="1.5x" class="custom-class tip-icon mr-2 pt-1"></info-icon>When in doubt of whether your contract method is a change or view function, check if you paid for the gas when you called it. View functions are "free" (paid for by the RPC server host), while change functions cost you gas. <a target="_blank" href="https://docs.near.org/docs/concepts/gas">Learn more about NEAR gas fees</a>.</blockquote> 

    <!-- TODO: ADD IMAGES OF VIEW AND CALL FUNCTION GAS CONSUMPTION FROM EXPLORER -->

    <h2>General Development Setup</h2>

    <p>Take a moment to install a few global dependencies so you don't have to worry about them later. </p>

    <p>We will be developing in <em>NodeJS</em>, and using <em>VSCode</em> as our IDE.</p>

    <p>
      <strong>NEAR CLI</strong>: <em>Command line Swiss Army knife for NEAR Protocol used to deploy and interact with contracts on the NEAR network</em>
    </p>

    <p>
      <strong>NodeJS^v12.x</strong>: <em>Backend JS framework supporting NEAR development tools (note that we require NodeJS >=v12)</em>
    </p>

    <p>
      <strong>AssemblyScript</strong>: <em>A new and innovative programming language that looks and feels just like JavaScript / TypeScript.  We use it to write contracts that are then compiled to WASM and deployed to the NEAR platform</em>
    </p>

    <p>
      <strong>Rust</strong>: <em>A high performance, mature programming language that we use to write contracts that are then compiled to WASM and deployed to the NEAR platform.  Rust is required to write simulation tests for contracts (this is required when modeling cross-contract calls in a test scenario)</em>
    </p>

    <p>
      <strong>Vue</strong>: <em>This will be the front end framework we will be using to build our snazzy UI for our web3 app</em>
    </p>

    <p>
      Make sure you have all the plugins and extensions installed and activated so you get the right syntax highlighting and autocompletion. <em>VSCode</em> has loads of stuff to help with development in <em>AssemblyScript</em>. <a href="https://marketplace.visualstudio.com/items?itemName=saulecabrera.asls" target="_blank">Learn more about <em>AssemblyScript</em> for <em>VSCode</em></a>.
    </p>

    <blockquote class="tip" style="margin-top: 1rem;">
      <info-icon size="1.5x" class="custom-class mr-2 tip-icon pt-1"></info-icon><strong>When you're ready to switch over from a dev contract account to a permanent one, here's how:</strong><br/>
      <hr/>
      <br/><strong>Step 1: Create an account for the contract</strong><br/>
      Visit <a href="https://wallet.nearprotocol.com" target="_blank">NEAR Wallet</a> and make a new account. You'll be deploying these smart contracts to this new account.
      Now authorize NEAR CLI for this new account, and follow the instructions it gives you:
      
      <span class="code-emphasis inline-block" style="font-size: smaller;">$ near login</span>
      
      <br/><br/><strong>Step 2: set contract name in code</strong><br/>

      <p>Modify the line in your <span class="code-emphasis inline-block">src/config.js</span> that sets the account name of the contract. Set it to the account id you used above. If you don't have a config file set up, take a few minutes to see how the config file is wired up in this <a href="https://github.com/near-examples/guest-book/blob/master/src/config.js" target="_blank">example project</a>.</p>

      <br/><strong>Step 3: change remote URL if you cloned the repo </strong><br/>
      <p>Unless you forked the project repository you will need to change the remote URL to a repo that you have commit access to. This will allow auto deployment to Github Pages from the command line.</p>
      
      <p>
        <ol style="margin-left: 1rem;">
          <li>go to GitHub and create a new repository for your project</li>
          <li>open your terminal and in the root of your project enter the following:</li>
        </ol>
      </p>

      <p><span class="code-emphasis inline-block" style="font-size: smaller;">$ git remote set-url origin https:&#47;&#47;github.com/YOUR_USERNAME/YOUR_REPOSITORY.git</span></p>

      <br/><strong>Step 4: deploy!</strong><br/>
      Add this to the "scripts" section of your <span class="code-emphasis inline-block">package.json</span> file:     
      <pre class="language-text pb-0">
        "deploy":"yarn build:release && near deploy && gh-pages -d build/"s
      </pre>

      <p> One command: <span class="code-emphasis inline-block">yarn deploy</span>.<br/><br/>
      As you can see in <span class="code-emphasis inline-block">package.json</span>, this does two things:</p>

      <ol style="margin-left: 1rem;">
        <li>builds & deploys smart contracts to NEAR TestNet.</li>
        <li>builds & deploys frontend code to GitHub using <a href="https://github.com/tschaub/gh-pages" target="_blank">gh-pages</a>. This will only work if the project already has a repository set up on GitHub. Feel free to modify the <span class="code-emphasis inline-block">deploy</span> script in <span class="code-emphasis inline-block">package.json</span> to deploy elsewhere or to remove any front end commands.</li>
      </ol>

      <br/>
      <em>courtesy of <a href="https://learn.figment.io/network-documentation/near/tutorials" target="_blank">figment.io</a>.</em>
    </blockquote>

  </div>
</template>

<script>
  export default {}
</script>

<style scoped>

.landing-wrapper {
  margin-bottom: 2rem;
}

.quote {
  width: 60%;
  margin: auto;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
</style>