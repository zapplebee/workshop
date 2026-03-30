# conversations

This directory contains YAML conversation trees served by the Bun backend.

## Current Format

Each file defines:

- `actor`: which game actor owns the conversation
- `name`: display name shown in the dialogue UI
- `start`: starting node id
- `nodes`: map of node ids to dialogue nodes

Each node can define:

- `text`: the displayed dialogue line
- `animation`: the animation name to apply to the active actor while this node is shown
- `options`: buttons the player can choose

Each option can also define lightweight state rules:

- `requiresItems`: only show the option when the player has enough of the listed inventory items
- `removeItems`: remove inventory items when the option is chosen
- `requiresFlags`: only show the option when the listed world flags are set
- `setFlags`: set world flags when the option is chosen

Example:

```yaml
actor: mouse
name: Field Mouse
start: greeting
nodes:
  greeting:
    text: "Hello"
    animation: fright
    options:
      - label: "Hi"
        next: next_node
      - label: "Trade carrots"
        next: thanks
        requiresItems:
          - itemId: carrot
            amount: 3
        removeItems:
          - itemId: carrot
            amount: 3
        setFlags:
          - mouse.carrots_shared
```

## Adding a New Conversation

1. Add a new YAML file here.
2. Add the actor to the shared conversation registry if needed.
3. Ensure the actor's animation names match the component's action union.
4. If the conversation interacts with gameplay state, use inventory/world-flag fields rather than inventing ad hoc one-off logic.

## Rule

Conversation YAML should describe branching and presentation, not arbitrary app logic.

Recorded user decisions:

- physical, possessable things belong in inventory
- clues and other non-physical truth/state belong in world flags
- world flags should stay flat and human-readable, for example `rabbit.carrots_given`
- the raw flag ids are acceptable in debug UI; no friendly-label layer is required yet
