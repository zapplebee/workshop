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
```

## Adding a New Conversation

1. Add a new YAML file here.
2. Add a Bun route in `src/index.ts` to serve it.
3. Include the actor in app-level conversation loading if needed.
4. Ensure the actor's animation names match the component's action union.

## Rule

Conversation YAML should describe branching and presentation, not arbitrary app logic.
