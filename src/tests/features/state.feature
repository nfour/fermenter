Feature: State passing between tests

  Background:
    Given I have some state
    And I pass it to another step

  Scenario: I can inherit state from background
    Then the state matches

  Scenario: I can create new state for a scenario
    Given I have some state
    Then the state matches
