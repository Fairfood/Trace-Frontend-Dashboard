**SCSS Style Guide for Angular Applications**

---

**1. Class Naming Convention:**

- Use kebab-case for class names.
- Example: `.example-one`, `.another-example`

**2. Nesting:**

- Avoid excessive nesting to keep styles maintainable and prevent specificity issues.
- Limit nesting to 3 levels whenever possible.

**3. Variables:**

- Use meaningful variable names.
- Group related variables together.
- For color avoid scss color variables instead use css variables


**4. Mixins:**

- Use mixins for reusable styles.
- Example:
  ```scss
  @mixin text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  ```

**5. Functions:**

- Use functions for calculations or transformations.
- Prefix function names with `func-`.
- Example:
  ```scss
  @function func-calculate-grid-width($columns, $total-columns: 12) {
    @return percentage($columns / $total-columns);
  }
  ```

**6. Importing:**

- Import global styles first, followed by component-specific styles.
- Use relative paths for importing.
- Example:
  ```scss
  @import 'variables';
  @import '../shared/styles';
  @import 'components/example';
  ```

**7. Comments:**

- Use comments to describe the purpose of styles or provide context.
- Keep comments concise and meaningful.
- Example:
  ```scss
  // Header Styles
  .header {
    background-color: $primary-color; // Set header background color
  }
  ```



**8. Formatting:**

- Use consistent indentation (usually 2 or 4 spaces).
- Use a single space between property and value.
- Example:
  ```scss
  .example {
    color: $primary-color;
    font-size: 16px;
  }
  ```

---

By following this SCSS style guide, you'll ensure consistency, readability, and maintainability in your Angular application's stylesheets.