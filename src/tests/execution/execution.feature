Feature: Test Execution
  Scenario: Failing steps exit a scenario gracefully
    Given A step which passes
    When This step fails
    Then This step's function should not execute

