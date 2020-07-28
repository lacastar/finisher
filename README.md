# finisher

## Collect your finishing medals and validated results on blockchain

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

[![Walkthrough](http://img.youtube.com/vi/H57dR5dLV7g/0.jpg)](http://www.youtube.com/watch?v=H57dR5dLV7g)

Disclaimer:

- Some authorization checking is missing, the UI/UX is definitely lacking, and please don't start on the code quality, a clean up is on schedule very soon.
- The BSI (futanet.hu) Oracle was reverse engineered, so it can stop working any time, since I am not associated with them in any way, so probably they won't notify me before changing anything.
- The medal claim transaction will be signed in the cloud function, soon...

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
