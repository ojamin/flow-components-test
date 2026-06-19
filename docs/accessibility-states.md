# Accessibility States

## Purpose

This page defines the package docs entry point for accessible renderer and config-panel states.
It applies to built-in package components, extracted components, preview examples, and config panels.

## Baseline expectations

- Use semantic elements for renderer output whenever native semantics fit the component.
- Use semantic controls, visible labels, accessible names, helper text, and validation messages for config-panel UI.
- Keep keyboard access available where a renderer or config panel exposes interactive controls.
- Keep focus indicators visible and consistent with the design system.
- Represent disabled, loading, empty, error, selected, and invalid states in a way that is understandable without relying only on color.
- Verify responsive focus order, readable text, target sizes, and overflow behavior in package preview device states; component UI may differ from app chrome, but accessibility expectations do not change.
- Cover meaningful fixture states in tests or preview examples so empty, loading, error, disabled, focus, keyboard, long-content, and responsive behavior can be reviewed without app-only setup.
- Do not document unsupported behavior, stronger sandboxing, or unimplemented runtime/provider behavior as an accessibility or safety guarantee.

## Renderer accessibility

- Prefer native buttons, links, headings, tables, lists, form controls, and landmark semantics over custom roles.
- When custom roles are unavoidable, provide the required ARIA attributes, keyboard interactions, and state synchronization.
- Render loading states with appropriate status text or `aria-busy` context so assistive technology users can understand that content is pending.
- Render empty states as meaningful content, not blank space.
- Render errors as text that identifies the failure class and next safe action without exposing secrets or private source details.
- Preserve readable text, target sizing, and focus order across desktop and mobile preview sizes.

## Config-panel accessibility

- Every editable field must have a programmatic label.
- Helper text and validation text must be associated with the field they describe.
- Disabled fields must remain perceivable and explain the reason when the state is not obvious.
- Async checks must surface loading and error status near the affected control.
- Review-required or security-sensitive actions must not depend on color-only warnings.

## State checklist

- Empty: identifies missing data/configuration and does not present a dead interactive surface.
- Loading: communicates pending work and preserves layout enough to avoid disorienting jumps.
- Error: communicates the safe failure, avoids secret/path leakage, and keeps recovery controls reachable.
- Disabled: removes or blocks activation and communicates why the interaction is unavailable.
- Focus: keeps a visible indicator, logical order, and non-color-only state cue for keyboard and assistive technology users.
- Keyboard: supports activation, navigation, dismissal, and selection paths for interactive controls without requiring pointer-only gestures.
- Responsive: preserves semantics, focus order, target sizing, and readable content across the package preview device matrix.
- Fixture state: includes deterministic preview/test data for normal, empty, loading or simulated pending, error, disabled, selected/invalid, long-content, and responsive variants where relevant.
- Review-required: calls out executable-code and trust impact before the user accepts a source/update.
- Hash mismatch: blocks silent use and explains that repair requires reconnecting, pulling a trusted update, or switching to a known-good snapshot/source.

## Verification surfaces

Use component render tests for structural expectations and the preview app for manual state review:

```bash
npm run preview:dev
```

## References

- [Renderer guide](renderer-guide.md)
- [Config panel guide](config-panel-guide.md)
- [Testing guide](testing-guide.md)
