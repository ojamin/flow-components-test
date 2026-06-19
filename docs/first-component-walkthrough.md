# First component walkthrough

## Purpose

This walkthrough shows the package-local flow for adding a small component to Flow Components Test.

## Steps

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Preview the scaffold output:

   ```bash
   npm run scaffold -- --group content --folder promo-banner --id demo.promo-banner --display-name "Promo Banner" --dry-run
   ```

3. Create the component when the paths and ID look correct:

   ```bash
   npm run scaffold -- --group content --folder promo-banner --id demo.promo-banner --display-name "Promo Banner"
   ```

4. Implement component behavior in its folder under `src/groups/<group>/<folder>/`.

5. Regenerate and verify:

   ```bash
   npm run generate
   npm run validate
   npm run test:components
   ```

## Notes

- Use `demo.<name>` IDs for this repository's demo components unless a maintainer assigns a different namespace.
- Keep fixtures deterministic and free of credentials, customer data, hidden files, absolute local paths, or restricted source details.
