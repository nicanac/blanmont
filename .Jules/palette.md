## 2025-02-14 - Improve Checkout Form Accessibility
**Learning:** Found that multiple input fields in `app/checkout/page.tsx` lacked explicitly linked `<label>`s via the `htmlFor` and `id` pairing. While they had textual labels appearing near them, without an ID linking the elements, screen readers could struggle to properly contextualize the inputs.
**Action:** Adding `<label htmlFor="id">` and `<input id="id">` explicitly pairs them, meeting the Good UX guidelines specified for accessibility in forms.
