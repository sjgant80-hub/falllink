# FallLink

**Persistent P2P networking library for the AI-Native Solutions estate.**

One WebRTC connection layer that every estate tool imports. STUN for NAT traversal, BroadcastChannel for same-origin auto-discovery, and manual offer/answer paste for cross-network handshakes. No signalling server. No tracking. Sovereign.

- **Live demo:** https://sjgant80-hub.github.io/falllink/
- **Library file:** [`falllink.js`](./falllink.js)
- **License:** MIT

---

## Why

Half the estate tools reinvent a WebRTC signalling layer. Mesh 89 Tracker built one. FallForge built one. Every new build starts from scratch. FallLink extracts that pattern into a reusable ES module so you import it in five lines and get peer-to-peer connectivity for free.

## Install

Vendor it:

```bash
curl -O https://sjgant80-hub.github.io/falllink/falllink.js
```

Or import direct:

```javascript
import { FallLink } from 'https://sjgant80-hub.github.io/falllink/falllink.js';
```

## Quick start

```javascript
import { FallLink } from './falllink.js';

const link = new FallLink({
  ownId: 'my-tool-node',
  // defaults are sensible: Google + Cloudflare STUN, 'fall-signal' channel
});

// same-origin auto-discovery (open two tabs, both call this)
link.startBroadcast();

// listen for peers coming up
link.on('peer', ({ peerId, wrapper }) => {
  console.log('peer connected:', peerId);
  wrapper.send({ hello: 'from ' + link.ownId });
});

// receive messages
link.on('message', ({ peerId, data }) => {
  console.log('from', peerId, ':', data);
});

// broadcast to all connected peers
link.broadcast({ type: 'ping', ts: Date.now() });
```

## Cross-network (out-of-band signaling)

STUN + BroadcastChannel only work same-origin. For cross-network peers, do the SDP handshake by pasting bundles through any channel (Signal, DM, email).

**Alice:**

```javascript
const { bundle, peerId } = await link.createOffer();
// send `bundle` to Bob via any channel
// Bob returns an answerBundle; then:
await link.acceptAnswer(answerBundle);
```

**Bob:**

```javascript
const { bundle } = await link.acceptOffer(aliceOfferBundle);
// send `bundle` back to Alice
```

Bundles are base64-encoded JSON with SDP + ICE candidates. Copy/pasteable in any text channel.

## Config

```javascript
new FallLink({
  ownId: string,              // your peer id (auto-generated if omitted)
  stunServers: [{urls:...}],  // defaults: Google + Cloudflare
  bootstrapPeers: [],         // reserved for future estate peer list
  signalChannel: 'fall-signal', // BroadcastChannel name
  pingIntervalMs: 3000
})
```

## API

| Method | Returns | Purpose |
|---|---|---|
| `startBroadcast()` | — | Begin same-origin auto-discovery |
| `stopBroadcast()` | — | Stop announcing |
| `createOffer()` | `{ bundle, peerId, wrapper }` | Create out-of-band offer bundle |
| `acceptOffer(bundle)` | `{ bundle, peerId, wrapper }` | Return an answer bundle |
| `acceptAnswer(bundle)` | `wrapper` | Complete a handshake as inviter |
| `connect(peerId, offer?)` | `wrapper` | Low-level connect |
| `broadcast(msg)` | `number` | Send to all open peers |
| `getPeers()` | `Array` | Snapshot of peer state |
| `ping(peerId)` | `number \| null` | Latency in ms |
| `destroy()` | — | Close everything |

**Events** (via `link.on(type, fn)` or standard `addEventListener`):

- `peer` — `{ peerId, wrapper }` when a connection opens
- `message` — `{ peerId, data, wrapper }` when a peer sends data
- `disconnect` — `{ peerId }` when a peer drops
- `latency` — `{ peerId, latency }` on each pong
- `broadcast` — `{ on: boolean }` when broadcast toggles
- `error` — `{ where, error }`

## Peer wrapper

Each peer is a plain object:

```
{
  peerId, remoteId, state ('connecting'|'connected'|'failed'|'closed'),
  latency (ms), dataChannel (RTCDataChannel), initiator (bool), addedAt,
  send(msg) -> bool, close()
}
```

## Estate context

Part of the [AI-Native Solutions estate](https://ai-nativesolutions.com). Companion to:

- [Mesh 89 Tracker](https://sjgant80-hub.github.io/mesh-89-tracker/) — the pattern this library extracts
- [FallColony](https://sjgant80-hub.github.io/fallcolony/) — agent-native settlement
- [FallHub](https://sjgant80-hub.github.io/fallhub/) — sovereign SMB OS

## License

MIT · AI-Native Solutions 2026
