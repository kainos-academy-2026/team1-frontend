Feature: Home page
  As a potential applicant
  I want to open the careers home page
  So that I can start browsing roles

  Scenario: Visitor can load the home page
    Given the frontend app is running in test mode
    When I request the home page
    Then I should see the careers welcome heading
