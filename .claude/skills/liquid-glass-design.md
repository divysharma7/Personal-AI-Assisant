---
name: liquid-glass-design
description: iOS 26 Liquid Glass design system — dynamic glass material with blur, reflection, and interactive morphing for SwiftUI, UIKit, and WidgetKit.
---

# Liquid Glass Design System (iOS 26)

Patterns for implementing Apple's Liquid Glass — a dynamic material that blurs content behind it, reflects color and light from surrounding content, and reacts to touch and pointer interactions. Covers SwiftUI, UIKit, and WidgetKit integration.

## When to Activate

- Building or updating apps for iOS 26+ with the new design language
- Implementing glass-style buttons, cards, toolbars, or containers
- Creating morphing transitions between glass elements
- Applying Liquid Glass effects to widgets
- Migrating existing blur/material effects to the new Liquid Glass API

## Core Pattern — SwiftUI

### Basic Glass Effect

```swift
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect()
```

### Customizing Shape and Tint

```swift
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect(.regular.tint(.orange).interactive(), in: .rect(cornerRadius: 16.0))
```

### Glass Button Styles

```swift
Button("Click Me") { /* action */ }
    .buttonStyle(.glass)

Button("Important") { /* action */ }
    .buttonStyle(.glassProminent)
```

### GlassEffectContainer for Multiple Elements

```swift
GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "scribble.variable")
            .frame(width: 80.0, height: 80.0)
            .glassEffect()
        Image(systemName: "eraser.fill")
            .frame(width: 80.0, height: 80.0)
            .glassEffect()
    }
}
```

### Morphing Transitions

```swift
@State private var isExpanded = false
@Namespace private var namespace

GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "scribble.variable")
            .frame(width: 80.0, height: 80.0)
            .glassEffect()
            .glassEffectID("pencil", in: namespace)
        if isExpanded {
            Image(systemName: "eraser.fill")
                .frame(width: 80.0, height: 80.0)
                .glassEffect()
                .glassEffectID("eraser", in: namespace)
        }
    }
}
```

## Best Practices

- Always use GlassEffectContainer when applying glass to multiple sibling views
- Apply `.glassEffect()` after other appearance modifiers
- Use `.interactive()` only on elements that respond to user interaction
- Choose spacing carefully in containers to control when effects merge
- Use `withAnimation` for smooth morphing transitions
- Test across light mode, dark mode, and accented/tinted modes
- Ensure accessibility contrast — text on glass must remain readable

## Anti-Patterns

- Multiple standalone `.glassEffect()` views without a GlassEffectContainer
- Nesting too many glass effects — degrades performance and visual clarity
- Applying glass to every view — reserve for interactive elements and cards
- Using opaque backgrounds behind glass — defeats the translucency effect
