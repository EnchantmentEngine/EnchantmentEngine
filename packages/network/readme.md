# Network Package

The Network Package provides a comprehensive networking system for real-time multiplayer experiences. It handles peer-to-peer connections, data serialization, network state management, and entity synchronization across clients.

## Core Components

### NetworkObjectComponent
The main component for networked entities:
- Network ID management
- Owner peer tracking
- Authority tagging
- Entity synchronization

### NetworkState
Global network state management:
- Network configuration
- Peer connections
- Network schemas
- World and media network instances

## Network Systems

### IncomingNetworkSystem
Handles incoming network data:
- Data packet processing
- Jitter buffer management
- Data channel handling
- Action reception

### OutgoingNetworkSystem
Manages outgoing network data:
- Entity state serialization
- Data packet creation
- Network object authority
- Action transmission

### IncomingActionSystem
Processes incoming network actions:
- Action validation
- State updates
- Event handling
- Action routing

### OutgoingActionSystem
Handles outgoing network actions:
- Action queuing
- Action serialization
- Network transmission
- Action batching

## Network Features

### Peer Management
- Peer connection handling
- User ID management
- Peer transport setup
- Connection state tracking

### Data Channels
- Multiple channel types
- Channel registration
- Data buffering
- Channel handlers

### Serialization
- Entity state serialization
- Data compression
- Network ID management
- Schema-based serialization

### Network Actions
- Action definition
- Action validation
- Action routing
- State synchronization

## Usage Examples

### Creating a Networked Entity
```typescript
import { NetworkObjectComponent } from '@ir-engine/network'

const entity = createEntity()
setComponent(entity, NetworkObjectComponent, {
  networkId: NetworkObjectComponent.createNetworkId(),
  ownerPeer: peerId
})
```

### Handling Network Actions
```typescript
import { NetworkActionFunctions } from '@ir-engine/network'

// Send actions to peers
NetworkActionFunctions.sendActionsAsPeer(network, peerId, actions)

// Send actions as host
NetworkActionFunctions.sendActionsAsHost(network, actions)
```

### Managing Data Channels
```typescript
import { addDataChannelHandler, DataChannelType, removeDataChannelHandler } from '@ir-engine/network'

// Define a data channel type
const customDataChannelType = 'custom.dataChannel' as DataChannelType

// Register a data channel handler
const handler = (network: Network, dataChannel: DataChannelType, fromPeerID: PeerID, message: any) => {
  // Handle incoming data
  const data = new Uint8Array(message)
  // Process the data...
}

// Add the handler
addDataChannelHandler(customDataChannelType, handler)

// Remove the handler when no longer needed
removeDataChannelHandler(customDataChannelType, handler)
```

## World Network Actions

The primary API for networked state management in the engine is through `WorldNetworkAction`. This class provides a set of predefined actions for managing networked entities and their state in a deterministic and event-sourced manner.

### Action Definition and Structure

Actions are defined as static properties on the `WorldNetworkAction` class, using the `defineAction` function from hyperflux. Each action includes:
- A unique type identifier
- Required parameters with type validation
- Optional caching and topic settings
- Validation rules for action processing

```typescript
import { WorldNetworkAction } from '@ir-engine/network'

// Example of predefined actions
WorldNetworkAction.spawnEntity // Creates a new networked entity
WorldNetworkAction.destroyEntity // Removes a networked entity
WorldNetworkAction.requestAuthorityOverObject // Requests authority over an entity
WorldNetworkAction.transferAuthorityOfObject // Transfers authority to another peer
```

### Action Parameters and Validation

Each action has specific parameters and validation rules:

```typescript
// Example of spawnEntity action structure
{
  type: 'ee.network.SPAWN_ENTITY',
  entityUUID: matchesEntityUUID,
  parentUUID: matchesEntityUUID,
  ownerID: matchesWithDefault(matchesUserID, () => getState(EngineState).userID),
  authorityPeerId: matchesPeerID.optional(),
  $cache: true,
  $topic: NetworkTopics.world
}
```

### Action Dispatching

Actions are dispatched using the `dispatchAction` function from hyperflux:

```typescript
import { dispatchAction } from '@ir-engine/hyperflux'

// Spawn a new networked entity
dispatchAction(WorldNetworkAction.spawnEntity({
  entityUUID: uuid,
  parentUUID: parentUUID,
  ownerID: userID,
  authorityPeerId: peerID
}))
```

### Action Reception and State Updates

Actions are received and processed through receptors defined in state definitions. These receptors:
- Validate the action
- Update the state
- Trigger side effects

```typescript
// Example from EntityNetworkState
receptors: {
  onSpawnObject: WorldNetworkAction.spawnEntity
    .receive((action) => {
      getMutableState(EntityNetworkState)[action.entityUUID].merge({
        parentUUID: action.parentUUID,
        ownerId: action.ownerID,
        authorityPeerId: action.authorityPeerId ?? action.$peer,
        ownerPeer: action.$peer
      })
    })
    .validate((action) => {
      if (action.ownerID !== action.$user) return false
      return true
    })
}
```

### Event Sourced State Management

The network system uses an event sourcing pattern where:

1. **Action Creation**:
   - Actions are created with specific types and validated parameters
   - Each action includes metadata like timestamps and peer information
   - Actions are immutable once created

2. **Action Storage**:
   - Actions are stored in a sequence
   - Each action is uniquely identified
   - Actions include all necessary data for state reconstruction

3. **State Derivation**:
   - State is derived by applying actions in order
   - Each action's receptor updates the state
   - State updates are deterministic

4. **Action Replay**:
   - Actions can be replayed to reconstruct state
   - State is always consistent across peers
   - Network latency is handled through action ordering

### Authority and Ownership

The system manages entity authority and ownership through specific actions:

```typescript
// Request authority over an entity
dispatchAction(WorldNetworkAction.requestAuthorityOverObject({
  entityUUID: uuid,
  newAuthority: peerID
}))

// Transfer authority to another peer
dispatchAction(WorldNetworkAction.transferAuthorityOfObject({
  ownerID: userID,
  entityUUID: uuid,
  newAuthority: peerID
}))
```

### State Reconciliation

The system handles state reconciliation through:
- Action validation before processing
- Authority transfer protocols
- Owner-based permission checks
- Peer connection state management

### Best Practices for World Network Actions

1. **Action Usage**:
   - Use predefined actions when possible
   - Follow the established action patterns
   - Include all required parameters
   - Validate action parameters before dispatch

2. **State Management**:
   - Keep state updates atomic
   - Handle authority transfers properly
   - Manage entity lifecycle through actions
   - Consider network conditions

3. **Error Handling**:
   - Implement proper validation
   - Handle action failures gracefully
   - Log important state changes
   - Provide fallback mechanisms

4. **Performance**:
   - Minimize action frequency
   - Use appropriate caching
   - Consider network bandwidth
   - Handle action batching

## Best Practices

1. Network State Management:
   - Keep network state minimal
   - Use appropriate serialization
   - Handle disconnections gracefully
   - Implement reconnection logic

2. Entity Synchronization:
   - Use authority tags appropriately
   - Implement interpolation
   - Handle prediction and reconciliation
   - Manage entity lifecycle

3. Data Channels:
   - Use appropriate channel types
   - Implement proper buffering
   - Handle channel errors
   - Clean up channel handlers

4. Network Actions:
   - Validate actions thoroughly
   - Implement proper routing
   - Handle action conflicts
   - Manage action queues

5. Performance Optimization:
   - Minimize network traffic
   - Use appropriate compression
   - Implement rate limiting
   - Handle network latency 