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

[![Walkthrough](http://img.youtube.com/vi/OOp05uRVFbQ/0.jpg)](http://www.youtube.com/watch?v=OOp05uRVFbQ)

Disclaimer:

- Brave browser seems to have problems with Firebase login, you must set "All cookies allowed" under Brave shields
- Some authorization checking is missing, the UI/UX is definitely lacking, and please don't start on the code quality, a clean up is on schedule very soon.
- The BSI (futanet.hu) Oracle was reverse engineered, so it can stop working any time, since I am not associated with them in any way, so probably they won't notify me before changing anything.
- The medal claim transaction will be signed in the cloud function, soon...

### Why not ERC 721
There is a standard for collectibles: [ERC721 Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721) There are definitely upsides to use it: standard wallets could be used to display our collection (well, kind of), and less coding. The cons are the amount of boilerplate needed, since most of the use-cases are not applicable, especially trading seems unethical the least (however migrating to another account still should be possible). In the Unitize (SFBW) Hackathon due to the lack of time implementing and testing it was out of scope, but in the long run these advantages might worth a rethink.

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
