---
title: Spec Guidelines
description: Additional testing guidelines beyond Better Specs
---

## Articles and Copulas

Use articles ('a', 'an', 'the') and copulas (is/are) in test descriptions. When the test block has an implicit subject, start with a copula.

```ruby
# Bad
describe "when template includes partial"
describe "when URI is preceded by @"

# Good
describe "when the template includes a partial"
describe "when the URI is preceded by a @"
```

## When to Mock

Use mocks sparingly, typically only when simulating external APIs or when calling something would have a side effect that can't be easily reverted in a test context. Test real behavior when possible.

```ruby
# Good (mocking external API)
before { allow(WeatherService).to receive(:current_temperature).and_return(72) }

# Good (mocking side effects)
before { allow(File).to receive(:delete).and_return(true) }
```

## Testing Data

When creating undifferentiated lists of records, 3 is usually the right number.

```ruby
# Good
let(:user) { FactoryBot.create_list(:user, 3) }
```
