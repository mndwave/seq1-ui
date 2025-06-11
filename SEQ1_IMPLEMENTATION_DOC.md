# SEQ1 Implementation Documentation

This document provides an overview of the SEQ1 UI implementation, designed to help Cursor understand the codebase structure and component relationships.

## Project Overview

SEQ1 is a music sequencer and device control interface with a vintage hardware-inspired design. The application allows users to:

- Control connected MIDI devices
- Manage device connections and configurations
- Create and edit musical sequences
- Chat with an AI assistant for music creation

## Core Components

### 1. App Structure

- `app/page.tsx` - Main entry point that assembles the UI
- `app/layout.tsx` - Root layout with font loading and theme provider
- `app/globals.css` - Global styles and animations

### 2. Main UI Components

#### GlobalTransport (`components/global-transport.tsx`)
- Top control bar with logo, play/loop controls, BPM, and time signature
- Project menu for file operations
- Manages all modal dialogs

#### DeviceRack (`components/device-rack.tsx`)
- Left sidebar that displays connected devices
- Manages device list and provides add/config functionality
- Contains DeviceCard components for each device

#### ChatWindow (`components/chat-window.tsx`)
- Main content area for AI interaction
- Displays conversation history
- Provides input for user messages

### 3. UI Elements

#### AnimatedLogo (`components/animated-logo.tsx`)
- Displays the SEQ1 logo with multi-stage animation
- Transitions from outline to solid with warming glow effect
- Provides skeuomorphic "valve warm-up" aesthetic

#### DeviceCard (`components/device-card.tsx`)
- Individual device display with connection toggle
- Shows MIDI activity indicators
- Differentiates between auto-detected and manually added devices

#### EmptyDeviceState (`components/empty-device-state.tsx`)
- Displays when no devices are connected to the DeviceRack
- Provides visual guidance and instructions for adding devices
- Maintains the vintage hardware aesthetic
- Includes a prominent "Add Device" button

#### Modal Components
- `SaveModal`, `SaveAsModal`, `OpenModal`, `ExportModal`
- `BpmModal`, `TimeSignatureModal`
- `AddDeviceModal`, `ConfigDeviceModal`
- `NewProjectModal`, `CloseProjectModal`

## Data Flow

### State Management

1. **Device State**
   - Devices are defined in `lib/mock-data.ts`
   - Device state is managed in `DeviceRack` component
   - Individual device state (connection) is managed in `DeviceCard`

2. **Transport State**
   - Play/pause, loop, BPM, and time signature state in `GlobalTransport`
   - Consolidated in the `TransportState` interface

3. **UI State**
   - Modal visibility managed in `GlobalTransport` via `ModalState`
   - Menu state (open/closed) in `GlobalTransport`
   - Chat state in `ChatWindow`

### Component Communication

- Parent-to-child: Props passing
- Child-to-parent: Callback functions
- Cross-component: State lifting

## Type Definitions

Core types are defined in `lib/types.ts`:

- `Device` - Hardware device representation
- `Message` - Chat message structure
- `LogoAnimationState` - Animation states for the logo
- `ProjectAction` - Actions available in the project menu

## Styling Approach

1. **Tailwind CSS**
   - Primary styling method with custom color scheme
   - Custom utilities in `globals.css`

2. **Animation Classes**
   - `animate-fadeIn`, `animate-slideIn`, `animate-glow`
   - `animate-logo-pulse`, `animate-logo-warming`

3. **Custom Patterns**
   - `.diagonal-stripes`, `.dot-pattern`
   - `.scanlines`, `.screen-shadow`

4. **Skeuomorphic Elements**
   - `.vintage-display`, `.segmented-display`
   - `.channel-button`, `.vintage-button`

## Key Features

1. **Responsive Design**
   - Small screen message for devices below 1024px width
   - Flexible layouts that adapt to available space

2. **Animations**
   - Logo animation sequence (outline → pulsing → solid → warming)
   - Transition animations for UI elements
   - MIDI activity indicators

3. **Modals**
   - Consistent design language across all modals
   - Focused functionality for specific tasks

## Implementation Notes for Cursor

1. **Component Relationships**
   - `GlobalTransport` is the parent for all modal components
   - `DeviceRack` is the parent for `DeviceCard` components
   - All components ultimately connect through `app/page.tsx`

2. **State Management Pattern**
   - Related state is consolidated in interfaces
   - State is managed at the appropriate component level
   - Callbacks are used for cross-component communication

3. **Animation System**
   - CSS animations defined in `globals.css`
   - Animation states managed in React components
   - Transitions triggered by state changes

4. **File Organization**
   - Components in `/components` directory
   - Pages in `/app` directory
   - Utilities and types in `/lib` directory

5. **Naming Conventions**
   - Components use PascalCase
   - Functions use camelCase
   - CSS classes use kebab-case via Tailwind

This documentation should help Cursor understand the structure and relationships within the SEQ1 codebase, making it easier to navigate and modify the application.
