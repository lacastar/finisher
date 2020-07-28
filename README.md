# finisher

## Collect your finishing medals and validated results on blockchain

### (And go a bit easier on mother nature, since most of it would end up in landfills anyway)

![Home screen](home.png "Home screen")

The flow is easy.
The organizer:

- Creates the event and the medal in Finisher, and chooses the oracle that can retrieve the results
- Submits the medal to the blockchain
- Registers the competitors with their wallet and attributes that are needed to retrieve results (manually or with an API)

![Manager screen](manage.png "Manager screen")

The competitor:

- When the results are ready the competitor can claim the medal for a fee that covers the following: the transaction checks with the oracle the eligibility and the result, and stores the achievement onchain
- (It will be possible to add off-chain metadata and references later)

[You can try it here. A PoC as it is, without any commitments or guarantee](https://finisher-e976e.web.app/)

To test it you need a Web3 client like MetaMask installed in your browser, and a Google account and third party cookies enabled (sorry about both of it). It is configured now on the Ropsten test network, where you can obtain free Ether from a couple of faucets, like [this](https://faucet.ropsten.be/). (If the contract would run out of LINK tokens, just send some to it's address: 0x11366E2EddeE6A71aFe28B695aF8d6f31d53Dc1E - it is possible to obtain [HERE](https://ropsten.chain.link/) )
You can create a medal on the Manage screen (just click the big plus in the bottom right corner) For Oracle choose "Futanet webextract" - it will get data from the [Futanet Database](http://www.futanet.hu/versenyeredmeny.php) For the 'verseny' parameter check what the page sends in the form with the same name (ie. for the race '2020. 07. 25. - K&H mozdulj! 10 km' it is '2020_felm10_e'). After you save and commit this competition it is possible to register competitors. For this Oracle you'll have to provide a 'rajtszam' parameter, that you can find in the query result on the Futanet page as rajtszám/Start# - ie. 13051 in our current example.
Once it is done, you should login as the competitor (change both Google login and Web3 account if needed, but you can test with the same accounts as well). Your new medal should appear on your home screen, and after Claiming it, your result should display as well.

[![Walkthrough](http://img.youtube.com/vi/OOp05uRVFbQ/0.jpg)](http://www.youtube.com/watch?v=OOp05uRVFbQ)

Disclaimer:

- Brave browser seems to have problems with Firebase login, you must set "All cookies allowed" under Brave shields
- Some authorization checking is missing, the UI/UX is definitely lacking, and please don't start on the code quality, a clean up is on schedule very soon.
- The BSI (futanet.hu) Oracle was reverse engineered, so it can stop working any time, since I am not associated with them in any way, so probably they won't notify me before changing anything.
- The medal claim transaction will be signed in the cloud function, soon...

### Why not ERC 721
There is a standard for collectibles: [ERC721 Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721) There are definitely upsides to use it: standard wallets could be used to display our collection (well, kind of), and less coding. The cons are the amount of boilerplate needed, since most of the use-cases are not applicable, especially trading seems unethical the least (however migrating to another account still should be possible). In the Unitize (SFBW) Hackathon due to the lack of time implementing and testing it was out of scope, but in the long run these advantages might worth a rethink.

## What is not in the repo or should be configured

- In .truffle-config under the Ropsten network an account must be specified, change it to yours. It's private key is supposed to be in /.secret
- .firebase-local.env If you plan to test it locally.

## Prerequisites

- Firebase account

## Project setup

```
npm install
```

In the main and the functions directory.

### Compiles and hot-reloads for development

```
npm run serve
```

and start Truffle

### Compiles and minifies for production

Deploy to the chosen network

```
npm run build
firebase deploy
```

### Lints and fixes files

```
npm run lint
```
