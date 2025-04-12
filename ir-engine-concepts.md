# IR Engine Core Concepts & Nomenclature

This document provides a comprehensive overview of the core concepts and terminology used in the IR Engine's core packages: hyperflux, ecs, network, spatial, engine, editor, and ui.

## Table of Contents

- [Hyperflux](#hyperflux)
- [ECS (Entity Component System)](#ecs-entity-component-system)
- [Network](#network)
- [Spatial](#spatial)
- [Engine](#engine)
- [Editor](#editor)
- [UI](#ui)

## Hyperflux

Hyperflux is a reactive state management library designed for both local and agent-centric networked applications. It builds on Hookstate and provides utilities to define and manage state, create and dispatch type-safe and validated actions, and integrate with React via reactors.

### Core Concepts

- **HyperStore**: The central store that manages state and actions. Created with `createHyperStore()`.
- **State Definitions**: Strongly typed state slices created with `defineState()`.
- **Actions**: Type-safe actions defined with `defineAction()` and dispatched with `dispatchAction()`.
- **Reactors**: Isolated React trees for reactive logic operations, started with `startReactor()`.
- **Receptors**: Functions that listen for specific actions and update state accordingly.

### Key Functions

- `createHyperStore()`: Initializes a store for state management.
- `defineState()`: Creates strongly typed state definitions.
- `getState()`: Retrieves immutable read-only state.
- `getMutableState()`: Returns mutable state that can be updated.
- `defineAction()`: Creates strongly typed actions.
- `dispatchAction()`: Dispatches actions to the store.
- `startReactor()`: Starts an isolated React tree for reactive logic.

## ECS (Entity Component System)

ECS is a fast and reactive Entity-Component-System architecture implementation, using bitECS, hookstate, and React. It provides a framework for organizing game objects and their behaviors.

### Core Concepts

- **Entity**: A unique identifier (number) that represents an object in the world.
- **Component**: Data containers attached to entities. Define properties but not behaviors.
- **System**: Logic that operates on entities with specific components.
- **Query**: A way to find entities with specific component combinations.
- **Layer**: A categorization system for entities (e.g., Simulation, UI).

### Key Functions

- `createEntity()`: Creates a new entity in the ECS.
- `removeEntity()`: Removes an entity from the ECS.
- `defineComponent()`: Creates a new component type.
- `setComponent()`: Attaches a component to an entity.
- `getComponent()`: Retrieves a component from an entity.
- `removeComponent()`: Removes a component from an entity.
- `defineQuery()`: Creates a query to find entities with specific components.
- `defineSystem()`: Defines a system that operates on entities.
- `executeSystem()`: Executes a system on the world.

### System Groups

- `InputSystemGroup`: Systems that process input.
- `SimulationSystemGroup`: Systems that handle physics and game logic.
- `AnimationSystemGroup`: Systems that update animations.
- `PresentationSystemGroup`: Systems that handle rendering and presentation.

## Network

The Network package provides networking abstractions and APIs for the engine, enabling multiplayer and networked experiences.

### Core Concepts

- **Network**: A class that manages connections between peers.
- **NetworkID**: A unique identifier for a network.
- **PeerID**: A unique identifier for a peer in a network.
- **Topic**: A class of networks, used to distinguish between multiple networks of the same type.
- **DataChannel**: A communication channel for specific types of data.
- **Transport**: Interface for sending and receiving messages.

### Network Topics

- `world`: Used for world state synchronization.
- `media`: Used for media streaming.

### Key Functions

- `createNetwork()`: Creates a new network.
- `messageToPeer()`: Sends a message to a specific peer.
- `messageToAll()`: Sends a message to all peers.
- `bufferToPeer()`: Sends buffered data to a specific peer.
- `bufferToAll()`: Sends buffered data to all peers.
- `addDataChannelHandler()`: Registers a handler for a data channel.
- `removeDataChannelHandler()`: Unregisters a handler for a data channel.

## Spatial

The Spatial package provides core spatial systems for the engine, including transforms, physics, rendering, and XR support.

### Core Concepts

- **Transform**: Defines position, rotation, and scale of entities in 3D space.
- **Physics**: Handles collision detection, rigid bodies, and physical simulations.
- **Camera**: Manages the viewpoint for rendering the scene.
- **Renderer**: Handles rendering of 3D objects.
- **XR**: Provides support for VR and AR experiences.

### Physics

- **RigidBody**: A physical object that can be affected by forces.
- **Collider**: A shape used for collision detection.
- **PhysicsWorld**: A container for physical simulations.
- **CollisionGroups**: Categories for filtering collisions.

### Transform

- **TransformComponent**: Stores position, rotation, and scale.
- **Matrix**: A 4x4 matrix representing a transformation.
- **BoundingBox**: A box that encloses an object for spatial queries.

### XR

- **XRSession**: A session for XR experiences.
- **ReferenceSpace**: A coordinate system for XR.
- **XRAnchor**: A point in the real world tracked by XR systems.

### Key Functions

- `computeTransformMatrix()`: Calculates the transformation matrix for an entity.
- `Physics.createWorld()`: Creates a physics world.
- `Physics.simulate()`: Advances the physics simulation.
- `Physics.createRigidBody()`: Creates a rigid body in the physics world.
- `Physics.attachCollider()`: Attaches a collider to a rigid body.

## Engine

The Engine package provides high-level game engine functionality, building on the ECS, Spatial, and Network packages.

### Core Concepts

- **Asset**: Resources used in the engine (models, textures, audio, etc.).
- **Scene**: A collection of entities that form a game level or environment.
- **Avatar**: A representation of a user in the virtual world.
- **GLTF**: A 3D model format used by the engine.
- **Material**: Defines how surfaces appear when rendered.

### Asset Types

- `Model`: 3D models (GLB, GLTF, VRM, etc.).
- `Material`: Surface appearance definitions.
- `Image`: Texture images (PNG, JPEG, etc.).
- `Video`: Video files (MP4, WEBM, etc.).
- `Audio`: Sound files (MP3, WAV, etc.).
- `Prefab`: Reusable entity templates.
- `Volumetric`: Volumetric video assets.

### Avatar

- **AvatarComponent**: Identifies an entity as an avatar.
- **AvatarControllerComponent**: Handles avatar movement and input.
- **AvatarAnimationSystem**: Manages avatar animations.

### Scene

- **SceneComponent**: Identifies an entity as part of a scene.
- **EnvironmentSystem**: Manages environmental effects.
- **LookAtSystem**: Makes entities face towards targets.
- **ParticleSystem**: Handles particle effects.

## Editor

The Editor package provides tools for creating and editing scenes, assets, and entities in the engine.

### Core Concepts

- **EditorState**: Manages the state of the editor.
- **SelectionState**: Tracks selected entities.
- **EditorControlFunctions**: Functions for manipulating entities.
- **EditorHistoryState**: Manages undo/redo functionality.
- **Panel**: A UI container for editor tools.

### Panels

- **ViewportPanel**: Shows the 3D scene.
- **HierarchyPanel**: Shows the entity hierarchy.
- **PropertiesPanel**: Shows and edits entity properties.
- **AssetsPanel**: Manages project assets.
- **MaterialsPanel**: Edits material properties.
- **VisualScriptPanel**: Visual programming interface.

### Gizmos

- **TransformGizmo**: Tool for moving, rotating, and scaling entities.
- **CameraGizmo**: Tool for manipulating cameras.

### Key Functions

- `EditorControlFunctions.createObjectFromSceneElement()`: Creates an entity from a scene element.
- `EditorControlFunctions.duplicateObject()`: Duplicates an entity.
- `EditorControlFunctions.removeObject()`: Removes an entity.
- `EditorHistoryFunctions.undo()`: Reverts the last action.
- `EditorHistoryFunctions.redo()`: Reapplies a previously undone action.

## UI

The UI package provides React components for building user interfaces in the engine and editor.

### Core Components

- **Button**: A clickable button.
- **InputGroup**: A group of related input controls.
- **NumericInput**: Input for numeric values.
- **SelectInput**: Dropdown selection input.
- **ColorInput**: Input for selecting colors.
- **Checkbox**: Toggle input for boolean values.
- **Popup**: A popup dialog or menu.
- **ErrorDialog**: A dialog for displaying errors.

### Property Editors

- **NodeEditor**: Base component for entity property editors.
- **TextNodeEditor**: Editor for text properties.
- **MaterialEditor**: Editor for material properties.
- **TransformEditor**: Editor for transform properties.

### Layout Components

- **DockLayout**: A dockable panel layout system.
- **Header**: A header bar component.
- **MoreOptionsMenu**: A menu for additional options.
- **Toolbar**: A toolbar for common actions.
