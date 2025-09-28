---
title: Spec Preferences
description: My preferences for writing specs in addition to the Better Specs guidelines
---

## Articles and Linking Verbs

Use proper articles ('a', 'an', 'the') and linking verbs ('is', 'are', 'has', 'does') in test descriptions. When testing a subject directly, start descriptions with linking verbs like "is", "are", "has", or "does".

```ruby
# Bad (missing articles)
describe "when template includes partial"
describe "when URI is preceded by @"

# Good (includes articles)
describe "when the template includes a partial"
describe "when the URI is preceded by an @"

# Bad (missing linking verbs for direct subject testing)
it "valid"
it "not saved"

# Good (starts with linking verbs)
it "is valid"
it "is not saved"
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
