@math
Feature: using feature files in jest
  As a developer
  I want to write tests in cucumber
  So that the business can understand my tests

  Background: Bananas
    Given I can calculate

  @addition
  Scenario: A simple addition test
    Given I have numbers 3 and 4
    When I add the numbers
    Then I get 7

  @multiplication
  Scenario: A simple multiplication test
    Given I have numbers 3 and 4
    When I multiply the numbers
    Then I get 12

  @substraction
  Scenario Outline: A simple substraction test
    Given I have numbers <num1> and <num2>
    When I substract the numbers
    Then I get <total>

    Examples:
      | num1 | num2 | total |
      | 3    | 4    | -1    |
      | 10   | 2    | 8     |

