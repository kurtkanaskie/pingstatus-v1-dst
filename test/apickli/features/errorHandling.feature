@intg
Feature: Error handling
	As an API consumer
	I want consistent and meaningful error responses
	So that I can handle the errors correctly

	@invalidclientid
    Scenario: GET with invalid clientId
        Given I set clientId header to badapikey
        When I GET /ping
        Then response code should be 400
        And response header Content-Type should be application/json
        And response body path $.message should be missing or invalid clientId

	@invalid-clientid-for-resource
    Scenario: GET with invalid clientId for resource
        Given I set clientId header to `invalidClientId`
        When I GET /ping
        Then response code should be 400
        And response header Content-Type should be application/json
        And response body path $.code should be 400.01.001
        And response body path $.message should be missing or invalid clientId

	@foo
    Scenario: GET /foo request
        Given I set clientId header to `clientId`
        When I GET /foo
        Then response code should be 404
        And response header Content-Type should be application/json
        And response body path $.message should be Resource not found at /foo
        
	@foobar
    Scenario: GET /foo/bar request
        Given I set clientId header to `clientId`
        When I GET /foo/bar
        Then response code should be 404
        And response header Content-Type should be application/json
        And response body path $.message should be Resource not found at /foo/bar
        
