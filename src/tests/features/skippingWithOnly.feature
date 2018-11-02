Feature: Skipping other tests when setting only on one
  Scenario: This shouldnt run
    Then it does not run

  Scenario: This is the only test that should run
    Then it runs


  Scenario: This also shouldnt run
    Then it does not run
