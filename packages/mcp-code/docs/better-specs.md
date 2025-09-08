---
title: Better Specs
description: A copy of betterspecs.org guidelines adapted for LLM code generation
url: https://www.betterspecs.org/
---

# Better Specs

## Describe Your Methods

Be clear about what method you are describing. For instance, use the Ruby documentation convention of `.` (or `::`) when referring to a class method's name and `#` when referring to an instance method's name.

**Bad:**

```ruby
describe 'the authenticate method for User' do
describe 'if the user is an admin' do
```

**Good:**

```ruby
describe '.authenticate' do
describe '#admin?' do
```

## Use contexts

Contexts are a powerful method to make your tests clear and well organized (they keep tests easy to read). When describing a context, start its description with 'when', 'with' or 'without'.

**Bad:**

```ruby
it 'has 200 status code if logged in' do
  expect(response).to respond_with 200
end

it 'has 401 status code if not logged in' do
  expect(response).to respond_with 401
end
```

**Good:**

```ruby
context 'when logged in' do
  it { is_expected.to respond_with 200 }
end

context 'when logged out' do
  it { is_expected.to respond_with 401 }
end
```

## Keep your description short

A spec description should never be longer than 40 characters. If this happens you should split it using a context.

**Bad:**

```ruby
it 'has 422 status code if an unexpected params will be added' do
```

**Good:**

```ruby
context 'when not valid' do
  it { is_expected.to respond_with 422 }
end
```

In the example we removed the description related to the status code, which has been replaced by the expectation `is_expected`. If you run this test typing `rspec filename` you will obtain a readable output.

**Formatted output:**

```ruby
when not valid
  it should respond with 422
```

## Single expectation test

The 'one expectation' tip is more broadly expressed as 'each test should make only one assertion'. This helps you on finding possible errors, going directly to the failing test, and to make your code readable. In isolated unit specs, you want each example to specify one (and only one) behavior. Multiple expectations in the same example are a signal that you may be specifying multiple behaviors.

**Good (isolated):**

```ruby
it { is_expected.to respond_with_content_type(:json) }
it { is_expected.to assign_to(:resource) }
```

Anyway, in tests that are not isolated (e.g. ones that integrate with a DB, an external webservice, or end-to-end-tests), you take a massive performance hit to do the same setup over and over again, just to set a different expectation in each test. In these sorts of slower tests, I think it's fine to specify more than one isolated behavior.

**Good (not isolated):**

```ruby
it 'creates a resource' do
  expect(response).to respond_with_content_type(:json)
  expect(response).to assign_to(:resource)
end
```

## Test all possible cases

Testing is a good practice, but if you do not test the edge cases, it will not be useful. Test valid, edge and invalid case. For example, consider the following action.

**Destroy Action:**

```ruby
before_action :find_owned_resources
before_action :find_resource

def destroy
  render 'show'
  @consumption.destroy
end
```

The error I usually see lies in testing only whether the resource has been removed. But there are at least two edge cases: when the resource is not found and when it's not owned. As a rule of thumb think of all the possible inputs and test them.

**Bad:**

```ruby
it 'shows the resource'
```

**Good:**

```ruby
describe '#destroy' do

  context 'when resource is found' do
    it 'responds with 200'
    it 'shows the resource'
  end

  context 'when resource is not found' do
    it 'responds with 404'
  end

  context 'when resource is not owned' do
    it 'responds with 404'
  end
end
```

## Expect vs Should syntax

On new projects always use the `expect` syntax.

**Bad:**

```ruby
it 'creates a resource' do
  response.should respond_with_content_type(:json)
end
```

**Good:**

```ruby
it 'creates a resource' do
  expect(response).to respond_with_content_type(:json)
end
```

Configure the RSpec to only accept the new syntax on new projects, to avoid having the 2 syntax all over the place.

**Good:**

```ruby
# spec_helper.rb
RSpec.configure do |config|
  # ...
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end
```

On one line expectations or with implicit subject we should use `is_expected.to`.

**Bad:**

```ruby
context 'when not valid' do
  it { should respond_with 422 }
end
```

**Good:**

```ruby
context 'when not valid' do
  it { is_expected.to respond_with 422 }
end
```

On old projects you can use the [transpec](https://github.com/yujinakayama/transpec) to convert them to the new syntax. More about the new RSpec expectation syntax can be found [here](http://rspec.info/blog/2012/06/rspecs-new-expectation-syntax/) and [here](http://rspec.info/blog/2013/07/the-plan-for-rspec-3/#what_about_the_old_expectationmock_syntax).

## Use subject

If you have several tests related to the same subject use `subject{}` to DRY them up.

**Bad:**

```ruby
it { expect(assigns('message')).to match /it was born in Belville/ }
```

**Good:**

```ruby
subject { assigns('message') }
it { is_expected.to match /it was born in Billville/ }
```

RSpec has also the ability to use a named subject (learn more about [rspec subject](https://rspec.info/features/3-12/rspec-core/subject/)).

**Good:**

```ruby
subject(:hero) { Hero.first }
it "carries a sword" do
  expect(hero.equipment).to include "sword"
end
```

## Use let and let!

When you have to assign a variable instead of using a `before` block to create an instance variable, use `let`. Using `let` the variable lazy loads only when it is used the first time in the test and get cached until that specific test is finished. A really good and deep description of what `let` does can be found in this [stackoverflow answer](http://stackoverflow.com/questions/5359558/when-to-use-rspec-let/5359979#5359979).

**Bad:**

```ruby
describe '#type_id' do
  before { @resource = FactoryBot.create :device }
  before { @type     = Type.find @resource.type_id }

  it 'sets the type_id field' do
    expect(@resource.type_id).to eq(@type.id)
  end
end
```

**Good:**

```ruby
describe '#type_id' do
  let(:resource) { FactoryBot.create :device }
  let(:type)     { Type.find resource.type_id }

  it 'sets the type_id field' do
    expect(resource.type_id).to eq(type.id)
  end
end
```

Use `let` to initialize actions that are lazy loaded to test your specs.

**Good:**

```ruby
context 'when updates a not existing property value' do
  let(:properties) { { id: Settings.resource_id, value: 'on'} }

  def update
    resource.properties = properties
  end

  it 'raises a not found error' do
    expect { update }.to raise_error Mongoid::Errors::DocumentNotFound
  end
end
```

Use `let!` if you want to define the variable when the block is defined. This can be useful to populate your database to test queries or scopes. Here an example of what let actually is (learn more about [rspec let](https://rspec.info/features/3-12/rspec-core/helper-methods/let/)).

**Explanation:**

```ruby
# this use of let
let(:foo) { Foo.new }

# is very nearly equivalent to this:
def foo
  @foo ||= Foo.new
end
```

## Mock or not to mock

As general rule do not (over)use mocks and test real behavior when possible, as testing real cases is useful when validating your application flow.

**Good:**

```ruby
# simulate a not found resource
context "when not found" do

  before do
    allow(Resource).to receive(:where).with(created_from: params[:id])
      .and_return(false)
  end

  it { is_expected.to respond_with 404 }
end
```

Mocking makes your specs faster but they are difficult to use. You need to understand them well to use them well. Read [this article](https://web.archive.org/web/20220612005103/http://myronmars.to/n/dev-blog/2012/06/thoughts-on-mocking) to learn more about mocks.

## Create only the data you need

If you have ever worked in a medium size project (but also in small ones), test suites can be heavy to run. To solve this problem, it's important not to load more data than needed. Also, if you think you need dozens of records, you are probably wrong.

**Good:**

```ruby
describe "User" do
  describe ".top" do
    before { FactoryBot.create_list(:user, 3) }
    it { expect(User.top(2)).to have(2).item }
  end
end
```

## Use factories and not fixtures

This is an old topic, but it's still good to remember it. Do not use fixtures because they are difficult to control, use factories instead. Use them to reduce the verbosity on creating new data (learn about [Factory Bot](https://github.com/thoughtbot/factory_bot)).

**Bad:**

```ruby
user = User.create(
  name: 'Genoveffa',
  surname: 'Piccolina',
  city: 'Billyville',
  birth: '17 Agoust 1982',
  active: true
)
```

**Good:**

```ruby
user = FactoryBot.create :user
```

One important note. When talking about unit tests the best practice would be to use neither fixtures or factories. Put as much of your domain logic in libraries that can be tested without needing complex, time consuming setup with either factories or fixtures. Read more in [this article](http://blog.steveklabnik.com/posts/2012-07-14-why-i-don-t-like-factory_girl).

## Easy to read matchers

Use readable matchers and double check the available [rspec matchers](https://rspec.info/features/3-12/rspec-expectations/built-in-matchers/).

**Bad:**

```ruby
lambda { model.save! }.to raise_error Mongoid::Errors::DocumentNotFound
```

**Good:**

```ruby
expect { model.save! }.to raise_error Mongoid::Errors::DocumentNotFound
```

## Shared Examples

Making tests is great and you get more confident day after day. But in the end you will start to see code duplication coming up everywhere. Use shared examples to DRY your test suite up.

**Bad:**

```ruby
describe 'GET /devices' do

  let!(:resource) { FactoryBot.create :device, created_from: user.id }
  let!(:uri)      { '/devices' }

  context 'when shows all resources' do

    let!(:not_owned) { FactoryBot.create factory }

    it 'shows all owned resources' do
      page.driver.get uri
      expect(page.status_code).to be(200)
      contains_owned_resource resource
      does_not_contain_resource not_owned
    end
  end

  describe '?start=:uri' do

    it 'shows the next page' do

      page.driver.get uri, start: resource.uri
      expect(page.status_code).to be(200)
      contains_resource resources.first
      expect(page).to_not have_content resource.id.to_s
    end
  end
end
```

**Good:**

```ruby
describe 'GET /devices' do

  let!(:resource) { FactoryBot.create :device, created_from: user.id }
  let!(:uri)       { '/devices' }

  it_behaves_like 'a listable resource'
  it_behaves_like 'a paginable resource'
  it_behaves_like 'a searchable resource'
  it_behaves_like 'a filterable list'
end
```

In our experience, shared examples are used mainly for controllers. Since models are pretty different from each other, they (usually) do not share much logic. Learn more about [rspec shared examples](https://rspec.info/features/3-12/rspec-core/example-groups/shared-examples/).

## Test what you see

Deeply test your models and your application behaviour (integration tests). Do not add useless complexity testing controllers.

When I first started testing my apps I was testing controllers, now I don't. Now I only create integration tests using RSpec and Capybara. Why? Because I believe that you should test what you see and because testing controllers is an extra step you wont usually need. You'll find out that most of your tests go into the models and that integration tests can be easily grouped into shared examples, building a clear and readable test suite.

This is an open debate in the Ruby community and both sides have good arguments supporting their idea. People supporting the need of testing controllers will tell you that your integration tests don't cover all use cases and that they are slow. Both are wrong. You can easily cover all use cases (why shouldn't you?) and you can run single file specs using automated tools like Guard. In this way you will run only the specs you need to test blazing fast without stopping your flow.

## Don't use should

Do not use should when describing your tests. Use the third person in the present tense. Even better start using the new [expectation](http://rspec.info/blog/2012/06/rspecs-new-expectation-syntax/) syntax.

**Bad:**

```ruby
it 'should not change timings' do
  consumption.occur_at.should == valid.occur_at
end
```

**Good:**

```ruby
it 'does not change timings' do
  expect(consumption.occur_at).to eq(valid.occur_at)
end
```

See [the should_not gem](https://github.com/should-not/should_not) for a way to enforce this in RSpec and [the should_clean](https://github.com/siyelo/should_clean) gem for a way to clean up existing RSpec examples that begin with 'should.'
