Feature: Skipping and pending within tests

  Scenario: I can pass a regualr test
    When it passes in the test framework

  Scenario: I can skip a test so it does not execute
    Then it is skipped in the test framework

  Scenario: I can declare a test pending, so that it will not execute
    Then it is pending in the test framework
