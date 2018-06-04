Feature: using feature files in jest
  As a developer
  I want to write tests in cucumber
  So that the business can understand my tests

  Scenario: A simple arithmetic test
    Given I have numbers 3 and 4
    When I add them the numbers
    Then I get 7

  Scenario Outline: A simple arithmetic test
    Given I have numbers <num1> and <num2>
    When I add them
    Then I get <total>

  Examples:
    | num1 | num2 | total |
    | 3    | 4    | 7     |
