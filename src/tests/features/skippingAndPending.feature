Feature: Skipping and pending within tests

  Scenario: I can pass a regular test
    When it passes in the test framework

  Scenario: I can skip a test so it does not execute
    Then it is skipped in the test framework

  Scenario: This test isnt tested and should be considered pending
    Then it is skipped in the test framework
