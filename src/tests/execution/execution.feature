Feature: Test Execution
  Scenario: Failing steps exit a scenario gracefully
    Given A step which passes
    When This step fails
    Then This step's function should not execute

  Scenario: Steps are skipped when their function is omitted
    Then this test should be skipped
    And this test should also be skipped

